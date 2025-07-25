import { useEffect, useState, useMemo, useCallback } from "react";
import type { IWorkflowNode, IStreamPad, PadDataType } from "gabber-client-core/v2";
import { useAppEngine } from "../providers/AppEngineProvider";

export interface UseWorkflowNodeOptions {
  /** The node ID to watch */
  nodeId: string;
  /** Whether to automatically update when nodes change */
  reactive?: boolean;
}

export interface UseWorkflowNodeReturn {
  /** The workflow node instance (null if not found) */
  node: IWorkflowNode | null;
  /** Whether the node exists */
  exists: boolean;
  /** All pads on the node */
  pads: IStreamPad[];
  /** Source (output) pads */
  sourcePads: IStreamPad[];
  /** Sink (input) pads */
  sinkPads: IStreamPad[];

  /** Get a specific pad by ID */
  getPad: (padId: string) => IStreamPad | null;
  /** Get source pad by ID */
  getSourcePad: <T extends PadDataType>(padId: string) => (IStreamPad & { dataType: T }) | null;
  /** Get sink pad by ID */
  getSinkPad: <T extends PadDataType>(padId: string) => (IStreamPad & { dataType: T }) | null;
  /** Get input pads filtered by data type */
  getInputPads: (dataType?: PadDataType) => IStreamPad[];
  /** Get output pads filtered by data type */
  getOutputPads: (dataType?: PadDataType) => IStreamPad[];
}

/**
 * Hook for working with a specific workflow node
 * Provides reactive access to node state and methods
 */
export function useWorkflowNode({
  nodeId,
  reactive = true
}: UseWorkflowNodeOptions): UseWorkflowNodeReturn {
  const { nodes, getNode } = useAppEngine();
  const [, forceUpdate] = useState({});

  // Get the current node
  const node = useMemo(() => getNode(nodeId), [nodeId, getNode, nodes]);

  // Force re-render when nodes change if reactive is enabled
  useEffect(() => {
    if (reactive) {
      forceUpdate({});
    }
  }, [nodes, reactive]);

  // Compute derived state
  const exists = node !== null;

  const pads = useMemo(() => {
    if (!node) return [];
    return [...node.getSourcePads(), ...node.getSinkPads()];
  }, [node]);

  const sourcePads = useMemo(() => {
    return node?.getSourcePads() || [];
  }, [node]);

  const sinkPads = useMemo(() => {
    return node?.getSinkPads() || [];
  }, [node]);

  // Memoized methods
  const getPad = useCallback((padId: string) => {
    return node?.getPad(padId) || null;
  }, [node]);

  const getSourcePad = useCallback(<T extends PadDataType>(padId: string) => {
    return node?.getSourcePad<T>(padId) || null;
  }, [node]);

  const getSinkPad = useCallback(<T extends PadDataType>(padId: string) => {
    return node?.getSinkPad<T>(padId) || null;
  }, [node]);

  const getInputPads = useCallback((dataType?: PadDataType) => {
    return node?.getInputPads(dataType) || [];
  }, [node]);

  const getOutputPads = useCallback((dataType?: PadDataType) => {
    return node?.getOutputPads(dataType) || [];
  }, [node]);

  return {
    node,
    exists,
    pads,
    sourcePads,
    sinkPads,
    getPad,
    getSourcePad,
    getSinkPad,
    getInputPads,
    getOutputPads,
  };
}

/**
 * Hook for finding a node by type (useful when you don't know the exact ID)
 */
export function useWorkflowNodeByType(nodeType: string): UseWorkflowNodeReturn | null {
  const { nodes } = useAppEngine();

  const matchingNode = useMemo(() => {
    return nodes.find(node =>
      node.type.toLowerCase() === nodeType.toLowerCase() ||
      node.type.toLowerCase().includes(nodeType.toLowerCase())
    ) || null;
  }, [nodes, nodeType]);

  const nodeId = matchingNode?.id || '';

  return matchingNode ? useWorkflowNode({ nodeId }) : null;
}

/**
 * Hook for accessing multiple nodes by their IDs
 */
export function useWorkflowNodes(nodeIds: string[]): UseWorkflowNodeReturn[] {
  const results = nodeIds.map(nodeId => useWorkflowNode({ nodeId }));
  return results;
}

/**
 * Hook for getting nodes filtered by type
 */
export function useWorkflowNodesByType(nodeType: string): UseWorkflowNodeReturn[] {
  const { nodes } = useAppEngine();

  const matchingNodes = useMemo(() => {
    return nodes.filter(node =>
      node.type.toLowerCase() === nodeType.toLowerCase() ||
      node.type.toLowerCase().includes(nodeType.toLowerCase())
    );
  }, [nodes, nodeType]);

  const nodeIds = matchingNodes.map(node => node.id);
  return useWorkflowNodes(nodeIds);
}