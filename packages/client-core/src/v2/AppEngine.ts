import { EventEmitter } from 'eventemitter3';
import { Room } from 'livekit-client';
import type {
  IAppEngine,
  IWorkflowNode,
  AppEngineEvents,
  AppRunConfig,
  ConnectionDetails,
  ConnectionState,
  AppEngineConfig,
  CreateAppRunRequest,
  CreateAppRunResponse,
  PadDataType,
  BackendPadType,
  RunState
} from './types';
import { WorkflowNode } from './WorkflowNode';
import { PadType } from './types';

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
   * Sets the run state and emits a state change event.
   * @private
   * @param {RunState} state - New run state
   */
  private setRunState(state: RunState): void {
    if (this.runState !== state) {
      this.runState = state;
      this.emit('run-state-changed', state);
    }
  }

  /**
   * Starts a new app run with the provided configuration.
   * This creates a new workflow instance on the server.
   *
   * @param {AppRunConfig} config - Configuration for the app run
   * @returns {Promise<ConnectionDetails>} Connection details for the new workflow
   * @throws {Error} If the server request fails or if already running
   */
  async startAppRun(config: AppRunConfig): Promise<ConnectionDetails> {
    if (this.runState !== 'idle') {
      throw new Error(`Cannot start app run in ${this.runState} state`);
    }

    try {
      this.setRunState('starting');
      const requestBody: CreateAppRunRequest = {
        app: config.appId,
        version: config.version,
        inputs: config.inputs || {},
      };

      if (config.entryFlow) {
        requestBody.entry_flow = config.entryFlow;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.config.apiKey) {
        headers['x-api-key'] = this.config.apiKey;
      }
      if (this.config.bearerToken) {
        headers['Authorization'] = `Bearer ${this.config.bearerToken}`;
      }

      const response = await fetch(`${this.config.apiBaseUrl}/v1/app/run`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        this.setRunState('idle');
        const errorText = await response.text();
        throw new Error(`Failed to start app run: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const data: CreateAppRunResponse = await response.json();
      this.setRunState('running');

      return {
        token: data.connection_details.token,
        url: data.connection_details.url,
      };
    } catch (error) {
      this.setRunState('idle');
      throw new Error(`Failed to start app run: ${error}`);
    }
  }

  /**
   * Stops the current app run and cleans up resources.
   */
  async stopAppRun(): Promise<void> {
    if (this.runState === 'idle') {
      return;
    }

    this.setRunState('stopping');
    await this.disconnect();
    this.setRunState('idle');
  }

  /**
   * Connects to a workflow using the provided connection details.
   * This establishes the WebSocket connection and discovers workflow nodes.
   *
   * @param {ConnectionDetails} connectionDetails - Connection details from startAppRun
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

    try {
      const roomInfo = this.livekitRoom.metadata;
      if (roomInfo) {
        const metadata = JSON.parse(roomInfo);
        console.log('Room metadata:', metadata);

        // Debug: Check for edit_ledger
        if (metadata.app && metadata.app.flows && metadata.app.flows[0]) {
          const editLedger = metadata.app.flows[0].edit_ledger;
          console.log('🔍 Edit ledger found:', editLedger?.length || 0, 'edits');
          if (editLedger && editLedger.length > 0) {
            console.log('🔍 First few edits:', editLedger.slice(0, 3));
          }
        } else {
          console.log('⚠️ No edit_ledger found in metadata structure');
        }

        // Create nodes based on app flows definition (legacy fallback)
        if (metadata.app && metadata.app.flows) {
          console.log(`Found app with ${metadata.app.flows.length} flows`);

          for (const flow of metadata.app.flows) {
            if (flow.nodes && Array.isArray(flow.nodes)) {
              console.log(`Processing flow "${flow.id}" with ${flow.nodes.length} nodes`);

              for (const flowNode of flow.nodes) {
                await this.createNodeFromFlowDefinition(flowNode);
              }
            }
          }
        } else {
          console.log('No app.flows found in metadata, trying legacy flow structure');

          // Fallback to legacy structure if available
          if (metadata.flow && metadata.flow.nodes) {
            for (const flowNode of metadata.flow.nodes) {
              await this.createNodeFromFlowDefinition(flowNode);
            }
          }
        }

        // Find and set the publisher node from legacy discovery
        this._publisherNode = this.findPublisherNode();
      }
    } catch (error) {
      console.warn('Failed to parse room metadata:', error);
    }

    // Note: Primary node discovery now happens via backend data packets
    // This method handles legacy fallback and backup discovery
    console.log('🔍 Legacy node discovery complete, waiting for backend node information...');

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

    // Test: Try to request graph data using the existing "graph" topic
    setTimeout(() => {
      if (this.livekitRoom && this.nodes.size === 0) {
        console.log('🔍 Attempting to request graph data from backend...');
        const testRequest = {
          req_id: 'test-' + Date.now(),
          route: 'get_graph'
        };

        const encoder = new TextEncoder();
        this.livekitRoom.localParticipant.publishData(
          encoder.encode(JSON.stringify(testRequest)),
          { topic: 'graph' }
        ).then(() => {
          console.log('📤 Graph request sent to backend');
        }).catch((error) => {
          console.error('❌ Failed to send graph request:', error);
        });
      }
    }, 3000);
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
   * Creates a workflow node from a flow definition.
   * @private
   * @param {any} flowNode - Flow node definition from metadata
   */
  private async createNodeFromFlowDefinition(flowNode: any): Promise<void> {
    try {
      // Handle both new and legacy node structures
      const nodeId = flowNode.uuid || flowNode.id;
      const nodeType = flowNode.node_name || flowNode.type || 'unknown';

      console.log(`Creating node from flow definition:`, JSON.stringify(flowNode, null, 2));
      console.log(`Node ID: ${nodeId}, Node Type: ${nodeType}`);

      if (!nodeId) {
        console.warn('Flow node missing ID, skipping:', flowNode);
        return;
      }

      // Skip if node already exists
      if (this.nodes.has(nodeId)) {
        console.log(`Node ${nodeId} already exists, skipping`);
        return;
      }

      // Create generic WorkflowNode for all types
      const node = new WorkflowNode(nodeId, nodeType);

      // Set up LiveKit room reference
      (node as any).setLivekitRoom(this.livekitRoom);

      // Add pads from flow definition
      await this.addNodePads(node, flowNode);

      console.log(`✅ Successfully created node: ${nodeId} (${nodeType})`);
      this.addNode(node);
    } catch (error) {
      console.error(`Failed to create node from flow definition:`, error);
    }
  }



  /**
   * Adds pads to a node based on its flow definition.
   * @private
   * @param {IWorkflowNode} node - Node to add pads to
   * @param {any} flowNode - Flow node definition
   */
  private async addNodePads(node: IWorkflowNode, flowNode: any): Promise<void> {
    try {
      console.log(`🔧 Adding pads for node type: ${flowNode.type}`);
      console.log(`🔍 Full flow node data:`, JSON.stringify(flowNode.data, null, 2));

      // Check for pad definitions in pad_data (the actual format used by the backend)
      if (flowNode.data && flowNode.data.pad_data) {
        console.log(`📋 Found pad_data definitions for node ${node.id}:`, flowNode.data.pad_data);

        for (const [padName] of Object.entries(flowNode.data.pad_data)) {
          try {
            // Determine pad direction and type from naming convention
            let direction: 'source' | 'sink';
            let dataType: PadDataType;
            let displayName: string;

            if (padName.endsWith('_source')) {
              direction = 'source';
              displayName = padName.replace('_source', '').replace(/_/g, ' ');

              if (padName.includes('audio')) {
                dataType = PadType.Audio;
              } else if (padName.includes('video')) {
                dataType = PadType.Video;
              } else if (padName.includes('text')) {
                dataType = PadType.Data;
              } else {
                dataType = PadType.Data;
              }
            } else if (padName.endsWith('_sink')) {
              direction = 'sink';
              displayName = padName.replace('_sink', '').replace(/_/g, ' ');

              if (padName.includes('audio')) {
                dataType = PadType.Audio;
              } else if (padName.includes('video')) {
                dataType = PadType.Video;
              } else if (padName.includes('text')) {
                dataType = PadType.Data;
              } else {
                dataType = PadType.Data;
              }
            } else if (padName.endsWith('_trigger')) {
              direction = 'source'; // triggers are typically outputs
              dataType = PadType.Trigger;
              displayName = padName.replace('_trigger', '').replace(/_/g, ' ');
            } else if (padName.endsWith('_ref')) {
              direction = 'sink'; // references are typically inputs
              dataType = PadType.Data;
              displayName = padName.replace('_ref', '').replace(/_/g, ' ');
            } else {
              // Skip configuration parameters (like vad_threshold, silence_duration_ms, etc.)
              continue;
            }

            // Capitalize first letter of display name
            displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

            console.log(`  Adding pad: ${padName} → ${displayName} (${direction}, ${dataType})`);

            if (direction === 'source') {
              await this.addSourcePad(node, padName, displayName, dataType);
            } else {
              await this.addSinkPad(node, padName, displayName, dataType);
            }
          } catch (error) {
            console.warn(`⚠️ Failed to add pad ${padName} to node ${node.id}:`, error);
          }
        }
      }
      // Fallback to type-based pad creation if no pad_data
      else {
        console.log(`ℹ️ No pad_data found, using type-based fallback for: ${flowNode.type}`);

        const nodeType = flowNode.type || 'unknown';

        // Add pads based on node type - this matches common workflow patterns
        if (nodeType.toLowerCase() === 'publisher' || nodeType.toLowerCase() === 'publish') {
          // Publisher/Publish input nodes publish audio/video using expected pad IDs
          await this.addSourcePad(node, 'audio_source', 'Audio Source', PadType.Audio);
          await this.addSourcePad(node, 'video_source', 'Video Source', PadType.Video);
          console.log(`✅ Added publisher/publish pads: audio_source, video_source for node ${node.id}`);
        }
        else if (nodeType === 'output') {
          // Output nodes receive audio/video
          await this.addSinkPad(node, 'audio_in', 'Audio Input', PadType.Audio);
          await this.addSinkPad(node, 'video_in', 'Video Input', PadType.Video);
        }
        else if (nodeType === 'vad') {
          // VAD nodes receive audio and publish triggers
          await this.addSinkPad(node, 'audio_in', 'Audio Input', PadType.Audio);
          await this.addSourcePad(node, 'speech_started', 'Speech Started', PadType.Trigger);
          await this.addSourcePad(node, 'speech_ended', 'Speech Ended', PadType.Trigger);
        }
        else if (nodeType.includes('llm') || nodeType === 'omni_llm') {
          // LLM nodes handle data
          await this.addSinkPad(node, 'text_in', 'Text Input', PadType.Data);
          await this.addSourcePad(node, 'text_out', 'Text Output', PadType.Data);
        }
        else if (nodeType === 'tts') {
          // TTS nodes receive text and publish audio
          await this.addSinkPad(node, 'text_in', 'Text Input', PadType.Data);
          await this.addSourcePad(node, 'audio_out', 'Audio Output', PadType.Audio);
        }
        else {
          // Generic nodes - add basic support
          console.log(`ℹ️ Adding default pads for unknown node type: ${nodeType}`);
          await this.addSinkPad(node, 'data_in', 'Data Input', PadType.Data);
          await this.addSourcePad(node, 'data_out', 'Data Output', PadType.Data);
        }
      }

      console.log(`✅ Added ${node.getSourcePads().length} source pads and ${node.getSinkPads().length} sink pads to node ${node.id}`);
    } catch (error) {
      console.warn(`Failed to add pads to node ${node.id}:`, error);
    }
  }

  /**
   * Adds a source pad to a node.
   * @private
   * @param {IWorkflowNode} node - Node to add the pad to
   * @param {string} id - Pad ID
   * @param {string} name - Pad name
   * @param {PadDataType} dataType - Type of data for the pad
   */
  private async addSourcePad(node: IWorkflowNode, id: string, name: string, dataType: PadDataType): Promise<void> {
    const pad = new (await import('./StreamPad')).StreamPad({
      id,
      nodeId: node.id,
      name,
      direction: 'source',
      dataType
    });
    pad.setLivekitRoom(this.livekitRoom);
    (node as any).addPad(pad);
  }

  /**
   * Adds a sink pad to a node.
   * @private
   * @param {IWorkflowNode} node - Node to add the pad to
   * @param {string} id - Pad ID
   * @param {string} name - Pad name
   * @param {PadDataType} dataType - Type of data for the pad
   */
  private async addSinkPad(node: IWorkflowNode, id: string, name: string, dataType: PadDataType): Promise<void> {
    const pad = new (await import('./StreamPad')).StreamPad({
      id,
      nodeId: node.id,
      name,
      direction: 'sink',
      dataType
    });
    pad.setLivekitRoom(this.livekitRoom);
    (node as any).addPad(pad);
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
      const padDirection = padData.direction;
      const padDataType = padData.data_type;
      const padBackendType = padData.type;
      const padDisplayName = padData.id.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

      console.log(`  Adding pad from backend: ${padId} (${padDirection}, ${padDataType}, ${padBackendType})`);

      // Determine pad category from backend type
      let padCategory: 'stateless' | 'property' = 'stateless';
      if (padBackendType === 'PropertySourcePad' || padBackendType === 'PropertySinkPad') {
        padCategory = 'property';
      }

      const pad = new (await import('./StreamPad')).StreamPad({
        id: padId,
        nodeId: node.id,
        name: padDisplayName,
        direction: padDirection as 'source' | 'sink',
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