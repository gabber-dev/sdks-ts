# Gabber Workflow SDK Proxy Server Example

This example demonstrates how to create a secure proxy server for the Gabber Workflow SDK that handles API key management without exposing sensitive credentials to the client.

## Features

- Secure API key management
- Session-based workflow connections
- Automatic session cleanup
- RESTful API endpoints
- CORS support
- Environment configuration

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure your environment:
```bash
cp .env.example .env
```

3. Edit `.env` with your Gabber API key and desired configuration:
```env
GABBER_API_KEY=your_api_key_here
GABBER_API_URL=http://localhost:4000
PORT=3000
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Create App Run
- **POST** `/app/run`
- Creates a new workflow app run
- Request body:
```json
{
  "appId": "your-app-id",
  "version": 1,
  "entryFlow": "optional-flow-id",
  "inputs": {}
}
```
- Response:
```json
{
  "sessionId": "unique-session-id",
  "connectionDetails": {
    "url": "wss://...",
    "token": "connection-token"
  }
}
```

### Get App Run
- **GET** `/app/run/:sessionId`
- Retrieves connection details for an existing app run
- Response:
```json
{
  "connectionDetails": {
    "url": "wss://...",
    "token": "connection-token"
  }
}
```

### Delete App Run
- **DELETE** `/app/run/:sessionId`
- Deletes an app run and its associated resources
- Response: 204 No Content

## Using with the SDK

Update your frontend code to use the proxy server instead of direct API access:

```javascript
const engine = new AppEngine();

// Create an app run through the proxy
const response = await fetch('http://localhost:3000/app/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    appId: 'your-app-id',
    version: 1
  })
});

const { sessionId, connectionDetails } = await response.json();

// Connect using the returned details
await engine.connect(connectionDetails);

// When done, clean up the app run
await fetch(`http://localhost:3000/app/run/${sessionId}`, {
  method: 'DELETE'
});
```

## Security Considerations

1. The proxy server should be deployed in a secure environment
2. Use HTTPS in production
3. Consider adding authentication for the proxy API
4. Implement rate limiting for production use
5. Monitor session usage and implement appropriate cleanup strategies

## Library Usage

The `GabberProxy` class can be used in your own applications:

```javascript
import { GabberProxy } from './lib/gabber-proxy.js';

const proxy = new GabberProxy({
  apiKey: process.env.GABBER_API_KEY,
  apiBaseUrl: process.env.GABBER_API_URL
});

// Create a session
const session = await proxy.createSession({
  appId: 'your-app-id',
  version: 1
});

// Get session details
const details = proxy.getSession(session.sessionId);

// Delete when done
proxy.deleteSession(session.sessionId);

// Cleanup old sessions
proxy.cleanupSessions(24 * 60 * 60 * 1000); // 24 hours
```