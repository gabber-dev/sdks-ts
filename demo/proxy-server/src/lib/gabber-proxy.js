/**
 * GabberProxy - A secure proxy for Gabber Workflow SDK
 * Handles API key management and session creation without exposing sensitive data to the client
 */
export class GabberProxy {
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = config.apiKey;
    this.apiBaseUrl = config.apiBaseUrl || 'http://localhost:4000';
    this.sessions = new Map();
  }

  /**
   * Creates a new session and returns connection details
   * @param {Object} params - Session parameters
   * @param {string} params.appId - The app ID to create a session for
   * @param {number} params.version - The app version
   * @param {string} [params.entryFlow] - Optional entry flow
   * @param {Object} [params.inputs] - Optional input parameters
   * @returns {Promise<{sessionId: string, connectionDetails: Object}>}
   */
  async createSession({ appId, version, entryFlow, inputs = {} }) {
    try {
      console.log('📝 Creating new session with params:', { appId, version, inputs });

      const requestBody = {
        app: appId,
        version: version,
        inputs: inputs
      };

      if (entryFlow) {
        requestBody.entry_flow = entryFlow;
      }

      const response = await fetch(`${this.apiBaseUrl}/v1/app/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error creating session:', errorText);
        throw new Error(`Failed to create session: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Session created:', data);

      return {
        sessionId: data.id,
        connectionDetails: {
          url: data.connection_details.url,
          token: data.connection_details.token
        }
      };
    } catch (error) {
      console.error('❌ Error creating session:', error);
      throw error;
    }
  }

  /**
   * Gets connection details for an existing session
   * @param {string} sessionId - The session ID to look up
   * @returns {Object|null} Connection details if found
   */
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastAccessed = Date.now();
      return session;
    }
    return null;
  }

  /**
   * Deletes a session
   * @param {string} sessionId - The session ID to delete
   * @returns {boolean} True if session was found and deleted
   */
  deleteSession(sessionId) {
    return this.sessions.delete(sessionId);
  }

  /**
   * Cleans up expired sessions
   */
  cleanupSessions() {
    const now = Date.now();
    const expiryTime = 24 * 60 * 60 * 1000; // 24 hours

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastAccessed > expiryTime) {
        console.log(`Cleaning up expired session: ${sessionId}`);
        this.sessions.delete(sessionId);
      }
    }
  }
}