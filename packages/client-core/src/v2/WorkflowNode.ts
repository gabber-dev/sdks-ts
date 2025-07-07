import { EventEmitter } from 'eventemitter3';
import type {
  IWorkflowNode,
  IStreamPad,
  WorkflowNodeEvents,
  NodeType,
  PadDataType
} from './types';
import { StreamPad } from './StreamPad';

/**
 * WorkflowNode represents a node in the workflow graph that can process data and media streams.
 * Each node can have multiple input (sink) and output (source) pads for different types of data.
 *
 * @implements {IWorkflowNode}
 */
export class WorkflowNode extends EventEmitter<WorkflowNodeEvents> implements IWorkflowNode {
  readonly id: string;
  readonly type: NodeType;
  private pads: Map<string, StreamPad> = new Map();
  private currentAudioStream: MediaStream | null = null;
  private currentVideoStream: MediaStream | null = null;
  private livekitRoom: any = null;
  private audioTrack: any = null;
  private videoTrack: any = null;

  /**
   * Creates a new WorkflowNode instance.
   * @param {string} id - Unique identifier for the node
   * @param {NodeType} type - Type identifier for the node
   */
  constructor(id: string, type: NodeType) {
    super();
    this.id = id;
    this.type = type;
  }

  /**
   * Gets a pad by its ID.
   * @param {string} padId - ID of the pad to retrieve
   * @returns {IStreamPad | null} The pad if found, null otherwise
   */
  getPad(padId: string): IStreamPad | null {
    return this.pads.get(padId) || null;
  }

  /**
   * Gets all source (output) pads on this node.
   * @returns {IStreamPad[]} Array of source pads
   */
  getSourcePads(): IStreamPad[] {
    return Array.from(this.pads.values()).filter(pad => pad.direction === 'source');
  }

  /**
   * Gets all sink (input) pads on this node.
   * @returns {IStreamPad[]} Array of sink pads
   */
  getSinkPads(): IStreamPad[] {
    return Array.from(this.pads.values()).filter(pad => pad.direction === 'sink');
  }

  /**
   * Gets input pads, optionally filtered by data type.
   * @param {PadDataType} [dataType] - Optional data type to filter by
   * @returns {IStreamPad[]} Array of matching input pads
   */
  getInputPads(dataType?: PadDataType): IStreamPad[] {
    const sinkPads = this.getSinkPads();
    return dataType ? sinkPads.filter(pad => pad.dataType === dataType) : sinkPads;
  }

  /**
   * Gets output pads, optionally filtered by data type.
   * @param {PadDataType} [dataType] - Optional data type to filter by
   * @returns {IStreamPad[]} Array of matching output pads
   */
  getOutputPads(dataType?: PadDataType): IStreamPad[] {
    const sourcePads = this.getSourcePads();
    return dataType ? sourcePads.filter(pad => pad.dataType === dataType) : sourcePads;
  }

  /**
   * Gets a source pad by ID with specific type.
   * @param {string} padId - ID of the pad to retrieve
   * @returns {(IStreamPad & { dataType: T }) | null} The pad if found and matches type, null otherwise
   */
  getSourcePad<T extends PadDataType>(padId: string): (IStreamPad & { dataType: T }) | null {
    const pad = this.pads.get(padId);
    if (pad && pad.direction === 'source') {
      return pad as unknown as IStreamPad & { dataType: T };
    }
    return null;
  }

  /**
   * Gets a sink pad by ID with specific type.
   * @param {string} padId - ID of the pad to retrieve
   * @returns {(IStreamPad & { dataType: T }) | null} The pad if found and matches type, null otherwise
   */
  getSinkPad<T extends PadDataType>(padId: string): (IStreamPad & { dataType: T }) | null {
    const pad = this.pads.get(padId);
    if (pad && pad.direction === 'sink') {
      return pad as unknown as IStreamPad & { dataType: T };
    }
    return null;
  }

  /**
   * Adds a pad to this node.
   * @internal
   * @param {IStreamPad} pad - The pad to add
   * @throws {Error} If pad is not an instance of StreamPad
   */
  addPad(pad: IStreamPad): void {
    if (!(pad instanceof StreamPad)) {
      throw new Error('Pad must be instance of StreamPad');
    }
    this.pads.set(pad.id, pad);
  }

  /**
   * Sets the LiveKit room for this node.
   * @internal
   * @param {any} room - The LiveKit room instance
   */
  setLivekitRoom(room: any): void {
    this.livekitRoom = room;

    for (const pad of this.pads.values()) {
      (pad as any).setLivekitRoom(room);
    }
  }

  /**
   * Sets the current audio stream for this node.
   * @internal
   * @param {MediaStream | null} stream - The audio stream to set
   */
  setAudioStream(stream: MediaStream | null): void {
    this.currentAudioStream = stream;
  }

  /**
   * Sets the current video stream for this node.
   * @internal
   * @param {MediaStream | null} stream - The video stream to set
   */
  setVideoStream(stream: MediaStream | null): void {
    this.currentVideoStream = stream;
  }

  /**
   * Handles a subscribed track from LiveKit.
   * @internal
   * @param {any} track - The track that was subscribed
   * @param {any} publication - The track publication
   * @param {any} participant - The participant that owns the track
   */
  handleTrackSubscribed(track: any, publication: any, participant: any): void {
    if (track.kind === 'audio') {
      let mediaStreamTrack;
      if (track.mediaStreamTrack) {
        mediaStreamTrack = track.mediaStreamTrack;
      } else if (track.track) {
        mediaStreamTrack = track.track;
      } else {
        console.warn('Unable to extract MediaStreamTrack from LiveKit track:', track);
        return;
      }

      const stream = new MediaStream([mediaStreamTrack]);
      this.setAudioStream(stream);
    } else if (track.kind === 'video') {
      let mediaStreamTrack;
      if (track.mediaStreamTrack) {
        mediaStreamTrack = track.mediaStreamTrack;
      } else if (track.track) {
        mediaStreamTrack = track.track;
      } else {
        console.warn('Unable to extract MediaStreamTrack from LiveKit track:', track);
        return;
      }

      const stream = new MediaStream([mediaStreamTrack]);
      this.setVideoStream(stream);
    }

    this.routeTrackToPads(track, publication, participant);
  }

  /**
   * Handles an unsubscribed track from LiveKit.
   * @internal
   * @param {any} track - The track that was unsubscribed
   * @param {any} publication - The track publication
   * @param {any} participant - The participant that owned the track
   */
  handleTrackUnsubscribed(track: any, publication: any, participant: any): void {
    if (track.kind === 'audio') {
      this.setAudioStream(null);
    } else if (track.kind === 'video') {
      this.setVideoStream(null);
    }

    this.routeTrackUnsubscriptionToPads(track, publication, participant);
  }

  /**
   * Routes a track to appropriate pads.
   * @private
   * @param {any} track - The track to route
   * @param {any} publication - The track publication
   * @param {any} participant - The participant that owns the track
   */
  private routeTrackToPads(track: any, publication: any, _participant: any): void {
    const trackName = publication.trackName || '';

    for (const pad of this.pads.values()) {
      if (pad.direction === 'sink' &&
        (pad.dataType === 'audio' && track.kind === 'audio' ||
          pad.dataType === 'video' && track.kind === 'video')) {

        if (trackName.includes(pad.id) || trackName.includes(pad.name)) {
          (pad as any).setStream(new MediaStream([track]));
        }
      }
    }
  }

  /**
   * Routes track unsubscription to appropriate pads.
   * @private
   * @param {any} track - The track that was unsubscribed
   * @param {any} publication - The track publication
   * @param {any} participant - The participant that owned the track
   */
  private routeTrackUnsubscriptionToPads(track: any, publication: any, _participant: any): void {
    const trackName = publication.trackName || '';

    for (const pad of this.pads.values()) {
      if (pad.direction === 'sink' &&
        (pad.dataType === 'audio' && track.kind === 'audio' ||
          pad.dataType === 'video' && track.kind === 'video')) {

        if (trackName.includes(pad.id) || trackName.includes(pad.name)) {
          (pad as any).setStream(null);
        }
      }
    }
  }

  /**
   * Cleans up all resources associated with this node.
   * Stops all streams, unpublishes tracks, and removes event listeners.
   */
  async cleanup(): Promise<void> {
    // Clean up all pads (this will handle unpublishing streams)
    for (const pad of this.pads.values()) {
      await pad.cleanup();
    }
    this.pads.clear();

    // Clear internal streams and tracks
    if (this.audioTrack && this.livekitRoom) {
      try {
        await this.livekitRoom.localParticipant.unpublishTrack(this.audioTrack);
      } catch (error) {
        console.warn(`Failed to unpublish audio track during cleanup: ${error}`);
      }
      this.audioTrack = null;
    }

    if (this.videoTrack && this.livekitRoom) {
      try {
        await this.livekitRoom.localParticipant.unpublishTrack(this.videoTrack);
      } catch (error) {
        console.warn(`Failed to unpublish video track during cleanup: ${error}`);
      }
      this.videoTrack = null;
    }

    // Stop all streams
    if (this.currentAudioStream) {
      this.currentAudioStream.getAudioTracks().forEach(track => track.stop());
      this.currentAudioStream = null;
    }

    if (this.currentVideoStream) {
      this.currentVideoStream.getVideoTracks().forEach(track => track.stop());
      this.currentVideoStream = null;
    }

    this.removeAllListeners();
  }
}