# Gabber Workflow SDK v2 - React Demo

A React-based demo showcasing the Gabber Workflow SDK v2 React integration.

## Features

This demo demonstrates:

- **Configuration**: Easy workflow connection setup with proxy server support
- **Status Management**: Real-time connection, microphone, camera, and run state monitoring
- **Video Preview**: Live video stream preview from connected cameras
- **Trigger Events**: Real-time event logging for workflow interactions
- **Node Discovery**: Visual display of discovered workflow nodes and their pads
- **React Best Practices**: Proper use of hooks, context, and component composition

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A running Gabber proxy server (usually at `http://localhost:3003`)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser to `http://localhost:3001`

### Building for Production

```bash
npm run build
npm run preview
```

## Usage

1. **Configure Connection**: Enter your proxy server URL and workflow App ID
2. **Start Workflow**: Click "Start Voice & Video Workflow" to connect
3. **Control Media**: Use microphone and camera controls once connected
4. **Monitor Events**: Watch real-time trigger events and node activities
5. **Explore Nodes**: View discovered workflow nodes and their pad configurations

## Architecture

The demo is built using:

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Gabber React SDK v2** for workflow integration
- **CSS Grid/Flexbox** for responsive layout

### Component Structure

```
src/
├── App.tsx                    # Main app with AppEngineProvider
├── components/
│   ├── Configuration.tsx      # Workflow connection setup
│   ├── Status.tsx            # Status monitoring and controls
│   ├── VideoPreview.tsx      # Video stream preview
│   ├── TriggerEvents.tsx     # Real-time event logging
│   └── WorkflowNodes.tsx     # Node and pad visualization
├── App.css                   # Component styling
├── index.css                 # Global styles
└── main.tsx                  # React entry point
```

## Comparison with Original Demo

This React demo provides the same functionality as the original vanilla JavaScript demo but with:

- **Type Safety**: Full TypeScript support throughout
- **Component Architecture**: Modular, reusable React components
- **React State Management**: Proper use of React hooks and context
- **Better UX**: More responsive and interactive interface
- **Modern Development**: Vite for fast development and hot reloading

## Development

The demo uses the React SDK v2 hooks:

- `v2.useAppEngine()` - Access workflow engine and state
- `v2.useWorkflowNode()` - Work with individual nodes
- `v2.useStreamPad()` - Interact with node pads
- `v2.useAudioPad()` / `v2.useVideoPad()` - Media-specific pad controls

## Troubleshooting

**Connection Issues**: Ensure your proxy server is running and accessible
**Node Discovery**: Check console logs for node discovery events
**Media Permissions**: Grant microphone/camera permissions when prompted
**Audio Playback**: Audio monitoring requires user interaction to start

## Learn More

- [Gabber Workflow SDK v2 Documentation](../../packages/client-react/src/v2/README.md)
- [Original Demo](../index.html) for comparison
- [Proxy Server Setup](../proxy-server/README.md)
