# Gabber Workflow SDK v2 - React Integration

A React integration for the Gabber Workflow SDK v2, providing hooks and providers for building interactive workflow frontends with React best practices.

## Installation

```bash
npm install gabber-client-react gabber-client-core
```

## Quick Start

```tsx
import React from "react";
import { v2 } from "gabber-client-react";

function App() {
  return (
    <v2.AppEngineProvider config={{ apiBaseUrl: "https://api.gabber.com" }}>
      <WorkflowComponent />
    </v2.AppEngineProvider>
  );
}

function WorkflowComponent() {
  const { connect, connectionState, disconnect, publisherNode } = v2.useAppEngine();

  const handleConnect = async () => {
    // Get connection details from your proxy server
    const response = await fetch("/api/workflow/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId: "my-workflow", version: 1 }),
    });
    const { connectionDetails } = await response.json();

    await connect(connectionDetails);
  };

  const enableMicrophone = async () => {
    if (publisherNode) {
      const audioPad = publisherNode.getSourcePad("audio_source");
      if (audioPad) {
        await audioPad.setMicrophoneEnabled(true);
      }
    }
  };

  return (
    <div>
      <button onClick={handleConnect} disabled={connectionState === "connected"}>
        Connect
      </button>
      <button onClick={enableMicrophone} disabled={connectionState !== "connected"}>
        Enable Microphone
      </button>
      <button onClick={disconnect}>Disconnect</button>

      <p>Status: {connectionState}</p>
    </div>
  );
}
```

## Core Components

### AppEngineProvider

Provides the workflow engine context to your React app.

```tsx
import { v2 } from "gabber-client-react";

function App() {
  return (
    <v2.AppEngineProvider
      config={{
        apiBaseUrl: "https://api.gabber.com",
        apiKey: "your-api-key", // Optional - use proxy server instead for web apps
      }}
    >
      {/* Your app components */}
    </v2.AppEngineProvider>
  );
}
```

### useAppEngine

Access the workflow engine and its state.

```tsx
function MyComponent() {
  const {
    engine, // AppEngine instance
    connectionState, // 'disconnected' | 'connecting' | 'connected'
    runState, // 'idle' | 'starting' | 'running' | 'stopping'
    nodes, // Array of discovered nodes
    publisherNode, // Automatically discovered publisher node
    lastError, // Last error that occurred
    nodesDiscovered, // Whether nodes have been discovered
    connect, // Function to connect to workflow
    disconnect, // Function to disconnect
    getNode, // Function to get node by ID
    configure, // Function to update configuration
  } = v2.useAppEngine();

  // Connection management
  const handleConnect = async () => {
    const connectionDetails = await getConnectionDetails();
    await connect(connectionDetails);
  };

  return (
    <div>
      <p>Connection: {connectionState}</p>
      <p>Run State: {runState}</p>
      <p>Nodes: {nodes.length}</p>
      {lastError && <p>Error: {lastError.message}</p>}
    </div>
  );
}
```

## Node Hooks

### useWorkflowNode

Work with individual workflow nodes.

```tsx
function NodeComponent() {
  const {
    node, // The node instance
    exists, // Whether the node exists
    pads, // All pads on the node
    sourcePads, // Output pads
    sinkPads, // Input pads
    getPad, // Get pad by ID
    getSourcePad, // Get source pad by ID
    getSinkPad, // Get sink pad by ID
    getInputPads, // Get input pads (optionally filtered by type)
    getOutputPads, // Get output pads (optionally filtered by type)
  } = v2.useWorkflowNode({ nodeId: "llm_0" });

  if (!exists) {
    return <div>Node not found</div>;
  }

  return (
    <div>
      <h3>
        {node.type} ({node.id})
      </h3>
      <p>Pads: {pads.length}</p>
      <p>Audio Pads: {getOutputPads("audio").length}</p>
    </div>
  );
}
```

### useWorkflowNodeByType

Find nodes by type when you don't know the exact ID.

```tsx
function TTSComponent() {
  const ttsNodeHook = v2.useWorkflowNodeByType("tts");

  if (!ttsNodeHook?.exists) {
    return <div>No TTS node found</div>;
  }

  const { node } = ttsNodeHook;

  return <div>Found TTS node: {node.id}</div>;
}
```

## Pad Hooks

### useStreamPad

Work with individual stream pads.

```tsx
function PadComponent() {
  const publisher = v2.usePublisher();
  const audioPad = publisher.audioPad;

  const {
    pad, // The pad instance
    exists, // Whether pad exists
    isConnected, // Connection state
    isPublishing, // Publishing state
    isSubscribed, // Subscription state
    currentStream, // Current media stream
    value, // Current value (property pads)
    isPropertyPad, // Whether this is a property pad
    dataType, // Derived data type
    setMicrophoneEnabled, // Enable/disable microphone
    setVideoEnabled, // Enable/disable camera
    setEnabled, // Enable/disable at source level
    setValue, // Set value (property pads)
  } = v2.useStreamPad({ pad: audioPad });

  return (
    <div>
      <p>Pad: {pad?.name}</p>
      <p>Type: {dataType}</p>
      <p>Connected: {isConnected ? "Yes" : "No"}</p>
      <p>Publishing: {isPublishing ? "Yes" : "No"}</p>
    </div>
  );
}
```

### useAudioPad

Specialized hook for audio pads.

```tsx
function AudioControls() {
  const { publisherNode } = v2.useAppEngine();
  const audioPad = publisherNode?.getSourcePad("audio_source") || null;
  const { enableMicrophone, disableMicrophone, enableAudio, disableAudio, isAudioPad, currentStream } =
    v2.useAudioPad(audioPad);

  return (
    <div>
      <button onClick={() => enableMicrophone()}>Enable Microphone</button>
      <button onClick={disableMicrophone}>Disable Microphone</button>
      {currentStream && <p>Audio stream active</p>}
    </div>
  );
}
```

### usePropertyPad

Work with property pads for configuration.

```tsx
function LLMSettings() {
  const { nodes } = v2.useAppEngine();
  // Find your LLM node (you would know the ID from your workflow)
  const llmNode = nodes.find((node) => node.type === "llm");
  const temperaturePad = llmNode?.getSinkPad("temperature") || null;
  const temperatureControl = v2.usePropertyPad(temperaturePad);

  const handleTemperatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    temperatureControl.updateValue(value);
  };

  return (
    <div>
      <label>
        Temperature:
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={temperatureControl.value || 0.7}
          onChange={handleTemperatureChange}
        />
      </label>
      <span>{temperatureControl.value}</span>
    </div>
  );
}
```

## Working with Nodes

Access any workflow node using the generic node hooks.

```tsx
function WorkingWithNodes() {
  const { nodes, getNode } = v2.useAppEngine();

  // Get a specific node by ID (you'll know this from your workflow definition)
  const specificNode = v2.useWorkflowNode({ nodeId: "my-node-id" });

  // Find nodes by type (if you need to discover them dynamically)
  const ttsNodes = nodes.filter((node) => node.type === "tts");
  const firstTTSNode = ttsNodes[0];

  return (
    <div>
      <h3>Available Nodes: {nodes.length}</h3>
      {nodes.map((node) => (
        <div key={node.id}>
          {node.type} - {node.id}
        </div>
      ))}
    </div>
  );
}
```

## Advanced Patterns

### Custom Audio Elements

```tsx
function CustomAudioOutput() {
  const { publisherNode } = v2.useAppEngine();
  const audioRef = useRef<HTMLAudioElement>(null);

  const enableAudioWithCustomElement = async () => {
    if (publisherNode && audioRef.current) {
      const audioPad = publisherNode.getSourcePad("audio_source");
      if (audioPad) {
        await audioPad.setEnabled(true, { element: audioRef.current });
      }
    }
  };

  return (
    <div>
      <audio ref={audioRef} controls />
      <button onClick={enableAudioWithCustomElement}>Enable Audio with Custom Element</button>
    </div>
  );
}
```

### Working with Multiple Nodes

```tsx
function MultipleNodes() {
  const { nodes } = v2.useAppEngine();

  // Find all nodes of a specific type
  const ttsNodes = nodes.filter((node) => node.type === "tts");

  return (
    <div>
      <h3>TTS Nodes Found: {ttsNodes.length}</h3>
      {ttsNodes.map((node, index) => (
        <div key={node.id}>
          <h4>
            TTS Node {index + 1} ({node.id})
          </h4>
          <NodeControls node={node} />
        </div>
      ))}
    </div>
  );
}

function NodeControls({ node }: { node: v2.IWorkflowNode }) {
  const audioPads = node.getOutputPads("audio");

  return (
    <div>
      <p>Audio Output Pads: {audioPads.length}</p>
    </div>
  );
}
```

### Error Handling

```tsx
function ErrorHandling() {
  const { lastError, connectionState, publisherNode } = v2.useAppEngine();
  const [isPublishing, setIsPublishing] = useState(false);

  const handleMicrophoneToggle = async () => {
    try {
      if (publisherNode) {
        const audioPad = publisherNode.getSourcePad("audio_source");
        if (audioPad) {
          if (isPublishing) {
            await audioPad.setMicrophoneEnabled(false);
            setIsPublishing(false);
          } else {
            await audioPad.setMicrophoneEnabled(true);
            setIsPublishing(true);
          }
        }
      }
    } catch (error) {
      console.error("Microphone error:", error);
    }
  };

  return (
    <div>
      {lastError && <div style={{ color: "red" }}>Error: {lastError.message}</div>}

      <button onClick={handleMicrophoneToggle} disabled={connectionState !== "connected"}>
        {isPublishing ? "Disable" : "Enable"} Microphone
      </button>
    </div>
  );
}
```

### Event Listeners

```tsx
function EventListeners() {
  const { nodes } = v2.useAppEngine();
  const [speechActive, setSpeechActive] = useState(false);

  useEffect(() => {
    // Find a VAD node (example - you would know your node IDs from your workflow)
    const vadNode = nodes.find((node) => node.type === "vad");
    if (!vadNode) return;

    const speechStartedPad = vadNode.getSourcePad("speech_started_trigger");
    const speechEndedPad = vadNode.getSourcePad("speech_ended_trigger");

    if (!speechStartedPad || !speechEndedPad) return;

    const handleSpeechStart = () => setSpeechActive(true);
    const handleSpeechEnd = () => setSpeechActive(false);

    speechStartedPad.on("trigger-received", handleSpeechStart);
    speechEndedPad.on("trigger-received", handleSpeechEnd);

    return () => {
      speechStartedPad.off("trigger-received", handleSpeechStart);
      speechEndedPad.off("trigger-received", handleSpeechEnd);
    };
  }, [nodes]);

  return (
    <div>
      <div className={speechActive ? "speech-active" : "speech-inactive"}>
        Speech Status: {speechActive ? "Active" : "Inactive"}
      </div>
    </div>
  );
}
```

## TypeScript Support

The React SDK is fully typed and provides excellent TypeScript support:

```tsx
import { v2, type v2.ConnectionState, type v2.IWorkflowNode } from 'gabber-client-react';

function TypedComponent() {
  const engine: v2.AppEngineContextData = v2.useAppEngine();
  const node: v2.UseWorkflowNodeReturn = v2.useWorkflowNode({ nodeId: 'my-node-id' });

  // Type-safe pad access
  const audioPads = node.getOutputPads('audio'); // IStreamPad[] with audio type
  const firstAudioPad = audioPads[0];

  return <div>Fully typed!</div>;
}
```

## Best Practices

1. **Use the Provider Pattern**: Always wrap your app with `AppEngineProvider`
2. **Handle Loading States**: Check `connectionState` and `nodesDiscovered` before using nodes
3. **Error Handling**: Always handle errors when calling async methods
4. **Cleanup**: The hooks handle cleanup automatically, but be mindful of manual event listeners
5. **Proxy Server**: Use a proxy server for web apps instead of exposing API keys
6. **Know Your Node IDs**: You should know the node IDs from your workflow definition to access specific nodes

## Migration from V1

The V2 React SDK is not backwards compatible with V1. Key differences:

- **Namespace**: Import from `v2` namespace
- **Provider**: Use `AppEngineProvider` instead of `RealtimeSessionEngineProvider`
- **Hooks**: Use workflow-specific hooks instead of session-based hooks
- **Architecture**: Based on workflow nodes and pads instead of sessions
