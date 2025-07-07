# Gabber Workflow SDK

A TypeScript/JavaScript SDK for building interactive workflow frontends that connect to Gabber backend services through LiveKit.

## Installation

```bash
npm install gabber-workflow-core
```

## Quick Start

```javascript
import { AppEngine } from 'gabber-workflow-core';

// 1. Create and configure the engine
const engine = new AppEngine();
engine.configure({
  apiBaseUrl: 'https://api.gabber.com',
  apiKey: 'your-api-key'  // Required for direct API calls
});

// 2. Get connection details from your proxy server (recommended for web apps)
const response = await fetch('your-proxy-server/app/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ appId: 'your-workflow-app-id', version: 1 })
});
const { connectionDetails } = await response.json();

// 3. Connect to the Gabber workflow
await engine.connect(connectionDetails);

// 4. Enable microphone input
const publisherNode = engine.publisherNode;
const publisherAudioPad = publisherNode.getSourcePad('audio_source');
if (publisherAudioPad) {
  await publisherAudioPad.setMicrophoneEnabled(true);
}

// 5. Enable TTS audio output - the SDK will automatically manage audio playback
const ttsNode = engine.getNode('tts-node-id');
if (ttsNode) {
  const ttsAudioPad = ttsNode.getSourcePad('audio_source');
  if (ttsAudioPad) {
    await ttsAudioPad.setEnabled(true);  // Creates and manages audio element automatically
  }
}
```

## Core Classes

### AppEngine

**Configuration:**
```javascript
engine.configure({
  apiBaseUrl: 'https://api.gabber.com',  // Required
  apiKey: 'your-api-key',                // Optional - for API key authentication
  bearerToken: 'your-bearer-token'       // Optional - for Bearer token authentication
});
```

**Workflow Management:**
- `connect(details)` - Connect to workflow session
- `disconnect()` - Disconnect from session and clean up all resources

**Node Access:**
- `getNode(nodeId)` - Get specific node by ID
- `listNodes()` - Get all discovered nodes
- `getConnectionState()` - Get current connection state
- `getRunState()` - Get current run state ('idle', 'starting', 'running', 'stopping')
- `publisherNode` - Get the publisher node

**Events:**
- `'connection-state-changed'` - Emitted when connection state changes
- `'run-state-changed'` - Emitted when run state changes
- `'nodes-discovered'` - Emitted when nodes have been discovered from the backend
- `'error'` - Emitted when an error occurs

### WorkflowNode

**Pad Access:**
- `getSourcePad(padId)` - Get source pad by ID
- `getSinkPad(padId)` - Get sink pad by ID
- `getInputPads(dataType?)` - Get input pads (sink pads), optionally filtered by type
- `getOutputPads(dataType?)` - Get output pads (source pads), optionally filtered by type

### StreamPad

**Audio/Video Control:**
- `setMicrophoneEnabled(enabled)` - Enable/disable microphone for audio pads
- `setVideoEnabled(enabled)` - Enable/disable camera for video pads
- `setEnabled(enabled, options?)` - Enable/disable audio track at the source level
  - `enabled` - Boolean to enable/disable the track
  - `options` - Optional configuration object:
    - `element?: HTMLAudioElement` - Optional audio element to control. If not provided, an audio element will be automatically created and managed
  - Returns a Promise that resolves when the track state has been updated

**State Access:**
- `getCurrentStream()` - Get current stream on the pad
- `getConnectionState()` - Get current connection state
- `isPublishing()` - Check if pad is publishing
- `isSubscribed()` - Check if pad is subscribed to a stream

**Property Pad Methods:**
- `getValue()` - Get current value (for property pads)
- `setValue(value)` - Set value (for property pads)
- `isPropertyPad()` - Check if this is a property pad
- `isStatelessPad()` - Check if this is a stateless pad

**Events:**
- `'data-received'` - Emitted when data is received on a pad
- `'stream-received'` - Emitted when a media stream is received
- `'trigger-received'` - Emitted when a trigger event is received
- `'connection-changed'` - Emitted when pad connection state changes
- `'connection-state-changed'` - Emitted by engine when connection state changes
- `'error'` - Emitted by engine when an error occurs

## Common Patterns

### Proxy Server Setup (Recommended for Web Apps)

For web applications, it's recommended to use a proxy server to handle API keys securely:

```javascript
// Your proxy server endpoint
const proxyServerUrl = 'https://your-proxy-server.com';

const engine = new AppEngine();
// No need to configure API keys when using proxy

// Create session through proxy
const response = await fetch(`${proxyServerUrl}/app/run`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    appId: 'your-workflow-app-id',
    version: 1,
    inputs: {}
  })
});

const { connectionDetails } = await response.json();
await engine.connect(connectionDetails);
```

### Audio Track Control
```javascript
// Example 1: Basic microphone control
const publisherNode = engine.publisherNode;
if (publisherNode) {
  const microphonePad = publisherNode.getSourcePad('audio_source');
  if (microphonePad) {
    // Enable microphone
    await microphonePad.setMicrophoneEnabled(true);

    // Enable audio monitoring (SDK automatically creates and manages audio element)
    await microphonePad.setEnabled(true);
  }
}

// Example 2: TTS audio output
const ttsNode = engine.getNode('tts-node-id');
if (ttsNode) {
  const ttsAudioPad = ttsNode.getSourcePad('audio_source');
  if (ttsAudioPad) {
    // Enable audio playback (SDK automatically creates and manages audio element)
    await ttsAudioPad.setEnabled(true);
  }
}

// Example 3: Using custom audio elements (optional)
const outputNode = engine.getNode('output-node-id');
if (outputNode) {
  const outputAudioPad = outputNode.getSourcePad('audio_source');
  if (outputAudioPad) {
    // Optional: Use your own audio element instead of automatic management
    const customAudio = document.createElement('audio');
    customAudio.autoplay = true;
    document.body.appendChild(customAudio);

    // Use the custom audio element
    await outputAudioPad.setEnabled(true, { element: customAudio });
  }
}
```

### Audio Element Management
When using audio pads, keep in mind:
- The SDK automatically creates and manages audio elements when using `setEnabled`
- Auto-managed elements are hidden but still play audio
- For basic audio playback, just call `setEnabled(true)` - no need to create your own audio element
- For custom control, provide your own audio element via `setEnabled(true, { element: myAudioElement })`
- The SDK handles proper cleanup of auto-managed elements

### Voice and Video Interaction
```javascript
const engine = new AppEngine();
engine.configure({
  apiBaseUrl: 'https://api.gabber.com',
  apiKey: 'your-api-key'
});

// Listen for events
engine.on('run-state-changed', (state) => {
  console.log('Run state changed:', state);
});

engine.on('connection-state-changed', (state) => {
  console.log('Connection state changed:', state);
});

engine.on('nodes-discovered', () => {
  console.log('Nodes discovered, setting up...');
  setupNodes();
});

// Get connection details from proxy server
const response = await fetch(`${proxyServerUrl}/app/run`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    appId: 'voice-chat-workflow',
    version: 1
  })
});
const { connectionDetails } = await response.json();

await engine.connect(connectionDetails);

function setupNodes() {
  // Your node setup code here
}

const publisherNode = engine.publisherNode;
if (publisherNode) {
  const audioPad = publisherNode.getSourcePad('audio_source');
  const videoPad = publisherNode.getSourcePad('video_source');

  if (audioPad) {
    await audioPad.setMicrophoneEnabled(true);
  }

  if (videoPad) {
    await videoPad.setVideoEnabled(true);
  }
}

// Listen for VAD events
const vadNode = engine.getNode('vad-node-id');
if (vadNode) {
  const triggerPad = vadNode.getSourcePad('speech_started_trigger');
  triggerPad?.on('trigger-received', (data) => {
    console.log('Speech started:', data);
  });
}

// Set up audio output with monitoring control
const outputNode = engine.getNode('output-node-id');
if (outputNode) {
  const outputAudioPad = outputNode.getSourcePad('audio_source');
  if (outputAudioPad) {
    // Enable audio with custom element
    const audioElement = document.createElement('audio');
    audioElement.autoplay = true;
    document.body.appendChild(audioElement);

    await outputAudioPad.setEnabled(true, { element: audioElement });

    // Example: Disable monitoring without stopping the stream
    await outputAudioPad.setEnabled(false);

    // Example: Re-enable monitoring with a different element
    const alternateAudio = document.createElement('audio');
    await outputAudioPad.setEnabled(true, { element: alternateAudio });
  }
}
```

### Property Pads

Property pads allow you to get and set values on workflow nodes:

```javascript
const llmNode = engine.getNode('llm-node-id');
if (llmNode) {
  const temperaturePad = llmNode.getSinkPad('temperature');
  if (temperaturePad && temperaturePad.isPropertyPad()) {
    // Get current temperature value
    const currentTemp = temperaturePad.getValue();
    console.log('Current temperature:', currentTemp);

    // Set new temperature value
    temperaturePad.setValue(0.8);
  }
}
```

### Event Handling

The SDK provides several events for managing workflow state:

```javascript
const engine = new AppEngine();

// Listen for run state changes
engine.on('run-state-changed', (state) => {
  console.log('Run state:', state); // 'idle', 'starting', 'running', 'stopping'
  updateUI(state);
});

// Listen for connection state changes
engine.on('connection-state-changed', (state) => {
  console.log('Connection state:', state); // 'disconnected', 'connecting', 'connected'
  updateConnectionStatus(state);
});

// Listen for node discovery completion
engine.on('nodes-discovered', () => {
  console.log('Nodes discovered, setting up interactions...');
  setupNodeInteractions();
});

// Listen for errors
engine.on('error', (error) => {
  console.error('Workflow error:', error);
  handleError(error);
});

// Pad-level events
const pad = someNode.getSourcePad('trigger_pad');
pad.on('trigger-received', (data) => {
  console.log('Trigger received:', data);
});

pad.on('data-received', (data) => {
  console.log('Data received:', data);
});

pad.on('stream-received', (stream) => {
  console.log('Stream received:', stream);
});
```

### Node Discovery vs Direct Access
```javascript
// For production: Use convenient properties and known node IDs
const publisherNode = engine.publisherNode;  // Automatically discovered
const vadNode = engine.getNode('vad-node-id');
const llmNode = engine.getNode('llm-node-id');

// For debugging: List all available nodes
const allNodes = engine.listNodes();
console.log('Available nodes:');
allNodes.forEach(node => {
  const audioPads = node.getInputPads('audio').length + node.getOutputPads('audio').length;
  const videoPads = node.getInputPads('video').length + node.getOutputPads('video').length;
  const triggerPads = node.getOutputPads('trigger').length;

  console.log(`- ${node.type} (${node.id})`);
  console.log(`  Audio: ${audioPads}, Video: ${videoPads}, Triggers: ${triggerPads}`);
});
```

## Error Handling

```javascript
try {
  // Get connection details from proxy server
  const response = await fetch(`${proxyServerUrl}/app/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  const { connectionDetails } = await response.json();

  await engine.connect(connectionDetails);
} catch (error) {
  console.error('Failed to connect to workflow:', error.message);
}

engine.on('error', (error) => {
  console.error('Runtime error:', error);
});

// Pad-level error handling
pad.on('connection-changed', (connected) => {
  if (!connected) {
    console.error('Pad connection lost');
  }
});
```

## TypeScript Support

The SDK is built with TypeScript and provides full type definitions:

```typescript
import { AppEngine, type IWorkflowNode, type IStreamPad } from 'gabber-workflow-core';

const engine: AppEngine = new AppEngine();
const node: IWorkflowNode | null = engine.getNode('node-id');
const audioPad: IStreamPad | null = node?.getSourcePad('audio_source');
if (audioPad) {
  // Type-safe pad operations
  await audioPad.setMicrophoneEnabled(true);
}
```

## Demo

See the `demo/` folder for a complete interactive example showcasing:
- Real-time workflow connection using proxy server approach
- Audio/video streaming with microphone and camera controls
- Event-driven interaction with workflow nodes
- Visual node discovery and debugging
- Proper event handling for run state and connection state changes

The demo demonstrates the recommended proxy server approach for web applications, where API keys are handled securely on the backend rather than exposed in client-side code.

To run the demo:
```bash
cd demo
./serve.sh
```

Then open http://localhost:8080 in your browser.