import React, { useState, useEffect, useRef } from 'react';
import { v2 } from 'gabber-client-react';

/**
 * Complete example of using the Gabber Workflow SDK v2 with React
 * This component demonstrates:
 * - Setting up the AppEngine provider
 * - Connecting to a workflow
 * - Working with nodes and pads directly
 * - Managing audio/video controls
 * - Error handling and state management
 */

// Main app component that provides the AppEngine context
export function VoiceWorkflowApp() {
  return (
    <v2.AppEngineProvider
      config={{
        apiBaseUrl: process.env.REACT_APP_GABBER_API_URL || 'http://localhost:8080',
        // Note: In production, use a proxy server instead of exposing API keys
        apiKey: process.env.REACT_APP_GABBER_API_KEY
      }}
    >
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Gabber Workflow SDK v2 - React Example</h1>
        <VoiceWorkflowExample />
      </div>
    </v2.AppEngineProvider>
  );
}

// Main workflow component
function VoiceWorkflowExample() {
  const {
    connectionState,
    runState,
    nodes,
    nodesDiscovered,
    lastError,
    connect,
    disconnect
  } = v2.useAppEngine();

  const [isConnecting, setIsConnecting] = useState(false);

  // Connect to a workflow (you would get these details from your proxy server)
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // In a real app, you'd call your proxy server to get connection details
      const response = await fetch('/api/workflow/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: 'voice-chat-workflow',
          version: 1
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start workflow');
      }

      const { connectionDetails } = await response.json();
      await connect(connectionDetails);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  return (
    <div>
      <ConnectionControls
        connectionState={connectionState}
        isConnecting={isConnecting}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <StatusDisplay
        connectionState={connectionState}
        runState={runState}
        nodesCount={nodes.length}
        nodesDiscovered={nodesDiscovered}
        lastError={lastError}
      />

      {connectionState === 'connected' && nodesDiscovered && (
        <>
          <PublisherControls />
          <NodeList nodes={nodes} />
        </>
      )}
    </div>
  );
}

// Connection controls component
interface ConnectionControlsProps {
  connectionState: v2.ConnectionState;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

function ConnectionControls({
  connectionState,
  isConnecting,
  onConnect,
  onDisconnect
}: ConnectionControlsProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>Connection Controls</h2>
      <button
        onClick={onConnect}
        disabled={connectionState !== 'disconnected' || isConnecting}
        style={{ marginRight: '10px' }}
      >
        {isConnecting ? 'Connecting...' : 'Connect to Workflow'}
      </button>
      <button
        onClick={onDisconnect}
        disabled={connectionState === 'disconnected'}
      >
        Disconnect
      </button>
    </div>
  );
}

// Status display component
interface StatusDisplayProps {
  connectionState: v2.ConnectionState;
  runState: v2.RunState;
  nodesCount: number;
  nodesDiscovered: boolean;
  lastError: Error | null;
}

function StatusDisplay({
  connectionState,
  runState,
  nodesCount,
  nodesDiscovered,
  lastError
}: StatusDisplayProps) {
  return (
    <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
      <h2>Status</h2>
      <p><strong>Connection:</strong> {connectionState}</p>
      <p><strong>Run State:</strong> {runState}</p>
      <p><strong>Nodes Discovered:</strong> {nodesDiscovered ? 'Yes' : 'No'}</p>
      <p><strong>Node Count:</strong> {nodesCount}</p>
      {lastError && (
        <p style={{ color: 'red' }}><strong>Error:</strong> {lastError.message}</p>
      )}
    </div>
  );
}

// Publisher controls using the core SDK functionality
function PublisherControls() {
  const { publisherNode } = v2.useAppEngine();
  const [audioPublishing, setAudioPublishing] = useState(false);
  const [videoPublishing, setVideoPublishing] = useState(false);

  if (!publisherNode) {
    return <div>No publisher node found</div>;
  }

  const handleMicrophoneToggle = async (enable: boolean) => {
    const audioPad = publisherNode.getSourcePad('audio_source');
    if (audioPad) {
      try {
        await audioPad.setMicrophoneEnabled(enable);
        setAudioPublishing(enable);
      } catch (error) {
        console.error('Microphone error:', error);
      }
    }
  };

  const handleCameraToggle = async (enable: boolean) => {
    const videoPad = publisherNode.getSourcePad('video_source');
    if (videoPad) {
      try {
        await videoPad.setVideoEnabled(enable);
        setVideoPublishing(enable);
      } catch (error) {
        console.error('Camera error:', error);
      }
    }
  };

  return (
    <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
      <h2>Publisher Controls (Node: {publisherNode.id})</h2>

      <div style={{ marginBottom: '10px' }}>
        <h3>Audio</h3>
        <button onClick={() => handleMicrophoneToggle(true)} disabled={audioPublishing}>
          🎤 Enable Microphone
        </button>
        <button onClick={() => handleMicrophoneToggle(false)} disabled={!audioPublishing} style={{ marginLeft: '10px' }}>
          🎤 Disable Microphone
        </button>
        <p>Status: {audioPublishing ? 'Publishing' : 'Not Publishing'}</p>
      </div>

      <div>
        <h3>Video</h3>
        <button onClick={() => handleCameraToggle(true)} disabled={videoPublishing}>
          📹 Enable Camera
        </button>
        <button onClick={() => handleCameraToggle(false)} disabled={!videoPublishing} style={{ marginLeft: '10px' }}>
          📹 Disable Camera
        </button>
        <p>Status: {videoPublishing ? 'Publishing' : 'Not Publishing'}</p>
      </div>
    </div>
  );
}



// Node list component to show all discovered nodes
interface NodeListProps {
  nodes: v2.IWorkflowNode[];
}

function NodeList({ nodes }: NodeListProps) {
  return (
    <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
      <h2>Discovered Nodes ({nodes.length})</h2>
      {nodes.length === 0 ? (
        <p>No nodes discovered yet...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
          {nodes.map((node) => (
            <NodeCard key={node.id} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}

// Individual node card component
interface NodeCardProps {
  node: v2.IWorkflowNode;
}

function NodeCard({ node }: NodeCardProps) {
  const sourcePads = node.getSourcePads();
  const sinkPads = node.getSinkPads();

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '5px',
      padding: '10px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>{node.type}</h3>
      <p><strong>ID:</strong> {node.id}</p>
      <p><strong>Source Pads:</strong> {sourcePads.length}</p>
      <p><strong>Sink Pads:</strong> {sinkPads.length}</p>

      <details>
        <summary>Pads Details</summary>
        <div style={{ marginTop: '10px' }}>
          <h4>Source Pads (Outputs):</h4>
          <ul>
            {sourcePads.map((pad) => (
              <li key={pad.id}>
                {pad.name} ({pad.dataType})
              </li>
            ))}
          </ul>

          <h4>Sink Pads (Inputs):</h4>
          <ul>
            {sinkPads.map((pad) => (
              <li key={pad.id}>
                {pad.name} ({pad.dataType})
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  );
}