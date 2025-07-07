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

/** Type of data that can flow through a pad */
export type PadDataType = 'audio' | 'video' | 'data' | 'trigger' | 'text' | 'boolean' | 'integer' | 'number';

/** Backend pad type names */
export type BackendPadType = 'StatelessSourcePad' | 'StatelessSinkPad' | 'PropertySourcePad' | 'PropertySinkPad';

/** Category of pad functionality */
export type PadCategory = 'stateless' | 'property';

/**
 * Pad data type definition from backend
 */
export interface PadDataTypeDefinition {
  type: string;
  [key: string]: any;
}

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
  /** Type of data that flows through the pad */
  dataType: PadDataType;
  /** Backend pad type */
  backendType?: BackendPadType;
  /** Category of pad functionality */
  category?: PadCategory;
  /** Current value (for property pads) */
  value?: any;
  /** Allowed data types */
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
  readonly dataType: PadDataType;
  readonly backendType?: BackendPadType | undefined;
  readonly category?: PadCategory | undefined;
  readonly value?: any;
  readonly allowedTypes?: PadDataTypeDefinition[] | undefined;
  readonly nextPads?: PadReference[] | undefined;
  readonly previousPad?: PadReference | null | undefined;

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