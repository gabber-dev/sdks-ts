import { EventEmitter } from 'eventemitter3';
import type {
  IStreamPad,
  StreamPadEvents,
  PadDataType,
  PadConfig,
  AudioOptions,
  VideoOptions,
  BackendPadType,
  PadCategory,
  PadDataTypeDefinition,
  PadReference
} from './types';
import { isSourcePad, isSinkPad } from './types';

/**
 * StreamPad represents a connection point on a workflow node that can send or receive data.
 * It supports various types of data including audio streams, video streams, triggers, and generic data.
 *
 * @implements {IStreamPad}
 */
export class StreamPad extends EventEmitter<StreamPadEvents> implements IStreamPad {
  readonly id: string;
  readonly nodeId: string;
  readonly name: string;
  readonly dataType: PadDataType;
  readonly backendType?: BackendPadType | undefined;
  readonly category?: PadCategory | undefined;
  readonly allowedTypes?: PadDataTypeDefinition[] | undefined;
  readonly nextPads?: PadReference[] | undefined;
  readonly previousPad?: PadReference | null | undefined;

  private _value: any = null;
  private currentStream: MediaStream | null = null;
  private isConnected: boolean = false;
  private publishing: boolean = false;
  private subscribed: boolean = false;
  private livekitRoom: any = null;
  private outputElement: HTMLAudioElement | HTMLVideoElement | null = null;
  private isEnabled: boolean = true;
  private currentTrack: any = null;
  private autoManagedAudioElement: HTMLAudioElement | null = null;
  private autoManagedVideoElement: HTMLVideoElement | null = null;

  /**
   * Creates a new StreamPad instance.
   * @param {PadConfig} config - Configuration object for the pad
   */
  constructor(config: PadConfig) {
    super();
    this.id = config.id;
    this.nodeId = config.nodeId;
    this.name = config.name;
    this.dataType = config.dataType;
    this.backendType = config.backendType;
    this.category = config.category;
    this.allowedTypes = config.allowedTypes;
    this.nextPads = config.nextPads;
    this.previousPad = config.previousPad;
    this._value = config.value;
  }

  /**
   * Checks if this is a source pad based on its backend type.
   * @returns {boolean} True if this is a source pad
   */
  isSourcePad(): boolean {
    return this.backendType ? isSourcePad(this.backendType) : false;
  }

  /**
   * Checks if this is a sink pad based on its backend type.
   * @returns {boolean} True if this is a sink pad
   */
  isSinkPad(): boolean {
    return this.backendType ? isSinkPad(this.backendType) : false;
  }

  /**
   * Sets the HTML media element to output audio/video to.
   * Only valid for audio/video source pads.
   * Note: This will override any auto-managed element.
   *
   * @internal
   * @private
   * @param {HTMLAudioElement | HTMLVideoElement} element - The media element to output to
   * @throws {Error} If used on non-media pad or sink pad
   */
  private _setElement(element: HTMLAudioElement | HTMLVideoElement): void {
    if (this.dataType === 'audio' && !(element instanceof HTMLAudioElement)) {
      throw new Error('Audio pad requires HTMLAudioElement');
    }

    if (this.dataType === 'video' && !(element instanceof HTMLVideoElement)) {
      throw new Error('Video pad requires HTMLVideoElement');
    }

    if (!this.isSourcePad()) {
      throw new Error('Can only set element on source pads');
    }

    // Clean up any auto-managed elements
    if (this.autoManagedAudioElement) {
      this.autoManagedAudioElement.remove();
      this.autoManagedAudioElement = null;
    }
    if (this.autoManagedVideoElement) {
      this.autoManagedVideoElement.remove();
      this.autoManagedVideoElement = null;
    }

    this.outputElement = element;

    // If we already have a stream and are enabled, connect it
    if (this.currentStream && this.isEnabled) {
      element.srcObject = this.currentStream;
    }
  }

  /**
   * Enables or disables the audio track on this pad.
   * Only valid for audio pads. When disabled, the track will be disabled at the source
   * which is more efficient than just muting the audio element.
   *
   * If no audio element is provided, one will be automatically created and managed.
   *
   * @param {boolean} enabled - Whether to enable or disable the track
   * @param {object} [options] - Optional configuration
   * @param {HTMLAudioElement} [options.element] - Audio element to control (if not provided, will use auto-managed element)
   * @throws {Error} If used on non-audio pad
   */
  async setEnabled(enabled: boolean, options?: { element?: HTMLAudioElement }): Promise<void> {
    if (this.dataType !== 'audio') {
      throw new Error('Can only set enabled state on audio pads');
    }

    if (!this.isSourcePad()) {
      throw new Error('Can only set enabled state on source pads');
    }

    this.isEnabled = enabled;

    // If a custom element is provided, set it as our output element
    if (options?.element) {
      this._setElement(options.element);
    }

    // Determine which audio element to use
    let targetElement = this.outputElement;

    // If no element is provided or set, create and manage one automatically
    if (!targetElement && this.isSourcePad()) {
      if (!this.autoManagedAudioElement) {
        this.autoManagedAudioElement = document.createElement('audio');
        this.autoManagedAudioElement.autoplay = true;
        // Add to document but hide it
        this.autoManagedAudioElement.style.display = 'none';
        document.body.appendChild(this.autoManagedAudioElement);
      }
      targetElement = this.autoManagedAudioElement;
    }

    // If we have a LiveKit track and we're publishing (e.g. microphone), enable/disable it
    if (this.currentTrack && this.publishing) {
      try {
        if (this.livekitRoom?.localParticipant) {
          await this.livekitRoom.localParticipant.setTrackEnabled(this.currentTrack, enabled);
        }
      } catch (error) {
        console.warn(`Failed to ${enabled ? 'enable' : 'disable'} track:`, error);
      }
    }

    // Update the audio element if we have one
    if (targetElement) {
      if (enabled) {
        targetElement.muted = false;
        if (this.currentStream) {
          targetElement.srcObject = this.currentStream;
        }
      } else {
        targetElement.muted = true;
        targetElement.srcObject = null;
      }
    }
  }

  /**
   * Enables or disables the microphone for this pad.
   * Only valid for audio source pads.
   *
   * @param {boolean} enabled - Whether to enable or disable the microphone
   * @param {AudioOptions} [options] - Optional configuration for the microphone
   * @throws {Error} If used on non-audio pad or sink pad
   */
  async setMicrophoneEnabled(enabled: boolean, options?: AudioOptions): Promise<void> {
    if (this.dataType !== 'audio') {
      throw new Error('Can only set microphone on audio pads');
    }

    if (!this.isSourcePad()) {
      throw new Error('Cannot set microphone on sink pad');
    }

    if (!this.livekitRoom) {
      throw new Error('Cannot set microphone: not connected to LiveKit room');
    }

    // If a custom element is provided, set it as our output element
    if (options?.element) {
      this._setElement(options.element);
    }

    try {
      if (enabled) {
        // Check if microphone is available before trying to enable
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasMicrophone = devices.some(device => device.kind === 'audioinput');
          if (!hasMicrophone) {
            throw new Error('No microphone device found on this system');
          }
        } catch (deviceError) {
          const errorMsg = deviceError instanceof Error ? deviceError.message : String(deviceError);
          throw new Error(`Microphone device check failed: ${errorMsg}`);
        }

        // Check microphone permissions
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch (permissionError) {
          if (permissionError instanceof Error) {
            if (permissionError.name === 'NotAllowedError') {
              throw new Error('Microphone permission denied. Please allow microphone access in your browser settings.');
            } else if (permissionError.name === 'NotFoundError') {
              throw new Error('No microphone found. Please connect a microphone or check if another application is using it.');
            } else if (permissionError.name === 'NotReadableError') {
              throw new Error('Microphone is already in use by another application.');
            } else {
              throw new Error(`Microphone access failed: ${permissionError.message}`);
            }
          } else {
            throw new Error(`Microphone access failed: ${String(permissionError)}`);
          }
        }
      }

      await this.livekitRoom.localParticipant.setMicrophoneEnabled(enabled);
      this.publishing = enabled;
      this.isConnected = enabled;
      this.emit('connection-changed', enabled);

      // Update the audio element if we have one
      if (this.outputElement instanceof HTMLAudioElement) {
        if (enabled) {
          this.outputElement.muted = false;
          if (this.currentStream) {
            this.outputElement.srcObject = this.currentStream;
          }
        } else {
          this.outputElement.muted = true;
          this.outputElement.srcObject = null;
        }
      }
    } catch (error) {
      throw new Error(`Failed to ${enabled ? 'enable' : 'disable'} microphone on pad ${this.id}: ${error}`);
    }
  }

  /**
   * Enables or disables the camera for this pad.
   * Only valid for video source pads.
   *
   * @param {boolean} enabled - Whether to enable or disable the camera
   * @param {VideoOptions} [options] - Optional configuration for the camera
   * @throws {Error} If used on non-video pad or sink pad
   */
  async setVideoEnabled(enabled: boolean, options?: VideoOptions): Promise<void> {
    if (this.dataType !== 'video') {
      throw new Error('Can only set video on video pads');
    }

    if (!this.isSourcePad()) {
      throw new Error('Cannot set video on sink pad');
    }

    if (!this.livekitRoom) {
      throw new Error('Cannot set video: not connected to LiveKit room');
    }

    // If a custom element is provided, set it
    if (options?.element) {
      this._setElement(options.element);
    }

    try {
      if (enabled) {
        // Check if camera is available before trying to enable
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasCamera = devices.some(device => device.kind === 'videoinput');
          if (!hasCamera) {
            throw new Error('No camera device found on this system');
          }
        } catch (deviceError) {
          const errorMsg = deviceError instanceof Error ? deviceError.message : String(deviceError);
          throw new Error(`Camera device check failed: ${errorMsg}`);
        }

        // Check camera permissions
        try {
          await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (permissionError) {
          if (permissionError instanceof Error) {
            if (permissionError.name === 'NotAllowedError') {
              throw new Error('Camera permission denied. Please allow camera access in your browser settings.');
            } else if (permissionError.name === 'NotFoundError') {
              throw new Error('No camera found. Please connect a camera or check if another application is using it.');
            } else if (permissionError.name === 'NotReadableError') {
              throw new Error('Camera is already in use by another application.');
            } else {
              throw new Error(`Camera access failed: ${permissionError.message}`);
            }
          } else {
            throw new Error(`Camera access failed: ${String(permissionError)}`);
          }
        }
      }

      await this.livekitRoom.localParticipant.setCameraEnabled(enabled);
      this.publishing = enabled;
      this.isConnected = enabled;
      this.emit('connection-changed', enabled);

      // Update the video element if we have one
      if (this.outputElement instanceof HTMLVideoElement) {
        if (enabled) {
          if (this.currentStream) {
            this.outputElement.srcObject = this.currentStream;
          }
        } else {
          this.outputElement.srcObject = null;
        }
      }
    } catch (error) {
      throw new Error(`Failed to ${enabled ? 'enable' : 'disable'} camera on pad ${this.id}: ${error}`);
    }
  }

  /**
   * Gets the current media stream associated with this pad.
   * @returns {MediaStream | null} The current media stream or null if none exists
   */
  getCurrentStream(): MediaStream | null {
    return this.currentStream;
  }

  /**
   * Gets the current connection state of the pad.
   * @returns {boolean} True if connected, false otherwise
   */
  getConnectionState(): boolean {
    return this.isConnected;
  }

  /**
   * Checks if the pad is currently publishing.
   * @returns {boolean} True if publishing, false otherwise
   */
  isPublishing(): boolean {
    return this.publishing;
  }

  /**
   * Checks if the pad is currently subscribed.
   * @returns {boolean} True if subscribed, false otherwise
   */
  isSubscribed(): boolean {
    return this.subscribed;
  }

  /**
   * Sets the LiveKit room for this pad.
   * @internal
   * @param {any} room - The LiveKit room instance
   */
  setLivekitRoom(room: any): void {
    this.livekitRoom = room;
  }

  /**
   * Sets the connection state of the pad.
   * @internal
   * @param {boolean} connected - The new connection state
   */
  setConnectionState(connected: boolean): void {
    if (this.isConnected !== connected) {
      this.isConnected = connected;
      this.emit('connection-changed', connected);
    }
  }

  /**
   * Sets a media stream for this pad.
   * @internal
   * @param {MediaStream | null} stream - The media stream to set
   */
  setStream(stream: MediaStream | null): void {
    if (!this.isSourcePad()) {
      throw new Error('Can only set stream on source pads');
    }

    this.currentStream = stream;
    if (stream) {
      this.subscribed = true;
      // Store the audio track for enable/disable functionality
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        this.currentTrack = audioTracks[0];
        // Set initial enabled state based on our isEnabled property
        if (this.dataType === 'audio') {
          this.currentTrack.enabled = this.isEnabled;
        }
      }

      this.emit('stream-received', stream);

      // If we have an audio element set and are enabled, connect the stream
      if (this.outputElement && this.dataType === 'audio' && this.isEnabled) {
        this.outputElement.srcObject = stream;
      }
    } else {
      this.subscribed = false;
      this.currentTrack = null;
      // Clear the audio element if we have one
      if (this.outputElement && this.dataType === 'audio') {
        this.outputElement.srcObject = null;
      }
    }
  }

  /**
   * Sets data for this pad.
   * @internal
   * @param {any} data - The data to set
   */
  setData(data: any): void {
    if (data !== null && data !== undefined) {
      this.subscribed = true;
      this.emit('data-received', data);
    } else {
      this.subscribed = false;
    }
  }

  /**
   * Gets the current value of the pad (for property pads).
   * @returns {any} The current value or null if not a property pad
   */
  getValue(): any {
    return this._value;
  }

  /**
   * Sets the value of the pad (for property pads).
   * @param {any} value - The new value to set
   */
  setValue(value: any): void {
    this._value = value;
    this.emit('data-received', value);
  }

  /**
   * Checks if this is a property pad.
   * @returns {boolean} True if this is a property pad
   */
  isPropertyPad(): boolean {
    return this.category === 'property' ||
      this.backendType === 'PropertySourcePad' ||
      this.backendType === 'PropertySinkPad';
  }

  /**
   * Checks if this is a stateless pad.
   * @returns {boolean} True if this is a stateless pad
   */
  isStatelessPad(): boolean {
    return this.category === 'stateless' ||
      this.backendType === 'StatelessSourcePad' ||
      this.backendType === 'StatelessSinkPad';
  }

  /**
   * Cleans up all resources associated with this pad.
   * Stops publishing, clears streams, and removes event listeners.
   */
  async cleanup(): Promise<void> {
    try {
      if (this.publishing && this.livekitRoom) {
        if (this.dataType === 'audio') {
          await this.setMicrophoneEnabled(false);
        } else if (this.dataType === 'video') {
          await this.setVideoEnabled(false);
        }
      }
    } catch (error) {
      console.warn(`Error during pad cleanup: ${error}`);
    }

    // Clean up auto-managed elements
    if (this.autoManagedAudioElement) {
      this.autoManagedAudioElement.remove();
      this.autoManagedAudioElement = null;
    }
    if (this.autoManagedVideoElement) {
      this.autoManagedVideoElement.remove();
      this.autoManagedVideoElement = null;
    }

    // Clear media element if we have one
    if (this.outputElement) {
      this.outputElement.srcObject = null;
      this.outputElement = null;
    }

    this.currentStream = null;
    this.isConnected = false;
    this.publishing = false;
    this.subscribed = false;
    this.livekitRoom = null;
    this.isEnabled = true;
    this.currentTrack = null;
    this.removeAllListeners();
  }
}