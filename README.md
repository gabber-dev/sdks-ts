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
        POST https://app.gabber.dev/api/v1/session/start
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

```js
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/api/start_session', async (req, res) => {
  try {
    const response = await axios.post('https://app.gabber.dev/api/v1/session/start', {
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
### Usage and Integration Notes:

- When you receive a POST request to your webhook, it indicates that the user is still connected. The agent will continue to send these requests as long as it is alive, even if the user temporarily disconnects due to internet issues.
- You can use the information from both the timeline API and the webhook to accurately calculate and deduct credits based on user activity and periods of silence.
- Future updates to the webhook might include additional information beyond the 30-second interval updates.
