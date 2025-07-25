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

// Create a new app run
app.post('/app/run', async (req, res) => {
  try {
    console.log('📝 Creating new app run with params:', req.body);

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

    console.log('✅ App run created successfully:', { sessionId: session.sessionId });
    res.json(session);
  } catch (error) {
    console.error('❌ Error creating app run:', error);
    res.status(500).json({
      error: error.message,
      details: error.stack
    });
  }
});

// Get app run details
app.get('/app/run/:sessionId', (req, res) => {
  try {
    console.log('📝 Getting app run details for:', req.params.sessionId);

    const session = gabberProxy.getSession(req.params.sessionId);
    if (!session) {
      console.warn('⚠️ App run not found:', req.params.sessionId);
      res.status(404).json({ error: 'App run not found' });
      return;
    }

    console.log('✅ App run details retrieved successfully');
    res.json(session);
  } catch (error) {
    console.error('❌ Error getting app run:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete an app run
app.delete('/app/run/:sessionId', (req, res) => {
  try {
    console.log('🗑️ Deleting app run:', req.params.sessionId);

    const deleted = gabberProxy.deleteSession(req.params.sessionId);
    if (!deleted) {
      console.warn('⚠️ App run not found for deletion:', req.params.sessionId);
      res.status(404).json({ error: 'App run not found' });
      return;
    }

    console.log('✅ App run deleted successfully');
    res.status(204).send();
  } catch (error) {
    console.error('❌ Error deleting app run:', error);
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
const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`
🚀 Proxy server running on port ${port}
📝 API URL: ${process.env.GABBER_API_URL || 'http://localhost:4000'}
🔑 API Key: ${process.env.GABBER_API_KEY ? '****' + process.env.GABBER_API_KEY.slice(-4) : 'NOT SET'}
  `);
});