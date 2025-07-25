import React, { useState } from 'react';
import { v2 } from 'gabber-client-react';

function Configuration() {
  const { connectionState, connect, disconnect } = v2.useAppEngine();
  const [proxyUrl, setProxyUrl] = useState('http://localhost:3003');
  const [appId, setAppId] = useState('d65a10e1-840d-4cc9-a8d1-8da09d3730e9');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleStartWorkflow = async () => {
    if (!appId.trim()) {
      alert('Please provide an App ID');
      return;
    }

    setIsConnecting(true);
    try {
      console.log(`🚀 Starting voice workflow: ${appId}`);

      // Get connection details from proxy server
      const response = await fetch(`${proxyUrl}/app/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appId,
          version: 1,
          inputs: {}
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`);
      }

      const { connectionDetails } = await response.json();

      // Connect to the workflow using the connection details from the proxy
      await connect(connectionDetails);

    } catch (error) {
      console.error(`❌ Failed to start workflow:`, error);
      alert(`Failed to start workflow: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStopWorkflow = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('❌ Failed to stop workflow:', error);
    }
  };

  const isConnected = connectionState === 'connected';
  const isDisconnected = connectionState === 'disconnected';

  return (
    <div className="section">
      <h3>⚙️ Configuration</h3>
      <div className="form-grid">
        <label htmlFor="proxy-url">Proxy Server URL:</label>
        <input
          id="proxy-url"
          type="text"
          value={proxyUrl}
          onChange={(e) => setProxyUrl(e.target.value)}
          placeholder="http://localhost:3003"
          disabled={!isDisconnected}
        />

        <label htmlFor="app-id">App ID:</label>
        <input
          id="app-id"
          type="text"
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          placeholder="workflow-app-id"
          disabled={!isDisconnected}
        />
      </div>

      <div className="workflow-controls">
        <button
          className="btn btn-success"
          onClick={handleStartWorkflow}
          disabled={!isDisconnected || isConnecting}
        >
          {isConnecting ? '🔄 Starting...' : '🚀 Start Voice & Video Workflow'}
        </button>

        <button
          className="btn btn-danger"
          onClick={handleStopWorkflow}
          disabled={isDisconnected}
        >
          ⏹️ Stop Workflow
        </button>

        <div className="workflow-status-display">
          <span>Status:</span>
          <span className={`status ${connectionState}`}>
            {connectionState}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Configuration;