# Gabber Workflow SDK

A TypeScript/JavaScript SDK for building interactive workflow frontends that connect to Gabber backend services through LiveKit.

## Installation

```bash
npm install gabber-workflow-core
```

## Quick Start

```javascript
import { WorkflowEngine } from 'gabber-workflow-core';

// 1. Create and configure the engine
const engine = new WorkflowEngine();
engine.configure({
  apiBaseUrl: 'https://api.gabber.com',
  apiKey: 'your-api-key'  // Or use bearerToken for OAuth authentication
});

// 2. Start a workflow
const connectionDetails = await engine.startAppRun({
  appId: 'your-workflow-app-id',
  version: 1,
  inputs: {}  // Optional workflow inputs
});

// 3. Connect to the Gabber workflow
await engine.connect(connectionDetails);

// 4. Set up event listeners
engine.on('connection-state-changed', (state) => {
  console.log('Workflow connection state:', state);
});

// 5. Access nodes and interact with pads
const vadNode = engine.getNode('vad-node-id');
const ttsNode = engine.getNode('tts-node-id');
const humanNode = engine.getNode('human-node-id');

// 6. Publish audio/video streams
if (humanNode) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioPad = humanNode.getAudioSourcePadByName('Audio Output');
  if (audioPad) {
    await audioPad.publish(stream);
  }
}

// 7. Subscribe to audio/video outputs
const ttsAudioPad = ttsNode?.getAudioSourcePadByName('Audio Output');
if (ttsAudioPad) {
  const audioElement = document.createElement('audio');
  await ttsAudioPad.subscribe(audioElement);
}
```

## Core Classes

### WorkflowEngine

**Configuration:**
```javascript
engine.configure({
  apiBaseUrl: 'https://api.gabber.com',  // Required
  apiKey: 'your-api-key',                // Required
});
```

**Workflow Management:**
- `startAppRun(config)` - Start a workflow run
- `connect(details)` - Connect to workflow session
- `stopAppRun()` - Stop the current workflow run
- `disconnect()` - Disconnect from session

**Node Access:**
- `getNode(nodeId)` - Get specific node by ID (preferred for known nodes)
- `listNodes()` - Get all discovered nodes
- `getConnectionState()` - Get current workflow connection state

### WorkflowNode

**Pad Access Methods:**
- `getInputPads(dataType?)` - Get input pads (sink pads), optionally filtered by type
- `getOutputPads(dataType?)` - Get output pads (source pads), optionally filtered by type

**Named Pad Access (Recommended):**
- `getAudioSourcePadByName(name)` - Get audio source pad by name
- `getAudioSinkPadByName(name)` - Get audio sink pad by name
- `getVideoSourcePadByName(name)` - Get video source pad by name
- `getVideoSinkPadByName(name)` - Get video sink pad by name
- `getTriggerSourcePadByName(name)` - Get trigger source pad by name
- `getTriggerSinkPadByName(name)` - Get trigger sink pad by name
- `getDataSourcePadByName(name)` - Get data source pad by name
- `getDataSinkPadByName(name)` - Get data sink pad by name

### StreamPad

**Publishing/Subscribing:**
- `publish(data)` - Publish data/stream to the pad (source pads only)
- `unpublish()` - Stop publishing (source pads only)
- `subscribe(element)` - Subscribe audio/video element to pad streams
- `unsubscribe()` - Unsubscribe from pad
- `getCurrentStream()` - Get current stream on the pad
- `getCurrentData()` - Get current data on the pad

**Triggers:**
- `trigger(data?)` - Send trigger event (trigger pads only)

**State:**
- `isPublishing()` - Check if pad is publishing
- `isSubscribed()` - Check if pad is subscribed
- `getConnectionState()` - Check if pad is connected
- `subscribeState` - Get subscription state ('unsubscribed' | 'subscribing' | 'subscribed' | 'error')

## Events

### Engine Events
```javascript
engine.on('connection-state-changed', (state) => {
  console.log('Connection state:', state); // 'disconnected' | 'connecting' | 'connected'
});

engine.on('error', (error) => {
  console.error('Engine error:', error);
});
```

### Pad Events
```javascript
// Data events
pad.on('data-received', (data) => {
  console.log('Data received:', data);
});

// Stream events (for audio/video)
pad.on('stream-received', (stream) => {
  console.log('Stream received:', stream);
});

// Trigger events
pad.on('trigger-received', (data) => {
  console.log('Trigger received:', data);
});

// Subscription state changes
pad.on('subscribe-state-changed', (state) => {
  console.log('Subscribe state:', state);
});
```

## Best Practices

### Error Handling

```javascript
// Monitor for runtime errors
engine.on('error', (error) => {
  console.error('Runtime error:', error);
});

// Handle pad-level errors
pad.on('subscribe-state-changed', (state) => {
  if (state === 'error') {
    console.error('Pad subscription failed');
  }
});
```

### Resource Cleanup
```javascript
// Clean up when done
await pad.unpublish();
await pad.unsubscribe();
await engine.disconnect();
```

## TypeScript Support

The SDK is built with TypeScript and provides full type definitions:

```typescript
import { WorkflowEngine, WorkflowNode, StreamPad } from 'gabber-workflow-core';

const engine: WorkflowEngine = new WorkflowEngine();
const node: WorkflowNode | null = engine.getNode('node-id');
const audioPads: StreamPad[] = node?.getInputPads('audio') || [];
```

## Demo

See the `demo/` folder for a complete interactive example showcasing:
- Real-time workflow connection
- Audio/video streaming
- Event-driven interaction with workflow nodes
- Visual node discovery and debugging