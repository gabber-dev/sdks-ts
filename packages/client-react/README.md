# Gabber Client React

## Getting Started

### Install

```bash
npm install gabber-client-react
```

### Add Provider

```tsx
import { SessionProvider } from 'gabber-client-react'
export const MyApp = () => {
  return (
    <SessionProvider
      connectionDetails={{
        url: 'my-connection-url' // Generate these from your backend (i.e. a nextjs api handler). See gabber-server
        token: 'my-connection-token'
      }}
    >
      <MyComponent />
    </SessionProvider>
  )
}
```

  connectionState: Gabber.ConnectionState;
  messages: Gabber.SessionMessage[];
  lastError: string | null;
  microphoneEnabled: boolean;
  agentVolumeBands: number[];
  agentVolume: number;
  userVolumeBands: number[];
  userVolume: number;
  agentState: Gabber.AgentState;
  remainingSeconds: number | null;
  transcription: { text: string; final: boolean };
  canPlayAudio: boolean;
  setMicrophoneEnabled: (enabled: boolean) => Promise<void>;
  sendChatMessage: (p: Gabber.SendChatMessageParams) => Promise<void>;
  startAudio: () => Promise<void>;

### Use Hooks
```tsx
import { useSession } from 'gabber-client-react'
export const MyComponent = () => {
    const { connectionState,
            messages,
            lastError,
            microphoneEnabled,
            agentVolumeBands,
            agentVolume,
            userVolumeBands,
            userVolume,
            agentState,
            remainingSeconds,
            transcription,
            canPlayAudio,
            setMicrophoneEnabled,
            sendChatMessage,
            startAudio} = useSession();
    return (<div>your component stuff</div>)
}
```

### Integrating Gabber Sessions

### Overview

Integrate Gabber sessions into your backend to start and manage user sessions. This guide will help you set up the necessary components to initiate a Gabber session securely.

### Steps to Integrate

1. **Create a Project on Gabber.dev**
    - Navigate to [Gabber.dev](https://app.gabber.dev/) and create a new project.
2. **Create Personas and Scenarios**
    - In the Gabber dashboard, create personas and scenarios. These define the LLM prompts and voice configurations.
3. **Generate a Service Key**
    - In the Gabber dashboard, create a service key. This key is required to start a Gabber session via API.
4. **Backend Endpoint Setup**
    - Set up an endpoint in your backend to start a Gabber session. This ensures the security of the API key.
    - Example:
        
        ```
        POST /api/start_session
        
        ```
        
    - Your backend should call the Gabber API to start a session and return the connection details.
5. **API Call to Start a Session**
    - Make an HTTP POST request to Gabber's API to start a session:
        
        ```
        POST <https://app.gabber.dev/api/v1/session/start>
        Headers:
          Content-Type: application/json
          x-api-key: <your gabber dev service key>
        Body:
          {
            "persona": "<persona_id>",
            "scenario": "<scenario_id>"
          }
        
        ```
        
    - The response will include the session details and connection information:
        
        ```json
        {
          "session": { "id": "string" },
          "persona": "string",
          "scenario": "string",
          "connection_details": { "url": "string", "token": "string" }
        }
        
        ```
        
6. **Front-End Integration**
    - Use the connection details from your backend to connect to a Gabber session using the client SDK.

### Example Code

**Backend Endpoint:**

```jsx
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/api/start_session', async (req, res) => {
  try {
    const response = await axios.post('<https://app.gabber.dev/api/v1/session/start>', {
      persona: req.body.persona,
      scenario: req.body.scenario
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'your_gabber_service_key'
      }
    });

    res.json(response.data.connection_details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));

```

**Front-End Example:**

```html
<html>
<head>
  <script src="<https://unpkg.com/gabber-client-widget/dist/index.js>"></script>
  <style>
    .gabber { width: 500px; height: 500px; }
  </style>
</head>
<body>
  <div class="gabber" id="gabber"></div>
</body>
<script>
  fetch('/api/start_session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ persona: 'persona_id', scenario: 'scenario_id' })
  })
  .then(response => response.json())
  .then(connectionDetails => {
    Gabber.Widget.create({
      elementID: 'gabber',
      connectionDetails,
      settings: {
        autoConnect: true,
        primaryColor: '#ff0000',
        baseColor: '#000000',
        baseColorContent: '#ffffff'
      }
    });
  });
</script>
</html>

```

---

### Using the Gabber Widget

### Overview

This guide covers the integration and customization of the Gabber widget into your website, allowing users to interact with Gabber sessions.

### Setup

1. **Include the Gabber Widget Script**
    - Add the Gabber widget script to your HTML:
        
        ```html
        <script src="<https://unpkg.com/gabber-client-widget/dist/index.js>"></script>
        
        ```
        
2. **Create a Container for the Widget**
    - Create a div element where the widget will be attached:
        
        ```html
        <div id="gabber-div"></div>
        
        ```
        
3. **Initialize the Widget**
    - Initialize the widget using the connection details provided by your backend:
        
        ```html
        <script>
          Gabber.Widget.create({
            elementID: 'gabber-div',
            connectionDetails: { url: 'your_url', token: 'your_token' },
            settings: {
              autoConnect: true,
              primaryColor: '#ff0000',
              primaryColorContent: "#ffffff",
              secondaryColor: "#00ff00",
              secondaryColorContent: "#ffffff",
              baseColor: '#000000',
              baseColorPlusOne: "#1c1c1c",
              baseColorPlusTwo: "#373636",
              baseColorContent: '#ffffff',
              personaImage: persona.image_url || "",
              layout: 'bottom_bar',
              audioPlaybackFailed: {
                descriptionText: 'Audio playback requires a user gesture.',
                buttonText: 'Start Audio Playback',
              }
            }
          });
        </script>
        
        ```
        

### Customization Options

1. **Color Settings**
    - Customize the widget's colors to match your website's theme:
        
        ```json
        {
          "primaryColor": "#ff0000",
          "primaryColorContent": "#ffffff",
          "secondaryColor": "#00ff00",
          "secondaryColorContent": "#ffffff",
          "baseColor": "#000000",
          "baseColorPlusOne": "#1c1c1c",
          "baseColorPlusTwo": "#373636",
          "baseColorContent": "#ffffff"
        }
        
        ```
        
2. **Layout Settings**
    - Choose the layout of the widget:
        
        ```json
        {
          "layout": "bottom_bar"
        }
        
        ```
        
3. **Audio Playback Settings**
    - Customize the text for the audio playback failure UI:
        
        ```json
        {
          "audioPlaybackFailed": {
            "descriptionText": "Audio playback requires a user gesture.",
            "buttonText": "Start Audio Playback"
          }
        }
        
        ```
        

### Example Code

**HTML Example:**

```html
<html>
<head>
  <script src="<https://unpkg.com/gabber-client-widget/dist/index.js>"></script>
  <style>
    .gabber { width: 500px; height: 500px; }
  </style>
</head>
<body>
  <div class="gabber" id="gabber-div"></div>
</body>
<script>
  Gabber.Widget.create({
    elementID: 'gabber-div',
    connectionDetails: { url: 'your_url', token: 'your_token' },
    settings: {
      autoConnect: true,
      primaryColor: '#ff0000',
      baseColor: '#000000',
      baseColorContent: '#ffffff',
      layout: 'bottom_bar',
      audioPlaybackFailed: {
        descriptionText: 'Audio playback requires a user gesture.',
        buttonText: 'Start Audio Playback',
      }
    }
  });
</script>
</html>

```

### 1. Session Timeline API

**Endpoint:**

```bash
bashCopy code
GET https://app.gabber.dev/api/v1/session/<session_id>/timeline

```

**Headers:**

```arduino
arduinoCopy code
-H "x-api-key: <your api key>"

```

**Response:**

```json
jsonCopy code
{
  "status": 200,
  "body": {
    "values": [
      {
        "type": "user",
        "seconds": 0.265
      },
      {
        "type": "silence",
        "seconds": 1.513
      },
      {
        "type": "agent",
        "seconds": 1.634
      },
      {
        "type": "silence",
        "seconds": 3.683
      },
      {
        "type": "user",
        "seconds": 1.82
      },
      {
        "type": "silence",
        "seconds": 0.079
      },
      {
        "type": "user",
        "seconds": 1.042
      },
      {
        "type": "silence",
        "seconds": 0.906
      },
      {
        "type": "agent",
        "seconds": 0.132
      },
      {
        "type": "silence",
        "seconds": 0.996
      },
      {
        "type": "agent",
        "seconds": 4.501
      },
      {
        "type": "silence",
        "seconds": 763454.513
      }
    ],
    "next_page": null,
    "total_count": 12
  }
}

```

**Usage:**
This API returns a timeline of the session, indicating periods of user interaction, agent interaction, and silence. Combined with the webhook API, this can be used to determine if credits need to be deducted from users.

### 2. Webhook API

**Endpoint:**

```bash
bashCopy code
POST https://app.gabber.dev/api/v1/session/start

```

**Request Body Parameters:**

- `persona` (required)
- `scenario` (required)
- `time_limit_s` (optional)
- `webhook` (optional)

**Functionality:**
If the `webhook` parameter is specified in the request body, the agent will make a POST request to the webhook URL every 30 seconds. The body of the POST request will contain the session ID.

**Webhook POST Request Body:**

```json
jsonCopy code
{
  "session_id": "<session_id>"
}

```

### Usage and Integration Notes:

- When you receive a POST request to your webhook, it indicates that the user is still connected. The agent will continue to send these requests as long as it is alive, even if the user temporarily disconnects due to internet issues.
- You can use the information from both the timeline API and the webhook to accurately calculate and deduct credits based on user activity and periods of silence.
- Future updates to the webhook might include additional information beyond the 30-second interval updates.
