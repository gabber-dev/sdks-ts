/**
 * @file Gabber Workflow SDK v2 React Integration
 * @module gabber-client-react/v2
 */

// Core provider and context
export {
  AppEngineProvider,
  useAppEngine,
  type AppEngineContextData,
  type AppEngineProviderProps
} from './providers/AppEngineProvider';

// Core hooks for nodes and pads
export {
  useWorkflowNode,
  useWorkflowNodeByType,
  useWorkflowNodes,
  useWorkflowNodesByType,
  type UseWorkflowNodeOptions,
  type UseWorkflowNodeReturn
} from './hooks/useWorkflowNode';

export {
  useStreamPad,
  useAudioPad,
  useVideoPad,
  usePropertyPad,
  type UseStreamPadOptions,
  type UseStreamPadReturn
} from './hooks/useStreamPad';

// Note: This SDK mirrors the core V2 SDK functionality and does not make assumptions about specific node types

// Re-export all types from the core SDK for convenience
export type {
  // Core interfaces
  IAppEngine,
  IWorkflowNode,
  IStreamPad,

  // Configuration types
  AppEngineConfig,
  ConnectionDetails,
  AppRunConfig,
  PadConfig,

  // State types
  ConnectionState,
  RunState,
  NodeType,
  PadDataType,
  BackendPadType,
  PadCategory,

  // Data type definitions
  PadDataTypeDefinition,
  StringDataType,
  IntegerDataType,
  FloatDataType,
  BooleanDataType,
  AudioDataType,
  VideoDataType,
  TriggerDataType,
  AudioClipDataType,
  VideoClipDataType,
  AVClipDataType,
  ContextMessageDataType,
  ContextMessageRoleDataType,
  ListDataType,
  SpecificDataType,

  // Event types
  AppEngineEvents,
  WorkflowNodeEvents,
  StreamPadEvents,

  // Option types
  AudioOptions,
  VideoOptions,
  PadReference,

  // Utility types
  CreateAppRunRequest,
  CreateAppRunResponse
} from 'gabber-client-core/v2';