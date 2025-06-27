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
export interface WorkflowEngineConfig {
  /** Base URL for the API */
  apiBaseUrl?: string;
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

/** Direction of data flow for pads */
export type PadDirection = 'source' | 'sink';

/** Type of data that can flow through a pad */
export type PadDataType = 'audio' | 'video' | 'trigger' | 'data';

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
  /** Direction of data flow */
  direction: PadDirection;
  /** Type of data that flows through the pad */
  dataType: PadDataType;
}

/**
 * Events that can be emitted by the workflow engine
 */
export interface WorkflowEngineEvents {
  /** Emitted when connection state changes */
  'connection-state-changed': (state: ConnectionState) => void;
  /** Emitted when an error occurs */
  'error': (error: Error) => void;
}

/**
 * Events that can be emitted by workflow nodes
 */
export interface WorkflowNodeEvents { }

/**
 * Events that can be emitted by stream pads
 */
export interface StreamPadEvents {
  /** Emitted when data is received on the pad */
  'data-received': (data: any) => void;
  /** Emitted when a media stream is received */
  'stream-received': (stream: MediaStream) => void;
  /** Emitted when a trigger event is received */
  'trigger-received': (data?: any) => void;
  /** Emitted when connection state changes */
  'connection-changed': (connected: boolean) => void;
  /** Emitted when subscription state changes */
  'subscribe-state-changed': (state: PadSubscribeState) => void;
}

/** State of a pad's subscription */
export type PadSubscribeState = 'unsubscribed' | 'subscribing' | 'subscribed' | 'error';

/**
 * Interface for the workflow engine
 */
export interface IWorkflowEngine {
  /** Configure the workflow engine */
  configure(config: WorkflowEngineConfig): void;
  /** Start a new app run */
  startAppRun(config: AppRunConfig): Promise<ConnectionDetails>;
  /** Stop the current app run */
  stopAppRun(): Promise<void>;
  /** Connect to a workflow using connection details */
  connect(connectionDetails: ConnectionDetails): Promise<void>;
  /** Disconnect from the current workflow */
  disconnect(): Promise<void>;
  /** Get a node by its ID */
  getNode(nodeId: string): IWorkflowNode | null;
  /** List all available nodes */
  listNodes(): IWorkflowNode[];
  /** Get current connection state */
  getConnectionState(): ConnectionState;
}

/**
 * Interface for workflow nodes
 */
export interface IWorkflowNode {
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
  /** Get an audio source pad by name */
  getAudioSourcePadByName(name: string): IStreamPad | null;
  /** Get an audio sink pad by name */
  getAudioSinkPadByName(name: string): IStreamPad | null;
  /** Get a video source pad by name */
  getVideoSourcePadByName(name: string): IStreamPad | null;
  /** Get a video sink pad by name */
  getVideoSinkPadByName(name: string): IStreamPad | null;
  /** Get a trigger source pad by name */
  getTriggerSourcePadByName(name: string): IStreamPad | null;
  /** Get a trigger sink pad by name */
  getTriggerSinkPadByName(name: string): IStreamPad | null;
  /** Get a data source pad by name */
  getDataSourcePadByName(name: string): IStreamPad | null;
  /** Get a data sink pad by name */
  getDataSinkPadByName(name: string): IStreamPad | null;
  /** Clean up node resources */
  cleanup(): Promise<void>;
}

/**
 * Interface for stream pads
 */
export interface IStreamPad {
  /** Unique identifier for the pad */
  readonly id: string;
  /** ID of the node this pad belongs to */
  readonly nodeId: string;
  /** Display name of the pad */
  readonly name: string;
  /** Direction of data flow */
  readonly direction: PadDirection;
  /** Type of data that flows through the pad */
  readonly dataType: PadDataType;

  /** Publish data or media stream to the pad */
  publish(data: MediaStream | any): Promise<void>;
  /** Stop publishing to the pad */
  unpublish(): Promise<void>;
  /** Get the current media stream */
  getCurrentStream(): MediaStream | null;
  /** Get the current data */
  getCurrentData(): any;
  /** Subscribe an HTML element to the pad's media stream */
  subscribe(element: HTMLAudioElement | HTMLVideoElement): Promise<void>;
  /** Unsubscribe from the pad */
  unsubscribe(): Promise<void>;
  /** Current subscription state */
  readonly subscribeState: PadSubscribeState;
  /** Send a trigger event */
  trigger(data?: any): Promise<void>;
  /** Get current connection state */
  getConnectionState(): boolean;
  /** Check if currently publishing */
  isPublishing(): boolean;
  /** Check if currently subscribed */
  isSubscribed(): boolean;
}