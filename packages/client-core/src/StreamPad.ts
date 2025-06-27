import { EventEmitter } from 'eventemitter3';
import type {
  IStreamPad,
  StreamPadEvents,
  PadDirection,
  PadDataType,
  PadConfig,
  PadSubscribeState
} from './types.js';

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
  readonly direction: PadDirection;
  readonly dataType: PadDataType;

  private currentStream: MediaStream | null = null;
  private currentData: any = null;
  private isConnected: boolean = false;
  private publishing: boolean = false;
  private subscribed: boolean = false;
  private livekitRoom: any = null;
  private publishedTrack: any = null;
  private _subscribeState: PadSubscribeState = 'unsubscribed';
  private subscribedElement: HTMLAudioElement | HTMLVideoElement | null = null;

  /**
   * Creates a new StreamPad instance.
   * @param {PadConfig} config - Configuration object for the pad
   */
  constructor(config: PadConfig) {
    super();
    this.id = config.id;
    this.nodeId = config.nodeId;
    this.name = config.name;
    this.direction = config.direction;
    this.dataType = config.dataType;
  }

  /**
   * Publishes data or a media stream to this pad.
   * For audio/video pads, expects a MediaStream. For data/trigger pads, accepts any data.
   *
   * @param {MediaStream | any} data - The data or media stream to publish
   * @throws {Error} If publishing to a sink pad or if LiveKit room is not connected
   */
  async publish(data: MediaStream | any): Promise<void> {
    if (this.direction !== 'source') {
      throw new Error('Cannot publish on sink pad');
    }

    if (!this.livekitRoom) {
      throw new Error('Cannot publish: not connected to LiveKit room');
    }

    try {
      if (this.dataType === 'audio' || this.dataType === 'video') {
        if (!(data instanceof MediaStream)) {
          throw new Error(`Expected MediaStream for ${this.dataType} pad`);
        }

        await this.unpublish();

        const tracks = this.dataType === 'audio'
          ? data.getAudioTracks()
          : data.getVideoTracks();

        if (tracks.length === 0) {
          throw new Error(`No ${this.dataType} tracks found in provided stream`);
        }

        this.publishedTrack = await this.livekitRoom.localParticipant.publishTrack(
          tracks[0],
          {
            name: `${this.nodeId}-${this.id}-${this.dataType}`,
            source: this.dataType === 'audio' ? 'microphone' : 'camera',
          }
        );

        this.currentStream = data;
        this.emit('stream-received', data);
      } else if (this.dataType === 'data' || this.dataType === 'trigger') {
        const message = {
          nodeId: this.nodeId,
          padId: this.id,
          type: this.dataType,
          payload: data,
          timestamp: Date.now(),
        };

        const encoder = new TextEncoder();
        const payload = encoder.encode(JSON.stringify(message));

        await this.livekitRoom.localParticipant.publishData(payload, 'reliable');

        this.currentData = data;
        this.emit('data-received', data);
      }

      this.publishing = true;
      this.isConnected = true;
      this.emit('connection-changed', true);
    } catch (error) {
      throw new Error(`Failed to publish to pad ${this.id}: ${error}`);
    }
  }

  /**
   * Stops publishing data or media stream to this pad.
   * Cleans up any active tracks and resources.
   *
   * @throws {Error} If called on a sink pad
   */
  async unpublish(): Promise<void> {
    if (this.direction !== 'source') {
      throw new Error('Cannot unpublish on sink pad');
    }

    try {
      if (this.publishedTrack && this.livekitRoom) {
        await this.livekitRoom.localParticipant.unpublishTrack(this.publishedTrack);
        this.publishedTrack = null;
      }

      if (this.currentStream) {
        this.currentStream.getTracks().forEach(track => track.stop());
      }

      this.currentStream = null;
      this.currentData = null;
      this.publishing = false;
    } catch (error) {
      throw new Error(`Failed to unpublish from pad ${this.id}: ${error}`);
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
   * Gets the current data associated with this pad.
   * @returns {any} The current data or null if none exists
   */
  getCurrentData(): any {
    return this.currentData;
  }

  /**
   * Subscribes an HTML audio or video element to this pad's media stream.
   *
   * @param {HTMLAudioElement | HTMLVideoElement} element - The element to subscribe
   * @throws {Error} If subscribing to an incompatible pad type or direction
   */
  async subscribe(element: HTMLAudioElement | HTMLVideoElement): Promise<void> {
    if (this.direction === 'source') {
      console.log(`📡 Setting up source pad subscription for ${this.dataType} pad: ${this.name}`);

      this.setSubscribeState('subscribing');

      this.on('stream-received', (stream: MediaStream) => {
        console.log(`📡 Source pad ${this.name} received stream, attaching to element`);
        element.srcObject = stream;
        element.play().catch(error => {
          console.warn(`📡 Autoplay failed for ${this.dataType} element:`, error);
        });
        this.setSubscribeState('subscribed');
      });

      if (this.currentStream) {
        console.log(`📡 Source pad ${this.name} already has stream, attaching immediately`);
        element.srcObject = this.currentStream;
        element.play().catch(error => {
          console.warn(`📡 Autoplay failed for ${this.dataType} element:`, error);
        });
        this.setSubscribeState('subscribed');
      } else {
        console.log(`📡 Source pad ${this.name} waiting for stream...`);
        this.setSubscribeState('subscribed');
      }

      return;
    }

    if (this.direction !== 'sink') {
      throw new Error(`Cannot subscribe to pad with direction: ${this.direction}`);
    }

    throw new Error('Sink pad subscription not yet implemented - use source pad subscription for TTS audio');
  }

  /**
   * Unsubscribes any subscribed HTML elements from this pad.
   */
  async unsubscribe(): Promise<void> {
    if (this.subscribedElement) {
      this.subscribedElement.srcObject = null;
      this.subscribedElement = null;
    }
    this.setSubscribeState('unsubscribed');
  }

  /**
   * Gets the current subscription state of the pad.
   * @returns {PadSubscribeState} The current subscription state
   */
  get subscribeState(): PadSubscribeState {
    return this._subscribeState;
  }

  /**
   * Sends a trigger event through this pad.
   * Only valid for trigger-type source pads.
   *
   * @param {any} [data] - Optional data to include with the trigger
   * @throws {Error} If used on non-trigger pad or sink pad
   */
  async trigger(data?: any): Promise<void> {
    if (this.dataType !== 'trigger') {
      throw new Error('Can only trigger on trigger pads');
    }

    if (this.direction !== 'source') {
      throw new Error('Cannot trigger on sink pad');
    }

    if (!this.livekitRoom) {
      throw new Error('Cannot trigger: not connected to LiveKit room');
    }

    try {
      // Send trigger through LiveKit data channels
      const message = {
        nodeId: this.nodeId,
        padId: this.id,
        type: 'trigger',
        payload: data,
        timestamp: Date.now(),
      };

      const encoder = new TextEncoder();
      const payload = encoder.encode(JSON.stringify(message));

      await this.livekitRoom.localParticipant.publishData(payload, 'reliable');

      this.emit('trigger-received', data);
    } catch (error) {
      throw new Error(`Failed to trigger pad ${this.id}: ${error}`);
    }
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
   * Sets the subscription state of the pad.
   * @private
   * @param {PadSubscribeState} state - The new subscription state
   */
  private setSubscribeState(state: PadSubscribeState): void {
    if (this._subscribeState !== state) {
      this._subscribeState = state;
      this.emit('subscribe-state-changed', state);
    }
  }

  /**
   * Sets a media stream for this pad.
   * @internal
   * @param {MediaStream | null} stream - The media stream to set
   */
  setStream(stream: MediaStream | null): void {
    this.currentStream = stream;
    if (stream) {
      this.subscribed = true;
      this.emit('stream-received', stream);

      // Automatically update subscribed HTML element if any
      if (this.subscribedElement) {
        this.subscribedElement.srcObject = stream;
        this.setSubscribeState('subscribed');
      }
    } else {
      this.subscribed = false;

      // Clear subscribed HTML element if any
      if (this.subscribedElement) {
        this.subscribedElement.srcObject = null;
        this.setSubscribeState('unsubscribed');
      }
    }
  }

  /**
   * Sets data for this pad.
   * @internal
   * @param {any} data - The data to set
   */
  setData(data: any): void {
    this.currentData = data;
    if (data !== null && data !== undefined) {
      this.subscribed = true;
      this.emit('data-received', data);
    } else {
      this.subscribed = false;
    }
  }

  /**
   * Receives a trigger event on this pad.
   * @internal
   * @param {any} [data] - The trigger data
   */
  receiveTrigger(data?: any): void {
    if (this.dataType === 'trigger' && this.direction === 'sink') {
      this.emit('trigger-received', data);
    }
  }

  /**
   * Cleans up all resources associated with this pad.
   * Stops publishing, clears streams, and removes event listeners.
   */
  async cleanup(): Promise<void> {
    try {
      await this.unpublish();
    } catch (error) {
      console.warn(`Error during pad cleanup: ${error}`);
    }

    this.currentStream = null;
    this.currentData = null;
    this.isConnected = false;
    this.publishing = false;
    this.subscribed = false;
    this.livekitRoom = null;
    this.publishedTrack = null;
    this.removeAllListeners();
  }
}