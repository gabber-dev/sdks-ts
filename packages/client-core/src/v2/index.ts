/**
 * @file Main entry point for the Gabber Workflow SDK
 * @module gabber-workflow-sdk
 */

/** Main workflow engine class */
export { AppEngine } from './AppEngine';
/** Base class for workflow nodes */
export { WorkflowNode } from './WorkflowNode';
/** Class representing input/output pads on nodes */
export { StreamPad } from './StreamPad';

/** Type definitions for the SDK */
export type {
  /** Interface for the workflow engine */
  IAppEngine,
  /** Interface for workflow nodes */
  IWorkflowNode,
  /** Interface for stream pads */
  IStreamPad,
  /** Events emitted by the workflow engine */
  AppEngineEvents,
  /** Events emitted by workflow nodes */
  WorkflowNodeEvents,
  /** Events emitted by stream pads */
  StreamPadEvents,
  /** Configuration for starting an app run */
  AppRunConfig,
  /** Connection details for a workflow */
  ConnectionDetails,
  /** Configuration options for the workflow engine */
  AppEngineConfig,
  /** Connection state of the workflow engine */
  ConnectionState,
  /** Type identifier for workflow nodes */
  NodeType,

  /** Type of data that can flow through a pad */
  PadDataType,
  /** Configuration for creating a new pad */
  PadConfig,

  /** Base pad data type definition */
  PadDataTypeDefinition,
  /** Specific type definitions */
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
  SpecificDataType
} from './types';

export { PadType, isSourcePad, isSinkPad, deriveDataType } from './types';