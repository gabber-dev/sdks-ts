import React from 'react';
import { v2 } from 'gabber-client-react';
import Configuration from './components/Configuration';
import Status from './components/Status';
import VideoPreview from './components/VideoPreview';
import TriggerEvents from './components/TriggerEvents';
import WorkflowNodes from './components/WorkflowNodes';
import './App.css';

function App() {
  return (
    <v2.AppEngineProvider>
      <div className="app">
        <header className="app-header">
          <h1>🎤📹 Gabber Workflow SDK v2 - React Demo</h1>
          <p>Voice & Video Workflow Demo using React SDK</p>
        </header>

        <main className="app-main">
          <Configuration />
          <Status />
          <VideoPreview />
          <TriggerEvents />
          <WorkflowNodes />
        </main>
      </div>
    </v2.AppEngineProvider>
  );
}

export default App;