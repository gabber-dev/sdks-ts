"use client";
import React, { createContext, useRef, useEffect, useState, useCallback, useMemo } from "react";
import {
  AppEngine,
  type IWorkflowNode,
  type ConnectionDetails,
  type AppEngineConfig,
  type ConnectionState,
  type RunState,
  type AppEngineEvents
} from "gabber-client-core/v2";

export interface AppEngineContextData {
  /** The AppEngine instance */
  engine: AppEngine;
  /** Current connection state */
  connectionState: ConnectionState;
  /** Current run state */
  runState: RunState;
  /** Array of discovered workflow nodes */
  nodes: IWorkflowNode[];
  /** The publisher node (automatically discovered) */
  publisherNode: IWorkflowNode | null;
  /** Last error that occurred */
  lastError: Error | null;
  /** Whether nodes have been discovered */
  nodesDiscovered: boolean;

  /** Connect to a workflow */
  connect: (connectionDetails: ConnectionDetails) => Promise<void>;
  /** Disconnect from the current workflow */
  disconnect: () => Promise<void>;
  /** Get a specific node by ID */
  getNode: (nodeId: string) => IWorkflowNode | null;
  /** Configure the engine */
  configure: (config: AppEngineConfig) => void;
}

const AppEngineContext = createContext<AppEngineContextData | undefined>(undefined);

export interface AppEngineProviderProps {
  /** Initial configuration for the AppEngine */
  config?: AppEngineConfig;
  /** Children to render */
  children: React.ReactNode;
}

export function AppEngineProvider({ config, children }: AppEngineProviderProps) {
  // State management
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [runState, setRunState] = useState<RunState>('idle');
  const [nodes, setNodes] = useState<IWorkflowNode[]>([]);
  const [publisherNode, setPublisherNode] = useState<IWorkflowNode | null>(null);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [nodesDiscovered, setNodesDiscovered] = useState(false);

  // Create engine instance only once
  const engine = useRef<AppEngine | null>(null);
  const initialized = useRef(false);

  if (!initialized.current) {
    engine.current = new AppEngine(config);
    initialized.current = true;
  }

  // Event handlers wrapped in useRef to prevent recreation
  const handleConnectionStateChanged = useRef((state: ConnectionState) => {
    setConnectionState(state);
  });

  const handleRunStateChanged = useRef((state: RunState) => {
    setRunState(state);
  });

  const handleNodesDiscovered = useRef(() => {
    if (engine.current) {
      const discoveredNodes = engine.current.listNodes();
      setNodes([...discoveredNodes]);
      setPublisherNode(engine.current.publisherNode);
      setNodesDiscovered(true);
    }
  });

  const handleError = useRef((error: Error) => {
    setLastError(error);
  });

  // Set up event listeners
  useEffect(() => {
    if (!engine.current) return;

    const engineInstance = engine.current;

    engineInstance.on('connection-state-changed', handleConnectionStateChanged.current);
    engineInstance.on('run-state-changed', handleRunStateChanged.current);
    engineInstance.on('nodes-discovered', handleNodesDiscovered.current);
    engineInstance.on('error', handleError.current);

    return () => {
      engineInstance.off('connection-state-changed', handleConnectionStateChanged.current);
      engineInstance.off('run-state-changed', handleRunStateChanged.current);
      engineInstance.off('nodes-discovered', handleNodesDiscovered.current);
      engineInstance.off('error', handleError.current);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (engine.current) {
        engine.current.disconnect().catch(console.error);
      }
    };
  }, []);

  // Memoized action handlers
  const connect = useCallback(async (connectionDetails: ConnectionDetails) => {
    if (!engine.current) {
      throw new Error('AppEngine not initialized');
    }

    try {
      setLastError(null);
      await engine.current.connect(connectionDetails);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setLastError(err);
      throw err;
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!engine.current) return;

    try {
      setLastError(null);
      await engine.current.disconnect();
      // Reset state on disconnect
      setNodes([]);
      setPublisherNode(null);
      setNodesDiscovered(false);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setLastError(err);
      throw err;
    }
  }, []);

  const getNode = useCallback((nodeId: string) => {
    return engine.current?.getNode(nodeId) || null;
  }, []);

  const configure = useCallback((newConfig: AppEngineConfig) => {
    engine.current?.configure(newConfig);
  }, []);

  // Memoized context value
  const contextValue = useMemo<AppEngineContextData>(() => ({
    engine: engine.current!,
    connectionState,
    runState,
    nodes,
    publisherNode,
    lastError,
    nodesDiscovered,
    connect,
    disconnect,
    getNode,
    configure,
  }), [
    connectionState,
    runState,
    nodes,
    publisherNode,
    lastError,
    nodesDiscovered,
    connect,
    disconnect,
    getNode,
    configure,
  ]);

  return (
    <AppEngineContext.Provider value={contextValue}>
      {children}
    </AppEngineContext.Provider>
  );
}

/**
 * Hook to access the AppEngine context
 * @throws {Error} If used outside of AppEngineProvider
 */
export function useAppEngine(): AppEngineContextData {
  const context = React.useContext(AppEngineContext);
  if (!context) {
    throw new Error('useAppEngine must be used within an AppEngineProvider');
  }
  return context;
}