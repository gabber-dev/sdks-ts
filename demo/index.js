import { v2 } from './gabber-client-core.mjs';
const { AppEngine } = v2;
const NODE_IDS = {
  publisher: '3d5b2db6-a72a-4164-a7ce-82aee3048ab0',
  vad: 'd974a0ea-daee-4d07-b8cb-2ebd626ee98f',
  output: 'bb8fa49e-2dec-41f2-94c9-a8cda2c7ec70',
  omni_llm: 'fecb90d0-8faa-409c-9adf-f2236ee56430',
  tts: '216b59bd-0f46-484f-b463-da208219b806',
  llm_context_events: '5a6b9958-424a-4c25-9f5b-b662f126b327'
};

class SimpleVoiceDemo {
  constructor() {
    this.engine = null;
    this.vadNode = null;
    this.llmNode = null;
    this.outputNode = null;
    this.ttsNode = null;
    this.publisherNode = null;
    this.llmContextEventsNode = null;

    this.publisherAudioPad = null;
    this.publisherVideoPad = null;
    this.ttsAudioPad = null;
    this.outputAudioPad = null;
    this.isAudioMonitorEnabled = true;
    this.nodesSetup = false;

    this.initializeUI();
    this.setupEventListeners();
  }

  initializeUI() {
    console.log('🎤📹 Voice & Video Demo initialized');
    console.log('ℹ️  This demo uses the generic SDK APIs for easy voice and video workflow interaction');

    // Add run state display to status grid
    const statusGrid = document.querySelector('.status-grid');
    const runStateItem = document.createElement('div');
    runStateItem.className = 'status-item';
    runStateItem.innerHTML = `
      <span>Run State:</span>
      <span id="run-status" class="status idle">idle</span>
    `;
    statusGrid.insertBefore(runStateItem, statusGrid.firstChild);
  }

  setupEventListeners() {
    document.getElementById('start-workflow-btn').addEventListener('click', () => {
      this.startWorkflow();
    });

    document.getElementById('stop-workflow-btn').addEventListener('click', () => {
      this.stopWorkflow();
    });

    document.getElementById('mic-button').addEventListener('click', () => {
      this.toggleMicrophone();
    });

    document.getElementById('camera-button').addEventListener('click', () => {
      this.toggleCamera();
    });

    document.getElementById('toggle-audio-monitor').addEventListener('click', () => {
      this.toggleAudioMonitor();
    });

    window.clearTriggerLog = () => {
      document.getElementById('trigger-log').innerHTML = '';
    };
  }

  async startWorkflow() {
    const proxyBaseUrl = document.getElementById('api-base-url').value || 'http://localhost:3002';
    const appId = document.getElementById('app-id').value;

    if (!appId) {
      console.error('❌ Please provide an App ID');
      return;
    }

    try {
      this.engine = new AppEngine();

      // Set up state change listeners
      this.engine.on('run-state-changed', (state) => {
        this.updateRunStatus(state);
        this.addTriggerEvent('Workflow', `Run State Changed: ${state}`);
      });

      this.engine.on('connection-state-changed', (state) => {
        this.updateWorkflowStatus(state);
        this.addTriggerEvent('Workflow', `Connection State Changed: ${state}`);
      });

      console.log(`🚀 Starting voice workflow: ${appId}`);

      // Get connection details from proxy server
      const response = await fetch(`${proxyBaseUrl}/app/run`, {
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
      await this.engine.connect(connectionDetails);

      // Show the status section now that we're connected
      document.getElementById('status-section').style.display = 'block';

      this.setupGenericNodeHandling();

      document.getElementById('start-workflow-btn').disabled = true;
      document.getElementById('stop-workflow-btn').disabled = false;

    } catch (error) {
      this.updateRunStatus('idle');
      this.updateWorkflowStatus('disconnected');
      console.error(`❌ Failed to start workflow: ${error.message}`);
    }
  }

  setupGenericNodeHandling() {
    // Listen for node discovery completion
    this.engine.on('nodes-discovered', () => {
      this.onNodesDiscovered();
    });

    // Also set up a fallback timer for legacy discovery
    setTimeout(() => {
      this.onNodesDiscovered();
    }, 3000);
  }

  onNodesDiscovered() {
    // Prevent multiple setups
    if (this.nodesSetup) {
      return;
    }
    this.nodesSetup = true;

    console.log('🔍 Setting up nodes after discovery');

    // Use direct property access for publisher node
    this.publisherNode = this.engine.publisherNode;

    // Get other nodes by ID
    this.vadNode = this.engine.getNode(NODE_IDS.vad);
    this.llmNode = this.engine.getNode(NODE_IDS.omni_llm);
    this.outputNode = this.engine.getNode(NODE_IDS.output);
    this.ttsNode = this.engine.getNode(NODE_IDS.tts);
    this.llmContextEventsNode = this.engine.getNode(NODE_IDS.llm_context_events);

    // Setup individual node handlers
    this.setupNodeHandlers();

    // Setup publisher node UI and controls if available
    if (this.publisherNode) {
      this.setupPublisherEvents();

      // Enable controls based on available pads
      const audioSourcePad = this.publisherNode.getSourcePad('audio_source');
      if (audioSourcePad) {
        document.getElementById('mic-button').disabled = false;
        document.getElementById('mic-instructions').textContent = 'Click the microphone to start/stop recording';
      }

      const videoSourcePad = this.publisherNode.getSourcePad('video_source');
      if (videoSourcePad) {
        document.getElementById('camera-button').disabled = false;
        document.getElementById('camera-instructions').textContent = 'Click the camera to start/stop video';
      }
    }

    // Add all discovered nodes to UI
    const allNodesForUI = this.engine.listNodes();
    console.log(`📋 Total nodes discovered: ${allNodesForUI.length}`);
    allNodesForUI.forEach(node => {
      this.addNodeToUI(node);
    });
  }

  setupNodeHandlers() {
    if (this.vadNode) {
      this.setupVADEvents();
    }

    if (this.llmNode) {
      this.setupLLMEvents();
    }

    if (this.outputNode) {
      const outputAudioPads = this.outputNode.getInputPads('audio');
      this.outputAudioPad = outputAudioPads.length > 0 ? outputAudioPads[0] : null;
      this.setupOutputEvents();
    }

    if (this.ttsNode) {
      this.setupTTSEvents();
    }

    if (this.llmContextEventsNode) {
      this.setupLLMContextEventsEvents();
    }

    // Enable controls based on available pads
    if (this.publisherAudioPad) {
      document.getElementById('mic-button').disabled = false;
      document.getElementById('mic-instructions').textContent = 'Click the microphone to start/stop recording';
    }

    if (this.publisherVideoPad) {
      document.getElementById('camera-button').disabled = false;
      document.getElementById('camera-instructions').textContent = 'Click the camera to start/stop video';
    }
  }

  setupVADEvents() {
    if (!this.vadNode) {
      console.warn('⚠️ VAD node not found');
      return;
    }

    const speechStartedPad = this.vadNode.getSourcePad('speech_started_trigger');
    const speechEndedPad = this.vadNode.getSourcePad('speech_ended_trigger');
    const continuedSpeechPad = this.vadNode.getSourcePad('continued_speech_trigger');
    const audioInputPad = this.vadNode.getSinkPad('audio_sink');

    if (speechStartedPad) {
      speechStartedPad.on('trigger-received', (data) => {
        this.handleVADSpeechStarted(data);
      });
    }

    if (speechEndedPad) {
      speechEndedPad.on('trigger-received', (data) => {
        this.handleVADSpeechEnded(data);
      });
    }

    if (continuedSpeechPad) {
      continuedSpeechPad.on('trigger-received', (data) => {
        this.handleVADContinuedSpeech(data);
      });
    }

    if (audioInputPad) {
      audioInputPad.on('stream-received', (stream) => {
        this.addTriggerEvent('VAD', 'Audio Stream Connected', {
          padId: audioInputPad.id,
          trackCount: stream.getTracks().length
        });
      });

      audioInputPad.on('connection-changed', (connected) => {
        this.addTriggerEvent('VAD', `Audio ${connected ? 'Connected' : 'Disconnected'}`, {
          padId: audioInputPad.id
        });
      });
    }
  }

  setupLLMEvents() {
    if (!this.llmNode) {
      console.warn('⚠️ LLM node not found');
      return;
    }

    const textInputPad = this.llmNode.getSinkPad('text_sink');
    const textOutputPad = this.llmNode.getSourcePad('complete_text_source');
    const runTriggerPad = this.llmNode.getSourcePad('run_trigger');
    const completionTriggerPad = this.llmNode.getSourcePad('completion_trigger');

    if (textInputPad) {
      textInputPad.on('data-received', (data) => {
        this.addTriggerEvent('LLM', 'Text Input Received', data);
      });
    }

    if (textOutputPad) {
      textOutputPad.on('data-received', (data) => {
        if (data.type === 'message') {
          const truncatedContent = data.content.substring(0, 50) + (data.content.length > 50 ? '...' : '');
          this.addTriggerEvent('LLM', `${data.role === 'user' ? 'User' : 'Assistant'} Message: ${truncatedContent}`, data);
        }
      });
    }

    if (runTriggerPad) {
      runTriggerPad.on('trigger-received', (data) => {
        this.addTriggerEvent('LLM', 'Processing Started', data);
      });
    }

    if (completionTriggerPad) {
      completionTriggerPad.on('trigger-received', (data) => {
        this.addTriggerEvent('LLM', 'Processing Completed', data);
      });
    }
  }

  setupOutputEvents() {
    if (!this.ttsNode) {
      console.warn('⚠️ No TTS node found');
      return;
    }

    const ttsAudioPad = this.ttsNode.getSourcePad('audio_source');
    if (!ttsAudioPad) {
      console.warn('⚠️ No TTS audio source pad found');
      return;
    }

    // Enable the audio pad - this will create and manage the audio element automatically
    ttsAudioPad.setEnabled(true);
    this.outputAudioPad = ttsAudioPad;

    // Enable audio monitor controls
    const monitorButton = document.getElementById('toggle-audio-monitor');
    monitorButton.disabled = false;
    document.getElementById('audio-monitor-instructions').textContent = 'Click to enable/disable audio monitoring';
  }

  setupTTSEvents() {
    if (!this.ttsNode) {
      console.warn('⚠️ No TTS node found');
      return;
    }

    this.ttsAudioPad = this.ttsNode.getSourcePad('audio_source');
    if (!this.ttsAudioPad) {
      console.warn('⚠️ No TTS audio output pad found');
      return;
    }

    this.ttsAudioPad.on('connection-changed', (connected) => {
      this.addTriggerEvent('TTS', `Audio Connection ${connected ? 'Established' : 'Lost'}`);
    });
  }

  setupPublisherEvents() {
    if (!this.publisherNode) {
      console.warn('⚠️ Publisher node not found for setup');
      return;
    }

    this.setupPublisherAudioPad();
    this.setupPublisherVideoPad();
  }

  setupPublisherAudioPad() {
    this.publisherAudioPad = this.publisherNode.getSourcePad('audio_source');
    if (this.publisherAudioPad) {
      this.publisherAudioPad.on('connection-changed', (connected) => {
        this.addTriggerEvent('Publisher', `Audio Publishing ${connected ? 'Started' : 'Stopped'}`, { padId: this.publisherAudioPad.id });
      });

      this.publisherAudioPad.on('stream-received', (stream) => {
        this.addTriggerEvent('Publisher', 'Audio Stream Received', { padId: this.publisherAudioPad.id });
      });
    }
  }

  setupPublisherVideoPad() {
    this.publisherVideoPad = this.publisherNode.getSourcePad('video_source');
    if (this.publisherVideoPad) {
      this.publisherVideoPad.on('connection-changed', (connected) => {
        this.addTriggerEvent('Publisher', `Video Publishing ${connected ? 'Started' : 'Stopped'}`, { padId: this.publisherVideoPad.id });
      });

      this.publisherVideoPad.on('stream-received', (stream) => {
        this.showVideoPreview(stream);
      });
    }
  }

  setupLLMContextEventsEvents() {
    console.log('💬 Setting up generic LLM Context Events using trigger pads');

    // Listen for generic data events from LLM Context Events node
    this.llmContextEventsNode.on('data-received', (data) => {
      this.handleLLMData(data);
    });

    // Also listen to trigger pads if available using the new node methods
    const triggerPad = this.llmContextEventsNode.getSourcePad('new_user_message_source_trigger');
    if (triggerPad) {
      triggerPad.on('trigger-received', (data) => {
        this.handleLLMData(data);
      });
    }
  }

  async stopWorkflow() {
    try {
      console.log('⏹️ Stopping workflow...');

      if (this.engine) {
        await this.engine.disconnect();
        this.engine = null;
      }

      this.resetUI();
      console.log('⏹️ Workflow stopped');

    } catch (error) {
      console.error(`❌ Error stopping workflow: ${error.message}`);
      // Ensure we reset UI even if there's an error
      this.resetUI();
    }
  }

  async toggleMicrophone() {
    // Rely on the publisherNode property
    if (!this.publisherNode) {
      this.addTriggerEvent('Publisher', 'Error: Microphone unavailable - No publisher node found');
      console.error('❌ No publisher node found for microphone toggle');
      return;
    }

    console.log('🔍 Publisher node found:', this.publisherNode.id, this.publisherNode.type);
    console.log('🔍 Publisher node source pads:', this.publisherNode.getSourcePads().map(pad => `${pad.id} (${pad.dataType})`));

    const audioSourcePad = this.publisherNode.getSourcePad('audio_source');
    if (!audioSourcePad) {
      // Try alternative pad names
      const allAudioPads = this.publisherNode.getSourcePads().filter(pad => pad.dataType === 'audio');
      console.log('🔍 All audio pads on publisher node:', allAudioPads.map(pad => `${pad.id} (${pad.name})`));

      if (allAudioPads.length > 0) {
        const firstAudioPad = allAudioPads[0];
        console.log('🔍 Using first audio pad:', firstAudioPad.id);
        try {
          const isEnabled = firstAudioPad.isPublishing();
          if (isEnabled) {
            await firstAudioPad.setMicrophoneEnabled(false);
            this.updateMicrophoneStatus('disconnected');
            const micButton = document.getElementById('mic-button');
            micButton.textContent = '🎤 Microphone';
            micButton.className = 'btn btn-primary';
            document.getElementById('mic-instructions').textContent = 'Click the microphone to start recording';
          } else {
            await firstAudioPad.setMicrophoneEnabled(true);
            this.updateMicrophoneStatus('connected');
            const micButton = document.getElementById('mic-button');
            micButton.textContent = '🔴 Recording';
            micButton.className = 'btn btn-danger';
            document.getElementById('mic-instructions').textContent = 'Recording... Click to stop';
          }
        } catch (error) {
          console.error('❌ Failed to toggle microphone on first audio pad:', error);
          this.addTriggerEvent('Publisher', 'Error: Failed to toggle microphone', { error: error.message });
        }
      } else {
        console.error('❌ No audio pads found on publisher node');
        this.addTriggerEvent('Publisher', 'Error: Microphone unavailable - No audio pad found');
      }
      return;
    }

    console.log('🔍 Using audio_source pad:', audioSourcePad.id, audioSourcePad.dataType);

    try {
      const isEnabled = audioSourcePad.isPublishing();
      if (isEnabled) {
        await audioSourcePad.setMicrophoneEnabled(false);
        this.updateMicrophoneStatus('disconnected');
        const micButton = document.getElementById('mic-button');
        micButton.textContent = '🎤 Microphone';
        micButton.className = 'btn btn-primary';
        document.getElementById('mic-instructions').textContent = 'Click the microphone to start recording';
      } else {
        await audioSourcePad.setMicrophoneEnabled(true);
        this.updateMicrophoneStatus('connected');
        const micButton = document.getElementById('mic-button');
        micButton.textContent = '🔴 Recording';
        micButton.className = 'btn btn-danger';
        document.getElementById('mic-instructions').textContent = 'Recording... Click to stop';
      }
    } catch (error) {
      console.error('❌ Failed to toggle microphone:', error);
      this.addTriggerEvent('Publisher', 'Error: Failed to toggle microphone', { error: error.message });
    }
  }

  async toggleCamera() {
    // Rely on the publisherNode property
    if (!this.publisherNode) {
      this.addTriggerEvent('Publisher', 'Error: Camera unavailable - No publisher node found');
      console.error('❌ No publisher node found for camera toggle');
      return;
    }

    console.log('🔍 Publisher node found for camera:', this.publisherNode.id, this.publisherNode.type);
    console.log('🔍 Publisher node video pads:', this.publisherNode.getSourcePads().filter(pad => pad.dataType === 'video').map(pad => `${pad.id} (${pad.name})`));

    const videoSourcePad = this.publisherNode.getSourcePad('video_source');
    if (!videoSourcePad) {
      // Try alternative pad names
      const allVideoPads = this.publisherNode.getSourcePads().filter(pad => pad.dataType === 'video');
      console.log('🔍 All video pads on publisher node:', allVideoPads.map(pad => `${pad.id} (${pad.name})`));

      if (allVideoPads.length > 0) {
        const firstVideoPad = allVideoPads[0];
        console.log('🔍 Using first video pad:', firstVideoPad.id);
        try {
          const isEnabled = firstVideoPad.isPublishing();
          if (isEnabled) {
            await firstVideoPad.setVideoEnabled(false);
            this.updateCameraStatus('disconnected');
            this.hideVideoPreview();
            const cameraButton = document.getElementById('camera-button');
            cameraButton.textContent = '📹 Camera';
            cameraButton.className = 'btn btn-primary';
            document.getElementById('camera-instructions').textContent = 'Click the camera to start video';
          } else {
            await firstVideoPad.setVideoEnabled(true);
            this.updateCameraStatus('connected');
            const cameraButton = document.getElementById('camera-button');
            cameraButton.textContent = '🔴 Recording';
            cameraButton.className = 'btn btn-danger';
            document.getElementById('camera-instructions').textContent = 'Recording video... Click to stop';
          }
        } catch (error) {
          console.error('❌ Failed to toggle camera on first video pad:', error);
          this.addTriggerEvent('Publisher', 'Error: Failed to toggle camera', { error: error.message });
        }
      } else {
        console.error('❌ No video pads found on publisher node');
        this.addTriggerEvent('Publisher', 'Error: Camera unavailable - No video pad found');
      }
      return;
    }

    console.log('🔍 Using video_source pad:', videoSourcePad.id, videoSourcePad.dataType);

    try {
      const isEnabled = videoSourcePad.isPublishing();
      if (isEnabled) {
        await videoSourcePad.setVideoEnabled(false);
        this.updateCameraStatus('disconnected');
        this.hideVideoPreview();
        const cameraButton = document.getElementById('camera-button');
        cameraButton.textContent = '📹 Camera';
        cameraButton.className = 'btn btn-primary';
        document.getElementById('camera-instructions').textContent = 'Click the camera to start video';
      } else {
        await videoSourcePad.setVideoEnabled(true);
        this.updateCameraStatus('connected');
        const cameraButton = document.getElementById('camera-button');
        cameraButton.textContent = '🔴 Recording';
        cameraButton.className = 'btn btn-danger';
        document.getElementById('camera-instructions').textContent = 'Recording video... Click to stop';
      }
    } catch (error) {
      console.error('❌ Failed to toggle camera:', error);
      this.addTriggerEvent('Publisher', 'Error: Failed to toggle camera', { error: error.message });
    }
  }

  toggleAudioMonitor() {
    this.isAudioMonitorEnabled = !this.isAudioMonitorEnabled;

    // Update UI
    const monitorStatus = document.getElementById('audio-monitor-status');
    const monitorButton = document.getElementById('toggle-audio-monitor');
    const monitorInstructions = document.getElementById('audio-monitor-instructions');

    if (this.isAudioMonitorEnabled) {
      monitorStatus.textContent = 'on';
      monitorStatus.className = 'status connected';
      monitorButton.textContent = '🔊 Disable Audio Monitor';
      monitorInstructions.textContent = 'Audio monitoring is active';
    } else {
      monitorStatus.textContent = 'off';
      monitorStatus.className = 'status disconnected';
      monitorButton.textContent = '🔈 Enable Audio Monitor';
      monitorInstructions.textContent = 'Audio monitoring is disabled';
    }

    // Update the output pad if it exists - now using setEnabled directly
    if (this.outputAudioPad) {
      this.outputAudioPad.setEnabled(this.isAudioMonitorEnabled);
      this.addTriggerEvent('Audio Monitor', `Audio monitoring ${this.isAudioMonitorEnabled ? 'enabled' : 'disabled'}`);
    }
  }

  // Generic data handlers that work with any node type
  handleVADData(data) {
    if (data.type === 'trigger') {
      const padId = data.padId || '';
      const padName = data.padName || '';

      console.log('🎤 VAD trigger received:', { padId, padName, data });

      // Route to appropriate handler based on trigger type
      if (padId === 'speech_started_trigger') {
        this.handleVADSpeechStarted(data);
      } else if (padId === 'speech_ended_trigger') {
        this.handleVADSpeechEnded(data);
      } else if (padId === 'continued_speech_trigger') {
        this.handleVADContinuedSpeech(data);
      } else {
        // Generic trigger handling
        this.addTriggerEvent('VAD', `Trigger: ${padId}`, data);
      }
    }
  }

  handleLLMData(data) {
    if (data.type === 'trigger') {
      const padId = data.padId || '';
      const padName = data.padName || '';

      console.log('🤖 LLM trigger received:', { padId, padName, data });

      if (padId === 'run_trigger') {
        this.addTriggerEvent('LLM', 'LLM Run Triggered', data);
        console.log('🤖 LLM processing triggered');
      } else {
        this.addTriggerEvent('LLM', `Trigger: ${padId}`, data);
      }
    } else if (data.type === 'message') {
      if (data.role === 'user') {
        this.addTriggerEvent('LLM', `User Message: ${data.content.substring(0, 50)}...`, data);
        console.log(`👤 User: ${data.content}`);
      } else if (data.role === 'assistant') {
        this.addTriggerEvent('LLM', `Assistant Message: ${data.content.substring(0, 50)}...`, data);
        console.log(`🤖 Assistant: ${data.content}`);
      }
    } else if (data.type === 'status') {
      if (data.processing) {
        this.addTriggerEvent('LLM', 'Processing Started', data);
        console.log('🤖 LLM processing started...');
      } else {
        this.addTriggerEvent('LLM', 'Processing Completed', data);
        console.log('✅ LLM processing completed');
      }
    }
  }

  // VAD event handlers
  handleVADSpeechChange(isActive, data) {
    const vadIndicator = document.getElementById('vad-indicator');
    const vadStatus = document.getElementById('vad-status');

    if (isActive) {
      vadIndicator.classList.add('active');
      vadStatus.innerHTML = 'Speech Detected <span id="vad-indicator" class="vad-indicator active"></span>';
    } else {
      vadIndicator.classList.remove('active', 'continued');
      vadStatus.innerHTML = 'Waiting <span id="vad-indicator" class="vad-indicator"></span>';
    }

    this.addTriggerEvent('VAD', `Voice Activity: ${isActive ? 'Active' : 'Inactive'}`, data);
  }

  handleVADSpeechStarted(data) {
    const vadIndicator = document.getElementById('vad-indicator');
    const vadStatus = document.getElementById('vad-status');

    vadIndicator.classList.add('active');
    vadStatus.innerHTML = 'Speech Detected <span id="vad-indicator" class="vad-indicator active"></span>';
    this.addTriggerEvent('VAD', 'Speech Started', data);
  }

  handleVADSpeechEnded(data) {
    const vadIndicator = document.getElementById('vad-indicator');
    const vadStatus = document.getElementById('vad-status');

    vadIndicator.classList.remove('active', 'continued');
    vadStatus.innerHTML = 'Waiting <span id="vad-indicator" class="vad-indicator"></span>';
    this.addTriggerEvent('VAD', 'Speech Ended', data);
  }

  handleVADContinuedSpeech(data) {
    const vadIndicator = document.getElementById('vad-indicator');
    const vadStatus = document.getElementById('vad-status');

    vadIndicator.classList.add('continued');
    vadStatus.innerHTML = 'Speaking (Continued) <span id="vad-indicator" class="vad-indicator active continued"></span>';
    this.addTriggerEvent('VAD', 'Continued Speech', data);
  }

  addTriggerEvent(nodeType, event, data = {}) {
    const triggerLog = document.getElementById('trigger-log');
    const timestamp = new Date().toLocaleTimeString();

    const eventDiv = document.createElement('div');
    eventDiv.className = 'trigger-entry';

    // Add visual indicators for different event types
    let eventIcon = '';
    if (event.includes('Speech')) {
      eventIcon = '🎤';
    } else if (event.includes('Message')) {
      eventIcon = '💬';
    } else if (event.includes('Audio')) {
      eventIcon = '🔊';
    } else if (event.includes('Video')) {
      eventIcon = '📹';
    } else if (event.includes('Processing')) {
      eventIcon = '🤖';
    } else {
      eventIcon = '📝';
    }

    // Format data more readably
    let dataStr = '';
    if (data && Object.keys(data).length > 0) {
      try {
        dataStr = `<br/><pre style="font-size: 10px; margin: 2px 0; background: rgba(255,255,255,0.1); padding: 4px; border-radius: 2px;">${JSON.stringify(data, null, 2)}</pre>`;
      } catch (e) {
        dataStr = `<br/><span style="font-size: 10px; color: #ffaa00;">Data: ${String(data)}</span>`;
      }
    }

    eventDiv.innerHTML = `
      <span class="timestamp">${timestamp}</span>
      <span style="color: #00ff41;">${eventIcon}</span>
      <strong style="color: #66bb6a;">${nodeType}</strong>: ${event}
      ${dataStr}
    `;

    triggerLog.appendChild(eventDiv);
    triggerLog.scrollTop = triggerLog.scrollHeight;

    // Keep only the last 100 entries to prevent memory issues
    while (triggerLog.children.length > 100) {
      triggerLog.removeChild(triggerLog.firstChild);
    }
  }

  addNodeToUI(node) {
    const nodesContainer = document.getElementById('workflow-nodes');

    // Clear initial message
    if (nodesContainer.children.length === 1 && nodesContainer.children[0].tagName === 'P') {
      nodesContainer.innerHTML = '';
    }

    const nodeCard = document.createElement('div');
    nodeCard.className = 'node-card';
    nodeCard.id = `node-${node.id}`;

    const sourcePads = node.getSourcePads();
    const sinkPads = node.getSinkPads();

    // Format pads with enhanced display for all types
    const formatPads = (pads, direction) => {
      // Filter out dependency pads for outputs
      const filteredPads = direction === 'source'
        ? pads.filter(pad => !pad.name.toLowerCase().includes('dependency'))
        : pads;

      if (filteredPads.length === 0) return '<em>None</em>';

      return filteredPads.map(pad => {
        const typeIcon = {
          'audio': '🔊',
          'video': '📹',
          'trigger': '⚡',
          'data': '📊',
          'text': '📝',
          'boolean': '✅',
          'integer': '🔢',
          'number': '🔢',
          'stream': '🌊'
        };

        const typeColor = {
          'audio': '#28a745',
          'video': '#17a2b8',
          'trigger': '#ffc107',
          'data': '#6f42c1',
          'text': '#20c997',
          'boolean': '#fd7e14',
          'integer': '#6610f2',
          'number': '#6610f2',
          'stream': '#fd7e14'
        };

        const color = typeColor[pad.dataType] || '#6c757d';

        // Determine pad category for display
        const isPropertyPad = pad.isPropertyPad ? pad.isPropertyPad() : false;
        const padCategory = isPropertyPad ? 'Property' : 'Stateless';
        const categoryIcon = isPropertyPad ? '⚙️' : '🌊';

        // Format pad value if it's a property pad
        let valueDisplay = '';
        if (isPropertyPad && pad.getValue) {
          const value = pad.getValue();
          if (value !== null && value !== undefined) {
            valueDisplay = `<div class="pad-value">Value: <code>${JSON.stringify(value)}</code></div>`;
          }
        }

        // Format allowed types
        let allowedTypesDisplay = '';
        if (pad.allowedTypes && pad.allowedTypes.length > 0) {
          const types = pad.allowedTypes.map(type => type.type || 'unknown').join(', ');
          allowedTypesDisplay = `<div class="pad-allowed-types">Allowed: ${types}</div>`;
        }

        return `<div class="pad-item" style="border-left-color: ${color};">
          <div class="pad-header">
            <span class="pad-icon">${typeIcon[pad.dataType] || '📄'}</span>
            <div class="pad-content">
              <div class="pad-title">
                <span class="pad-name">${pad.name}</span>
                <span class="pad-type" style="color: ${color};">(${pad.dataType})</span>
                <span class="pad-category">${categoryIcon} ${padCategory}</span>
              </div>
              <div class="pad-id">${pad.id}</div>
              ${valueDisplay}
              ${allowedTypesDisplay}
            </div>
          </div>
        </div>`;
      }).join('');
    };

    // Count filtered pads for display
    const filteredSourcePads = sourcePads.filter(pad => !pad.name.toLowerCase().includes('dependency'));

    nodeCard.innerHTML = `
      <div class="node-header">
        <h4>${node.type}</h4>
      </div>
      <div style="margin-bottom: 15px;">
        <span class="node-uuid">${node.id}</span>
      </div>
      <style>
        .pad-item {
          border-left: 3px solid;
          padding: 8px;
          margin: 4px 0;
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
        }
        .pad-header {
          display: flex;
          align-items: flex-start;
        }
        .pad-content {
          flex: 1;
        }
        .pad-title {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }
        .pad-icon {
          margin-right: 8px;
        }
        .pad-name {
          font-weight: 500;
        }
        .pad-type {
          opacity: 0.8;
          font-size: 0.9em;
        }
        .pad-category {
          font-size: 0.8em;
          background: rgba(255,255,255,0.1);
          padding: 2px 6px;
          border-radius: 3px;
          margin-left: 4px;
        }
        .pad-id {
          font-family: monospace;
          font-size: 0.8em;
          color: #888;
          margin-top: 2px;
        }
        .pad-value {
          font-size: 0.8em;
          margin-top: 4px;
          color: #4CAF50;
        }
        .pad-value code {
          background: rgba(255,255,255,0.1);
          padding: 2px 4px;
          border-radius: 2px;
          font-family: monospace;
        }
        .pad-allowed-types {
          font-size: 0.7em;
          margin-top: 2px;
          color: #FFC107;
          font-style: italic;
        }
      </style>
      <div class="node-pads">
        <div class="pads-section">
          <strong>📥 Inputs (${sinkPads.length}):</strong>
          <div class="pads-list">
            ${formatPads(sinkPads, 'sink')}
          </div>
        </div>
        ${filteredSourcePads.length > 0 ? `
        <div class="pads-section">
          <strong>📤 Outputs (${filteredSourcePads.length}):</strong>
          <div class="pads-list">
            ${formatPads(sourcePads, 'source')}
          </div>
        </div>
        ` : ''}
      </div>
    `;

    nodesContainer.appendChild(nodeCard);
  }

  resetUI() {
    // Hide the status section
    document.getElementById('status-section').style.display = 'none';

    // Reset controls
    document.getElementById('start-workflow-btn').disabled = false;
    document.getElementById('stop-workflow-btn').disabled = true;
    document.getElementById('mic-button').disabled = true;
    document.getElementById('camera-button').disabled = true;
    document.getElementById('toggle-audio-monitor').disabled = true;
    document.getElementById('mic-instructions').textContent = 'Start the workflow to begin voice & video interaction';
    document.getElementById('camera-instructions').textContent = 'Camera controls will be available after workflow starts';
    document.getElementById('audio-monitor-instructions').textContent = 'Start the workflow to control audio monitoring';

    // Reset status indicators
    this.updateRunStatus('idle');
    this.updateWorkflowStatus('disconnected');
    this.updateMicrophoneStatus('disconnected');
    this.updateCameraStatus('disconnected');
    this.updateAudioMonitorStatus('disconnected');
    this.hideVideoPreview();

    // Clean up audio element
    const audioElement = document.getElementById('output-audio');
    if (audioElement) {
      audioElement.srcObject = null;
      audioElement.remove();
    }

    // Clear nodes
    document.getElementById('workflow-nodes').innerHTML = '<p>Connect to workflow to see active nodes...</p>';

    // Reset node references
    this.vadNode = null;
    this.llmNode = null;
    this.outputNode = null;
    this.ttsNode = null;
    this.publisherNode = null;
    this.llmContextEventsNode = null;

    // Reset pad references
    this.publisherAudioPad = null;
    this.publisherVideoPad = null;
    this.ttsAudioPad = null;
    this.outputAudioPad = null;

    // Reset setup flag
    this.nodesSetup = false;
  }

  updateWorkflowStatus(state) {
    const statusElement = document.getElementById('workflow-status');
    statusElement.textContent = state;
    statusElement.className = `status ${state}`;
  }

  updateMicrophoneStatus(state) {
    const statusElement = document.getElementById('mic-status');
    statusElement.textContent = state === 'connected' ? 'on' : 'off';
    statusElement.className = `status ${state}`;
  }

  updateCameraStatus(state) {
    const statusElement = document.getElementById('camera-status');
    statusElement.textContent = state === 'connected' ? 'on' : 'off';
    statusElement.className = `status ${state}`;
  }

  updateAudioMonitorStatus(state) {
    const statusElement = document.getElementById('audio-monitor-status');
    statusElement.textContent = state === 'connected' ? 'on' : 'off';
    statusElement.className = `status ${state}`;
  }

  showVideoPreview(stream) {
    const videoElement = document.getElementById('local-video');
    const statusElement = document.getElementById('video-preview-status');

    videoElement.srcObject = stream;
    videoElement.style.display = 'block';
    statusElement.textContent = 'Local video stream active';
  }

  hideVideoPreview() {
    const videoElement = document.getElementById('local-video');
    const statusElement = document.getElementById('video-preview-status');

    videoElement.srcObject = null;
    videoElement.style.display = 'none';
    statusElement.textContent = 'No video stream active';
  }

  updateRunStatus(state) {
    const statusElement = document.getElementById('run-status');
    statusElement.textContent = state;
    statusElement.className = `status ${state}`;
  }
}

// Initialize the demo when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new SimpleVoiceDemo();
});