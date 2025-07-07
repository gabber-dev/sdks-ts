import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GabberProxy } from './lib/gabber-proxy.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.GABBER_API_KEY) {
  console.error('❌ GABBER_API_KEY is not set in environment variables');
  process.exit(1);
}

if (!process.env.GABBER_API_URL) {
  console.warn('⚠️ GABBER_API_URL not set, defaulting to http://localhost:4000');
}

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the Gabber proxy
const gabberProxy = new GabberProxy({
  apiKey: process.env.GABBER_API_KEY,
  apiBaseUrl: process.env.GABBER_API_URL || 'http://localhost:4000'
});

// Create a new session
app.post('/api/sessions', async (req, res) => {
  try {
    console.log('📝 Creating new session with params:', req.body);

    const { appId, version, entryFlow, inputs } = req.body;

    if (!appId) {
      console.error('❌ Missing required parameter: appId');
      return res.status(400).json({ error: 'Missing required parameter: appId' });
    }

    if (!version) {
      console.error('❌ Missing required parameter: version');
      return res.status(400).json({ error: 'Missing required parameter: version' });
    }

    const session = await gabberProxy.createSession({
      appId,
      version,
      entryFlow,
      inputs
    });

    console.log('✅ Session created successfully:', { sessionId: session.sessionId });
    res.json(session);
  } catch (error) {
    console.error('❌ Error creating session:', error);
    res.status(500).json({
      error: error.message,
      details: error.stack
    });
  }
});

// Get session details
app.get('/api/sessions/:sessionId', (req, res) => {
  try {
    console.log('📝 Getting session details for:', req.params.sessionId);

    const session = gabberProxy.getSession(req.params.sessionId);
    if (!session) {
      console.warn('⚠️ Session not found:', req.params.sessionId);
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    console.log('✅ Session details retrieved successfully');
    res.json(session);
  } catch (error) {
    console.error('❌ Error getting session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a session
app.delete('/api/sessions/:sessionId', (req, res) => {
  try {
    console.log('🗑️ Deleting session:', req.params.sessionId);

    const deleted = gabberProxy.deleteSession(req.params.sessionId);
    if (!deleted) {
      console.warn('⚠️ Session not found for deletion:', req.params.sessionId);
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    console.log('✅ Session deleted successfully');
    res.status(204).send();
  } catch (error) {
    console.error('❌ Error deleting session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clean up expired sessions every hour
setInterval(() => {
  console.log('🧹 Cleaning up expired sessions...');
  gabberProxy.cleanupSessions();
}, 60 * 60 * 1000);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start the server
const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`
🚀 Proxy server running on port ${port}
📝 API URL: ${process.env.GABBER_API_URL || 'http://localhost:4000'}
🔑 API Key: ${process.env.GABBER_API_KEY ? '****' + process.env.GABBER_API_KEY.slice(-4) : 'NOT SET'}
  `);
});