import { EventEmitter } from 'eventemitter3';
import { Room } from 'livekit-client';
import type {
  IAppEngine,
  IWorkflowNode,
  AppEngineEvents,
  ConnectionDetails,
  ConnectionState,
  AppEngineConfig,
  PadDataType,
  BackendPadType,
  RunState
} from './types';
import { WorkflowNode } from './WorkflowNode';

/**
 * AppEngine is the main entry point for interacting with Gabber workflows.
 * It manages the connection to the workflow server, node discovery, and media routing.
 *
 * @implements {IAppEngine}
 * @example
 * ```typescript
 * const engine = new AppEngine();
 * engine.configure({ apiBaseUrl: 'http://localhost:8080' });
 *
 * const connectionDetails = await engine.startAppRun({
 *   appId: 'my-app',
 *   version: 1
 * });
 *
 * await engine.connect(connectionDetails);
 * ```
 */
export class AppEngine extends EventEmitter<AppEngineEvents> implements IAppEngine {
  private livekitRoom: Room | null = null;
  private nodes: Map<string, IWorkflowNode> = new Map();
  private connectionState: ConnectionState = 'disconnected';
  private runState: RunState = 'idle';
  private config: AppEngineConfig = {
    apiBaseUrl: 'http://localhost:8080',
  };
  private _publisherNode: IWorkflowNode | null = null;

  /**
   * Gets the publisher node if available.
   * This is automatically set during node discovery.
   */
  get publisherNode(): IWorkflowNode | null {
    return this._publisherNode;
  }

  /**
   * Creates a new AppEngine instance.
   * @param {AppEngineConfig} [config] - Optional initial configuration
   */
  constructor(config?: AppEngineConfig) {
    super();
    if (config) {
      this.configure(config);
    }
  }

  /**
   * Configures the workflow engine with the provided options.
   * @param {AppEngineConfig} config - Configuration options
   */
  configure(config: AppEngineConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Gets the current run state.
   * @returns {RunState} Current run state
   */
  getRunState(): RunState {
    return this.runState;
  }



  /**
   * Connects to a workflow using the provided connection details.
   * This establishes the WebSocket connection and discovers workflow nodes.
   *
   * @param {ConnectionDetails} connectionDetails - Connection details for the workflow
   * @throws {Error} If already connected or if connection fails
   */
  async connect(connectionDetails: ConnectionDetails): Promise<void> {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      throw new Error('Already connected or connecting');
    }

    this.setConnectionState('connecting');

    try {
      this.livekitRoom = new Room();
      this.setupRoomEventListeners();
      await this.livekitRoom.connect(connectionDetails.url, connectionDetails.token);
      await this.discoverNodes();

      this.setConnectionState('connected');
    } catch (error) {
      this.setConnectionState('disconnected');
      if (this.livekitRoom) {
        this.livekitRoom.disconnect();
        this.livekitRoom = null;
      }
      throw error;
    }
  }

  /**
   * Disconnects from the current workflow and cleans up resources.
   */
  async disconnect(): Promise<void> {
    if (this.connectionState === 'disconnected') {
      return;
    }

    this.setConnectionState('disconnected');

    for (const node of this.nodes.values()) {
      await node.cleanup();
    }
    this.nodes.clear();

    if (this.livekitRoom) {
      this.livekitRoom.disconnect();
      this.livekitRoom = null;
    }
  }

  /**
   * Gets a workflow node by its ID.
   * @param {string} nodeId - ID of the node to retrieve
   * @returns {IWorkflowNode | null} The node if found, null otherwise
   */
  getNode(nodeId: string): IWorkflowNode | null {
    return this.nodes.get(nodeId) || null;
  }

  /**
   * Lists all available workflow nodes.
   * @returns {IWorkflowNode[]} Array of all nodes
   */
  listNodes(): IWorkflowNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Gets the current connection state.
   * @returns {ConnectionState} Current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Sets the connection state and emits a state change event.
   * @private
   * @param {ConnectionState} state - New connection state
   */
  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.emit('connection-state-changed', state);
    }
  }

  /**
   * Sets up event listeners for the LiveKit room.
   * @private
   */
  private setupRoomEventListeners(): void {
    if (!this.livekitRoom) return;

    this.livekitRoom.on('connected', () => {
      console.log('Gabber workflow connected');

      if (this.livekitRoom) {
        // Debug: Check initial participants
        console.log('🔍 Initial remote participants in room:', this.livekitRoom.remoteParticipants.size);
        this.livekitRoom.remoteParticipants.forEach((participant) => {
          console.log(`  - Remote participant: ${participant.identity}`);
        });

        // Debug: Monitor for new participants
        setTimeout(() => {
          if (this.livekitRoom) {
            console.log('🔍 Remote participants after 2s:', this.livekitRoom.remoteParticipants.size);
            this.livekitRoom.remoteParticipants.forEach((participant) => {
              console.log(`  - Remote participant: ${participant.identity}`);
            });
          }
        }, 2000);
      }
    });

    this.livekitRoom.on('disconnected', (reason) => {
      console.log('Gabber workflow disconnected:', reason);
      this.setConnectionState('disconnected');
    });

    this.livekitRoom.on('trackSubscribed', (track, publication, participant) => {
      this.handleTrackSubscribed(track, publication, participant);
    });

    this.livekitRoom.on('trackUnsubscribed', (track, publication, participant) => {
      this.handleTrackUnsubscribed(track, publication, participant);
    });

    this.livekitRoom.on('dataReceived', (payload, participant, kind, topic) => {
      console.log('🔍 Raw data received - Topic:', topic, 'Participant:', participant?.identity, 'Kind:', kind, 'Payload size:', payload.length);
      this.handleDataReceived(payload, participant);
    });

    this.livekitRoom.on('participantConnected', (participant) => {
      console.log('👤 Participant connected:', participant.identity);
    });

    this.livekitRoom.on('participantDisconnected', (participant) => {
      console.log('👤 Participant disconnected:', participant.identity);
    });
  }

  /**
   * Discovers workflow nodes from room metadata and participants.
   * @private
   */
  private async discoverNodes(): Promise<void> {
    if (!this.livekitRoom) return;

    console.log('🔍 Starting node discovery - waiting for backend node information...');

    // Note: Node discovery happens via backend data packets
    console.log('🔍 Waiting for backend node information...');

    // Set up a timeout to show warning if no backend data is received
    setTimeout(() => {
      if (this.nodes.size === 0) {
        console.warn('⚠️ No nodes discovered after 5 seconds. This could mean:');
        console.warn('  1. Backend agent is not connecting to the room');
        console.warn('  2. Backend is not sending node discovery data');
        console.warn('  3. Edit ledger is empty (no workflow nodes defined)');
        console.warn('  4. Timing issue with data packet delivery');

        if (this.livekitRoom) {
          console.warn('🔍 Current remote participants:', this.livekitRoom.remoteParticipants.size);
          this.livekitRoom.remoteParticipants.forEach((participant) => {
            console.warn(`  - ${participant.identity}`);
          });
        }
      }
    }, 5000);
  }

  /**
   * Finds the publisher node among discovered nodes.
   * @private
   * @returns {IWorkflowNode | null} The publisher node if found, null otherwise
   */
  private findPublisherNode(): IWorkflowNode | null {
    for (const node of this.nodes.values()) {
      const nodeType = node.type.toLowerCase();
      if (nodeType === 'publisher' || nodeType === 'publish') {
        console.log(`🔍 Found publisher/publish node: ${node.id} (${node.type})`);
        return node;
      }
    }
    console.log(`🔍 No publisher/publish node found among ${this.nodes.size} nodes`);
    return null;
  }

  /**
   * Handles a subscribed track from LiveKit.
   * @private
   * @param {any} track - The track that was subscribed
   * @param {any} publication - The track publication
   * @param {any} participant - The participant that owns the track
   */
  private handleTrackSubscribed(track: any, publication: any, participant: any): void {
    const nodeId = this.extractNodeIdFromParticipant(participant);
    console.log(`🔊 Track subscribed - Node: ${nodeId}, Track: ${track.kind}, Publication: ${publication.trackName}, Participant: ${participant.identity}`);

    // Handle node-specific track subscription if we found a matching node
    if (nodeId) {
      const node = this.nodes.get(nodeId);
      if (node) {
        // Always call the node's track handler
        if (typeof (node as any).handleTrackSubscribed === 'function') {
          (node as any).handleTrackSubscribed(track, publication, participant);
        }

        // Route audio/video tracks to appropriate pads
        if (track.kind === 'audio' || track.kind === 'video') {
          console.log(`🔊 Routing ${track.kind} track to node ${nodeId} pads`);

          // Extract the proper MediaStreamTrack from the LiveKit track
          let mediaStreamTrack;
          if (track.mediaStreamTrack) {
            mediaStreamTrack = track.mediaStreamTrack;
          } else if (track.track) {
            mediaStreamTrack = track.track;
          } else {
            console.warn('🔊 Unable to extract MediaStreamTrack from LiveKit track:', track);
            return;
          }

          const mediaStream = new MediaStream([mediaStreamTrack]);

          // Route to appropriate pads on the node
          const targetPads = node.getSourcePads().filter(pad => pad.dataType === track.kind);
          targetPads.forEach(pad => {
            (pad as any).setStream(mediaStream);
          });
        }
        return;
      }
    }

    // Enhanced fallback routing for when participant identity doesn't match node IDs
    console.log('🔊 No node match found, attempting enhanced track routing');

    // Route TTS audio tracks (from agents) to TTS nodes
    if (track.kind === 'audio' && (
      publication.trackName === 'microphone' ||
      participant.identity.startsWith('agent-') ||
      publication.source === 'microphone'
    )) {

      console.log('🔊 Identified as TTS audio track, finding TTS node');

      // Find TTS node
      const ttsNode = Array.from(this.nodes.values()).find(node =>
        node.type === 'tts' && node.getSourcePads().some(pad => pad.dataType === 'audio')
      );

      if (ttsNode) {
        console.log(`🔊 Found TTS node: ${ttsNode.id}, routing audio track`);

        // Find the audio source pad on the TTS node
        const audioSourcePad = ttsNode.getSourcePads().find(pad => pad.dataType === 'audio');
        if (audioSourcePad) {
          console.log(`🔊 Routing TTS audio to pad: ${audioSourcePad.id} (${audioSourcePad.name})`);

          // Extract the proper MediaStreamTrack from the LiveKit track
          let mediaStreamTrack;
          if (track.mediaStreamTrack) {
            mediaStreamTrack = track.mediaStreamTrack;
          } else if (track.track) {
            mediaStreamTrack = track.track;
          } else {
            console.warn('🔊 Unable to extract MediaStreamTrack from LiveKit track:', track);
            return;
          }

          console.log('🔊 Creating MediaStream with track:', mediaStreamTrack);
          const mediaStream = new MediaStream([mediaStreamTrack]);

          // Set the stream on the TTS audio pad
          (audioSourcePad as any).setStream(mediaStream);

          console.log(`🔊 Successfully routed TTS audio to ${ttsNode.type} node`);
        }
      } else {
        console.warn('🔊 No TTS node found for audio routing');
      }
    }

    // Route other tracks as needed...
  }

  /**
   * Handles an unsubscribed track from LiveKit.
   * @private
   * @param {any} track - The track that was unsubscribed
   * @param {any} publication - The track publication
   * @param {any} participant - The participant that owned the track
   */
  private handleTrackUnsubscribed(track: any, publication: any, participant: any): void {
    const nodeId = this.extractNodeIdFromParticipant(participant);
    if (nodeId) {
      const node = this.nodes.get(nodeId);
      if (node && typeof (node as any).handleTrackUnsubscribed === 'function') {
        (node as any).handleTrackUnsubscribed(track, publication, participant);
      }
    }
  }

  /**
   * Handles received data messages from LiveKit.
   * @private
   * @param {Uint8Array} payload - Raw message payload
   * @param {any} participant - The participant that sent the message
   */
  private handleDataReceived(payload: Uint8Array, participant: any): void {
    console.log('🔍 Data packet received from participant:', participant?.identity, 'payload size:', payload.length);

    try {
      const decoder = new TextDecoder();
      const message = JSON.parse(decoder.decode(payload));

      console.log('📨 Received data message:', message);

      // Handle node discovery messages from backend
      if (message.type === 'node_discovery') {
        console.log('🔍 Received node discovery from backend:', message);
        this.handleNodeDiscovery(message.nodes);
        return;
      }

      // Route to appropriate node and pad based on nodeId and padId
      if (message.nodeId) {
        const node = this.nodes.get(message.nodeId);
        if (node) {
          // Emit event on the node for generic handling
          (node as any).emit('data-received', message);

          // Also route to specific pad if padId is provided
          if (message.padId) {
            const pad = node.getPad(message.padId);
            if (pad) {
              // Route based on message type
              if (message.type === 'trigger') {
                (pad as any).emit('trigger-received', message);
              } else if (message.type === 'data') {
                (pad as any).emit('data-received', message);
              } else if (message.type === 'stream') {
                (pad as any).emit('stream-received', message);
              } else {
                // Fallback: emit as data-received
                (pad as any).emit('data-received', message);
              }
            } else {
              console.warn(`Pad ${message.padId} not found on node ${message.nodeId}`);
            }
          }
        } else {
          console.warn(`Node ${message.nodeId} not found`);
        }
      }
    } catch (error) {
      console.warn('Failed to parse data message:', error);
    }
  }

  /**
 * Handles node discovery messages from the backend.
 * @private
 * @param {any[]} nodesData - Array of node data from backend
 */
  private async handleNodeDiscovery(nodesData: any[]): Promise<void> {
    console.log(`🔍 Processing node discovery for ${nodesData.length} nodes from backend`);

    // Debug: Log all node types being discovered
    console.log('🔍 Node types being discovered:', nodesData.map(n => `${n.id} (${n.type})`));

    try {
      for (const nodeData of nodesData) {
        await this.createNodeFromBackendData(nodeData);
      }

      // Find and set the publisher node after all nodes are created
      this._publisherNode = this.findPublisherNode();
      if (this._publisherNode) {
        console.log(`🔍 Publisher/Publish node found: ${this._publisherNode.id} (${this._publisherNode.type})`);
        // Debug: Log the publisher node's pads
        const audioPads = this._publisherNode.getSourcePads().filter(pad => pad.dataType === 'audio');
        const videoPads = this._publisherNode.getSourcePads().filter(pad => pad.dataType === 'video');
        console.log(`🔍 Publisher node has ${audioPads.length} audio pads and ${videoPads.length} video pads`);
        audioPads.forEach(pad => console.log(`  - Audio pad: ${pad.id} (${pad.name})`));
        videoPads.forEach(pad => console.log(`  - Video pad: ${pad.id} (${pad.name})`));
      } else {
        console.log('🔍 No Publisher node found');
        // Debug: Log all node types to help diagnose the issue
        console.log('🔍 Available node types:', Array.from(this.nodes.values()).map(n => `${n.id} (${n.type})`));
      }

      console.log(`✅ Node discovery complete: ${this.nodes.size} nodes created`);

      // Emit event to notify listeners that nodes have been discovered
      this.emit('nodes-discovered');
    } catch (error) {
      console.error('Failed to process node discovery:', error);
    }
  }

  /**
   * Creates a workflow node from backend data.
   * @private
   * @param {any} nodeData - Node data from backend
   */
  private async createNodeFromBackendData(nodeData: any): Promise<void> {
    try {
      const nodeId = nodeData.id;
      const nodeType = nodeData.type;

      console.log(`🔧 Creating node from backend data: ${nodeId} (${nodeType})`);

      // Skip if node already exists
      if (this.nodes.has(nodeId)) {
        console.log(`Node ${nodeId} already exists, skipping`);
        return;
      }

      // Create generic WorkflowNode
      const node = new WorkflowNode(nodeId, nodeType);
      (node as any).setLivekitRoom(this.livekitRoom);

      // Add pads from backend data
      if (nodeData.pads && Array.isArray(nodeData.pads)) {
        for (const padData of nodeData.pads) {
          await this.createPadFromBackendData(node, padData);
        }
      }

      console.log(`✅ Successfully created node: ${nodeId} (${nodeType}) with ${nodeData.pads?.length || 0} pads`);
      this.addNode(node);
    } catch (error) {
      console.error(`Failed to create node from backend data:`, error);
    }
  }

  /**
   * Creates a pad from backend data and adds it to the node.
   * @private
   * @param {IWorkflowNode} node - Node to add the pad to
   * @param {any} padData - Pad data from backend
   */
  private async createPadFromBackendData(node: IWorkflowNode, padData: any): Promise<void> {
    try {
      const padId = padData.id;
      const padDataType = padData.data_type;
      const padBackendType = padData.type;
      const padDisplayName = padData.id.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

      // Import the utility functions to check pad types
      const { isSourcePad, isSinkPad } = await import('./types');
      const padDirection = isSourcePad(padBackendType) ? 'source' : (isSinkPad(padBackendType) ? 'sink' : 'unknown');

      console.log(`  Adding pad from backend: ${padId} (${padDirection} derived from ${padBackendType}, ${padDataType})`);

      // Determine pad category from backend type
      let padCategory: 'stateless' | 'property' = 'stateless';
      if (padBackendType === 'PropertySourcePad' || padBackendType === 'PropertySinkPad') {
        padCategory = 'property';
      }

      const pad = new (await import('./StreamPad')).StreamPad({
        id: padId,
        nodeId: node.id,
        name: padDisplayName,
        dataType: padDataType as PadDataType,
        backendType: padBackendType as BackendPadType,
        category: padCategory,
        value: padData.value,
        allowedTypes: padData.allowed_types || [],
        nextPads: padData.next_pads || [],
        previousPad: padData.previous_pad || null
      });

      pad.setLivekitRoom(this.livekitRoom);
      (node as any).addPad(pad);

      console.log(`    ✅ Added pad: ${padId} → ${padDisplayName} (${padCategory})`);
    } catch (error) {
      console.warn(`⚠️ Failed to create pad ${padData.id} for node ${node.id}:`, error);
    }
  }

  /**
   * Extracts a node ID from a LiveKit participant.
   * @private
   * @param {any} participant - LiveKit participant
   * @returns {string | null} Node ID if found, null otherwise
   */
  private extractNodeIdFromParticipant(participant: any): string | null {
    const identity = participant.identity;
    console.log(`🔍 Extracting node ID from participant identity: "${identity}"`);
    console.log(`🔍 Available node IDs:`, Array.from(this.nodes.keys()));

    if (!identity) {
      console.log(`🔍 No identity found`);
      return null;
    }

    // Handle "publisher" identity - map to publisher/publish node from workflow
    if (identity === 'publisher') {
      // Find the first publisher/publish node in the workflow
      for (const [nodeId, node] of this.nodes.entries()) {
        const nodeType = node.type.toLowerCase();
        if (nodeType === 'publisher' || nodeType === 'publish') {
          console.log(`🔍 Mapped "publisher" identity to publisher node: ${nodeId} (${node.type})`);
          return nodeId;
        }
      }
      console.log(`🔍 No publisher node found for "publisher" identity`);
      return null;
    }

    // Check for node- prefix first
    if (identity.includes('node-')) {
      const nodeId = identity.split('node-')[1] || null;
      console.log(`🔍 Found node- prefix, extracted ID: ${nodeId}`);
      return nodeId;
    }

    // Check if the identity directly matches any of our known node IDs
    if (this.nodes.has(identity)) {
      console.log(`🔍 Direct match found: ${identity}`);
      return identity;
    }

    // Check if any of our known node IDs are contained in the identity
    for (const nodeId of this.nodes.keys()) {
      if (identity.includes(nodeId)) {
        console.log(`🔍 Partial match found: ${nodeId} in ${identity}`);
        return nodeId;
      }
    }

    console.log(`🔍 No matching node ID found for identity: ${identity}`);
    return null;
  }

  /**
   * Adds a node to the workflow engine.
   * @private
   * @param {IWorkflowNode} node - Node to add
   */
  private addNode(node: IWorkflowNode): void {
    this.nodes.set(node.id, node);
  }
}