import { EventEmitter } from 'eventemitter3';

/**
 * Configuration for starting an app run
 */
export interface AppRunConfig {
  /** The unique identifier of the app to run */
  appId: string;
  /** The version number of the app to run */
  version: number;
  /** Optional entry flow identifier */
  entryFlow?: string;
  /** Optional input parameters for the app run */
  inputs?: Record<string, any>;
}

/**
 * Connection details returned when starting an app run
 */
export interface ConnectionDetails {
  /** Authentication token for the connection */
  token: string;
  /** WebSocket URL to connect to */
  url: string;
  /** Optional run identifier */
  runId?: string;
}

/**
 * Configuration options for the workflow engine
 */
export interface AppEngineConfig {
  /** Base URL for the API */
  apiBaseUrl: string;
  /** API key for authentication */
  apiKey?: string;
  /** Bearer token for authentication */
  bearerToken?: string;
}

/**
 * Request format for creating a new app run
 */
export interface CreateAppRunRequest {
  /** App identifier */
  app: string;
  /** App version */
  version: number;
  /** Optional entry flow identifier */
  entry_flow?: string;
  /** Optional input parameters */
  inputs?: Record<string, any>;
}

/**
 * Response format from creating a new app run
 */
export interface CreateAppRunResponse {
  /** Connection details for the new app run */
  connection_details: {
    /** Authentication token */
    token: string;
    /** WebSocket URL */
    url: string;
  };
}

/** Connection state of the workflow engine */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected';

/** State of the workflow run */
export type RunState = 'idle' | 'starting' | 'running' | 'stopping';

/** Type identifier for workflow nodes */
export type NodeType = string;

/**
 * Base class for pad data type definitions matching the backend system.
 * Each specific type has a literal 'type' field that identifies it.
 */
export interface PadDataTypeDefinition {
  /** The type identifier */
  type: string;
  /** Additional properties specific to each type */
  [key: string]: any;
}

/**
 * String data type definition
 */
export interface StringDataType extends PadDataTypeDefinition {
  type: 'string';
  max_length?: number;
  min_length?: number;
}

/**
 * Integer data type definition
 */
export interface IntegerDataType extends PadDataTypeDefinition {
  type: 'integer';
  maximum?: number;
  minimum?: number;
}

/**
 * Float/Number data type definition
 */
export interface FloatDataType extends PadDataTypeDefinition {
  type: 'float';
  maximum?: number;
  minimum?: number;
}

/**
 * Boolean data type definition
 */
export interface BooleanDataType extends PadDataTypeDefinition {
  type: 'boolean';
}

/**
 * Audio data type definition
 */
export interface AudioDataType extends PadDataTypeDefinition {
  type: 'audio';
}

/**
 * Video data type definition
 */
export interface VideoDataType extends PadDataTypeDefinition {
  type: 'video';
}

/**
 * Trigger data type definition
 */
export interface TriggerDataType extends PadDataTypeDefinition {
  type: 'trigger';
}

/**
 * Audio clip data type definition
 */
export interface AudioClipDataType extends PadDataTypeDefinition {
  type: 'audio_clip';
}

/**
 * Video clip data type definition
 */
export interface VideoClipDataType extends PadDataTypeDefinition {
  type: 'video_clip';
}

/**
 * AV clip data type definition
 */
export interface AVClipDataType extends PadDataTypeDefinition {
  type: 'av_clip';
}

/**
 * Context message data type definition
 */
export interface ContextMessageDataType extends PadDataTypeDefinition {
  type: 'context_message';
}

/**
 * Context message role data type definition
 */
export interface ContextMessageRoleDataType extends PadDataTypeDefinition {
  type: 'context_message_role';
}

/**
 * List data type definition
 */
export interface ListDataType extends PadDataTypeDefinition {
  type: 'list';
  max_length?: number;
  item_type_constraints?: PadDataTypeDefinition[];
}

/**
 * Union type of all specific data type definitions
 */
export type SpecificDataType =
  | StringDataType
  | IntegerDataType
  | FloatDataType
  | BooleanDataType
  | AudioDataType
  | VideoDataType
  | TriggerDataType
  | AudioClipDataType
  | VideoClipDataType
  | AVClipDataType
  | ContextMessageDataType
  | ContextMessageRoleDataType
  | ListDataType;

/** Type of data that can flow through a pad - derived from allowed types */
export type PadDataType = 'audio' | 'video' | 'data' | 'trigger' | 'text' | 'boolean' | 'integer' | 'number';

/** Backend pad type names */
export type BackendPadType = 'StatelessSourcePad' | 'StatelessSinkPad' | 'PropertySourcePad' | 'PropertySinkPad';

/** Category of pad functionality */
export type PadCategory = 'stateless' | 'property';

/**
 * Pad reference for connections
 */
export interface PadReference {
  node: string;
  pad: string;
}

/**
 * Configuration for audio options
 */
export interface AudioOptions {
  /** Optional audio element to control output */
  element?: HTMLAudioElement;
}

/**
 * Configuration for video options
 */
export interface VideoOptions {
  /** Optional video element to control output */
  element?: HTMLVideoElement;
}

/**
 * Configuration for creating a new pad
 */
export interface PadConfig {
  /** Unique identifier for the pad */
  id: string;
  /** ID of the node this pad belongs to */
  nodeId: string;
  /** Display name of the pad */
  name: string;
  /** Backend pad type */
  backendType?: BackendPadType;
  /** Category of pad functionality */
  category?: PadCategory;
  /** Current value (for property pads) */
  value?: any;
  /** Allowed data types - this is the source of truth for the pad's type capabilities */
  allowedTypes?: PadDataTypeDefinition[];
  /** Connected pads (for source pads) */
  nextPads?: PadReference[];
  /** Previous pad (for sink pads) */
  previousPad?: PadReference | null;
}

/**
 * Events that can be emitted by the workflow engine
 */
export interface AppEngineEvents {
  /** Emitted when connection state changes */
  'connection-state-changed': (state: ConnectionState) => void;
  /** Emitted when run state changes */
  'run-state-changed': (state: RunState) => void;
  /** Emitted when nodes have been discovered from the backend */
  'nodes-discovered': () => void;
  /** Emitted when an error occurs */
  'error': (error: Error) => void;
}

/**
 * Events that can be emitted by workflow nodes
 */
export interface WorkflowNodeEvents {
  'data-received': (data: any) => void;
  'stream-received': (stream: MediaStream) => void;
}

/**
 * Events that can be emitted by stream pads
 */
export interface StreamPadEvents {
  /** Emitted when data is received on the pad */
  'data-received': (data: any) => void;
  /** Emitted when a media stream is received */
  'stream-received': (stream: MediaStream) => void;
  /** Emitted when a trigger event is received */
  'trigger-received': (data: any) => void;
  /** Emitted when connection state changes */
  'connection-changed': (connected: boolean) => void;
}

/**
 * Interface for the workflow engine
 */
export interface IAppEngine extends EventEmitter<AppEngineEvents> {
  /** Configure the workflow engine */
  configure(config: AppEngineConfig): void;
  /** Connect to a workflow using connection details */
  connect(connectionDetails: ConnectionDetails): Promise<void>;
  /** Disconnect from the current workflow and clean up all resources */
  disconnect(): Promise<void>;
  /** Get a node by its ID */
  getNode(nodeId: string): IWorkflowNode | null;
  /** List all available nodes */
  listNodes(): IWorkflowNode[];
  /** Get current connection state */
  getConnectionState(): ConnectionState;
  /** Get current run state */
  getRunState(): RunState;
}

/**
 * Interface for workflow nodes
 */
export interface IWorkflowNode extends EventEmitter<WorkflowNodeEvents> {
  /** Unique identifier for the node */
  readonly id: string;
  /** Type of the node */
  readonly type: string;

  /** Get a pad by its ID */
  getPad(padId: string): IStreamPad | null;
  /** Get all source pads */
  getSourcePads(): IStreamPad[];
  /** Get all sink pads */
  getSinkPads(): IStreamPad[];
  /** Get input pads, optionally filtered by data type */
  getInputPads(dataType?: PadDataType): IStreamPad[];
  /** Get output pads, optionally filtered by data type */
  getOutputPads(dataType?: PadDataType): IStreamPad[];

  /** Get a source pad by ID with specific type */
  getSourcePad<T extends PadDataType>(padId: string): IStreamPad & { dataType: T } | null;
  /** Get a sink pad by ID with specific type */
  getSinkPad<T extends PadDataType>(padId: string): IStreamPad & { dataType: T } | null;

  /** Clean up node resources */
  cleanup(): Promise<void>;
}

/**
 * Interface for stream pads
 */
export interface IStreamPad extends EventEmitter<StreamPadEvents> {
  readonly id: string;
  readonly nodeId: string;
  readonly name: string;
  readonly backendType?: BackendPadType | undefined;
  readonly category?: PadCategory | undefined;
  readonly value?: any;
  readonly allowedTypes?: PadDataTypeDefinition[] | undefined;
  readonly nextPads?: PadReference[] | undefined;
  readonly previousPad?: PadReference | null | undefined;

  /** Get the derived data type from allowed types */
  readonly dataType: PadDataType;

  setMicrophoneEnabled(enabled: boolean, options?: AudioOptions): Promise<void>;
  setVideoEnabled(enabled: boolean, options?: VideoOptions): Promise<void>;
  setEnabled(enabled: boolean, options?: { element?: HTMLAudioElement }): void;
  getCurrentStream(): MediaStream | null;
  getConnectionState(): boolean;
  isPublishing(): boolean;
  isSubscribed(): boolean;

  // Pad type methods
  isSourcePad(): boolean;
  isSinkPad(): boolean;

  // Type utilities (following React Flow UI pattern)
  getSingleAllowedType(): PadDataTypeDefinition | null;
  isFullyTyped(): boolean;

  // Property pad methods
  getValue(): any;
  setValue(value: any): void;
  isPropertyPad(): boolean;
  isStatelessPad(): boolean;

  cleanup(): Promise<void>;
}

export const PadType = {
  Audio: 'audio' as const,
  Video: 'video' as const,
  Data: 'data' as const,
  Trigger: 'trigger' as const,
  Text: 'text' as const,
  Boolean: 'boolean' as const,
  Integer: 'integer' as const,
  Number: 'number' as const,
};

/**
 * Checks if a pad is a source pad based on its backend type.
 * @param {string} padType - The backend pad type (e.g., 'StatelessSourcePad', 'PropertySourcePad')
 * @returns {boolean} True if this is a source pad
 */
export function isSourcePad(padType: string): boolean {
  return padType.indexOf('Source') !== -1;
}

/**
 * Checks if a pad is a sink pad based on its backend type.
 * @param {string} padType - The backend pad type (e.g., 'StatelessSinkPad', 'PropertySinkPad')
 * @returns {boolean} True if this is a sink pad
 */
export function isSinkPad(padType: string): boolean {
  return padType.indexOf('Sink') !== -1;
}

/**
 * Derives a simple data type from allowed types, matching the backend logic.
 * @param {PadDataTypeDefinition[] | undefined} allowedTypes - The allowed types for the pad
 * @param {string} padId - The pad ID for fallback detection
 * @returns {PadDataType} The derived data type
 */
export function deriveDataType(allowedTypes?: PadDataTypeDefinition[], padId?: string): PadDataType {
  // First, check pad ID for explicit audio/video naming (fallback)
  if (padId) {
    const padIdLower = padId.toLowerCase();
    if (padIdLower.includes('audio')) {
      return 'audio';
    } else if (padIdLower.includes('video')) {
      return 'video';
    } else if (padId.endsWith('_trigger')) {
      return 'trigger';
    }
  }

  // If pad has allowed_types, use them to determine the primary data type
  if (allowedTypes && allowedTypes.length > 0) {
    const firstType = allowedTypes[0];
    const typeName = firstType.type;

    switch (typeName) {
      case 'audio_clip':
      case 'audio_frame':
      case 'audio':
        return 'audio';
      case 'video_clip':
      case 'video_frame':
      case 'video':
        return 'video';
      case 'string':
      case 'text':
        return 'text';
      case 'bool':
      case 'boolean':
        return 'boolean';
      case 'int':
      case 'integer':
        return 'integer';
      case 'float':
      case 'number':
        return 'number';
      case 'trigger':
        return 'trigger';
      case 'context_message':
        return 'data';
      default:
        return 'data';
    }
  }

  // Default fallback
  return 'data';
}