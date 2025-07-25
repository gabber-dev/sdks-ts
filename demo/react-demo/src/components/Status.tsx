import React, { useState, useEffect } from 'react';
import { v2 } from 'gabber-client-react';

function Status() {
  const { connectionState, runState, publisherNode, nodes } = v2.useAppEngine();
  const [microphoneStatus, setMicrophoneStatus] = useState(false);
  const [cameraStatus, setCameraStatus] = useState(false);
  const [audioMonitorEnabled, setAudioMonitorEnabled] = useState(true);
  const [vadStatus, setVadStatus] = useState('Waiting');

  // Get publisher pads
  const audioPad = publisherNode?.getSourcePad('audio_source') || null;
  const videoPad = publisherNode?.getSourcePad('video_source') || null;

  // Find VAD node for speech detection
  const vadNode = nodes.find(node => node.type.toLowerCase().includes('vad'));

  // Set up VAD event listeners
  useEffect(() => {
    if (!vadNode) return;

    const speechStartedPad = vadNode.getSourcePad('speech_started_trigger');
    const speechEndedPad = vadNode.getSourcePad('speech_ended_trigger');

    const handleSpeechStarted = () => {
      setVadStatus('🗣️ Speaking');
    };

    const handleSpeechEnded = () => {
      setVadStatus('🤫 Quiet');
    };

    speechStartedPad?.on('trigger-received', handleSpeechStarted);
    speechEndedPad?.on('trigger-received', handleSpeechEnded);

    return () => {
      speechStartedPad?.off('trigger-received', handleSpeechStarted);
      speechEndedPad?.off('trigger-received', handleSpeechEnded);
    };
  }, [vadNode]);

  const toggleMicrophone = async () => {
    if (!audioPad) return;

    try {
      const newStatus = !microphoneStatus;
      await audioPad.setMicrophoneEnabled(newStatus);
      setMicrophoneStatus(newStatus);
    } catch (error) {
      console.error('❌ Microphone error:', error);
      alert(`Microphone error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const toggleCamera = async () => {
    if (!videoPad) return;

    try {
      const newStatus = !cameraStatus;
      await videoPad.setVideoEnabled(newStatus);
      setCameraStatus(newStatus);
    } catch (error) {
      console.error('❌ Camera error:', error);
      alert(`Camera error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const toggleAudioMonitor = async () => {
    // Find TTS or output nodes for audio monitoring
    const ttsNode = nodes.find(node => node.type.toLowerCase().includes('tts'));
    const outputNode = nodes.find(node => node.type.toLowerCase().includes('output'));

    const audioOutputPad = ttsNode?.getSourcePad('audio_source') || outputNode?.getSourcePad('audio_source');

    if (audioOutputPad) {
      try {
        const newStatus = !audioMonitorEnabled;
        await audioOutputPad.setEnabled(newStatus);
        setAudioMonitorEnabled(newStatus);
      } catch (error) {
        console.error('❌ Audio monitor error:', error);
      }
    }
  };

  const isConnected = connectionState === 'connected';

  if (connectionState === 'disconnected') {
    return null; // Don't show status section when disconnected
  }

  return (
    <div className="section">
      <h3>📊 Status</h3>
      <div className="status-grid">
        <div className="status-item">
          <span>Run State:</span>
          <span className={`status ${runState}`}>{runState}</span>
        </div>

        <div className="status-item">
          <span>Microphone:</span>
          <span className={`status ${microphoneStatus ? 'connected' : 'disconnected'}`}>
            {microphoneStatus ? 'on' : 'off'}
          </span>
        </div>

        <div className="status-item">
          <span>Camera:</span>
          <span className={`status ${cameraStatus ? 'connected' : 'disconnected'}`}>
            {cameraStatus ? 'on' : 'off'}
          </span>
        </div>

        <div className="status-item">
          <span>Audio Monitor:</span>
          <span className={`status ${audioMonitorEnabled ? 'connected' : 'disconnected'}`}>
            {audioMonitorEnabled ? 'on' : 'off'}
          </span>
        </div>

        <div className="status-item">
          <span>VAD Detection:</span>
          <span>{vadStatus} <span className="vad-indicator"></span></span>
        </div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <button
          className="btn btn-primary"
          onClick={toggleMicrophone}
          disabled={!isConnected || !audioPad}
        >
          🎤 {microphoneStatus ? 'Disable' : 'Enable'} Microphone
        </button>

        <button
          className="btn btn-primary"
          onClick={toggleCamera}
          disabled={!isConnected || !videoPad}
          style={{ marginLeft: '10px' }}
        >
          📹 {cameraStatus ? 'Disable' : 'Enable'} Camera
        </button>

        <button
          className="btn btn-primary"
          onClick={toggleAudioMonitor}
          disabled={!isConnected}
          style={{ marginLeft: '10px' }}
        >
          🔊 Toggle Audio Monitor
        </button>
      </div>

      <div style={{ marginTop: '10px' }}>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          {isConnected ? (
            audioPad ? 'Click microphone to start/stop recording' : 'No audio pad available'
          ) : 'Start the workflow to begin voice interaction'}
        </p>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          {isConnected ? (
            videoPad ? 'Click camera to start/stop video' : 'No video pad available'
          ) : 'Camera controls will be available after workflow starts'}
        </p>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Audio monitor controls TTS/output audio playback
        </p>
      </div>
    </div>
  );
}

export default Status;