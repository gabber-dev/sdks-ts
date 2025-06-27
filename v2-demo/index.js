import { WorkflowEngine } from './gabber-workflow-core.js';
const NODE_IDS = {
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
    this.humanNode = null;
    this.llmContextEventsNode = null;

    this.humanAudioPad = null;
    this.humanVideoPad = null;
    this.humanTextPad = null;
    this.ttsAudioPad = null;
    this.outputAudioPad = null;

    this.initializeUI();
    this.setupEventListeners();
  }

  initializeUI() {
    console.log('🎤📹 Voice & Video Demo initialized');
    console.log('ℹ️  This demo uses the generic SDK APIs for easy voice and video workflow interaction');
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

    document.getElementById('send-text-btn').addEventListener('click', () => {
      this.sendTextMessage();
    });

    document.getElementById('text-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendTextMessage();
      }
    });

    window.clearTriggerLog = () => {
      document.getElementById('trigger-log').innerHTML = '';
    };
  }

  async startWorkflow() {
    const apiBaseUrl = document.getElementById('api-base-url').value || 'http://localhost:4000';
    const apiKey = document.getElementById('api-key').value || '';
    const appId = document.getElementById('app-id').value;

    if (!appId) {
      console.error('❌ Please provide an App ID');
      return;
    }

    try {
      this.updateWorkflowStatus('starting');
      console.log(`🚀 Starting voice workflow: ${appId}`);

      this.engine = new WorkflowEngine();
      this.engine.configure({
        apiBaseUrl,
        apiKey: apiKey || undefined,
      });

      const connectionDetails = await this.engine.startAppRun({
        appId,
        version: 1,
        inputs: {}
      });

      console.log('🔗 Connecting to Gabber workflow...');
      await this.engine.connect(connectionDetails);

      this.updateWorkflowStatus('running');
      console.log('✅ Connected to voice workflow!');

      this.setupGenericNodeHandling();

      document.getElementById('start-workflow-btn').disabled = true;
      document.getElementById('stop-workflow-btn').disabled = false;

    } catch (error) {
      this.updateWorkflowStatus('idle');
      console.error(`❌ Failed to start workflow: ${error.message}`);
    }
  }

  setupGenericNodeHandling() {
    setTimeout(() => {
      this.vadNode = this.engine.getNode(NODE_IDS.vad);
      this.llmNode = this.engine.getNode(NODE_IDS.omni_llm);
      this.outputNode = this.engine.getNode(NODE_IDS.output);
      this.ttsNode = this.engine.getNode(NODE_IDS.tts);
      this.llmContextEventsNode = this.engine.getNode(NODE_IDS.llm_context_events);

      const allNodes = this.engine.listNodes();
      this.humanNode = allNodes.find(node => node.type === 'human') || null;
      const debugNodes = this.engine.listNodes();
      console.log(`🔍 Debug: Found ${debugNodes.length} total nodes:`);
      debugNodes.forEach(node => {
        const audioInputPads = node.getInputPads('audio');
        const audioOutputPads = node.getOutputPads('audio');
        const triggerOutputPads = node.getOutputPads('trigger');
        const dataInputPads = node.getInputPads('data');
        const dataOutputPads = node.getOutputPads('data');

        console.log(`  Node: ${node.type} (${node.id})`);
        console.log(`    Audio In: ${audioInputPads.length}, Audio Out: ${audioOutputPads.length}`);
        console.log(`    Trigger Out: ${triggerOutputPads.length}, Data In: ${dataInputPads.length}, Data Out: ${dataOutputPads.length}`);
      });

      console.log(`🔍 Found nodes - VAD: ${!!this.vadNode}, LLM: ${!!this.llmNode}, Output: ${!!this.outputNode}, TTS: ${!!this.ttsNode}, Human: ${!!this.humanNode}, LLM Context Events: ${!!this.llmContextEventsNode}`);

      if (this.vadNode) {
        this.setupVADEvents();
        this.addNodeToUI(this.vadNode);
      } else {
        console.warn('⚠️ VAD node not found - VAD events will not work');
      }

      if (this.llmNode) {
        this.setupLLMEvents();
        this.addNodeToUI(this.llmNode);
      } else {
        console.warn('⚠️ LLM node not found - LLM events will not work');
      }

      if (this.outputNode) {
        const outputAudioPads = this.outputNode.getInputPads('audio');
        this.outputAudioPad = outputAudioPads.length > 0 ? outputAudioPads[0] : null;
        this.setupOutputEvents();
        this.addNodeToUI(this.outputNode);
      } else {
        console.warn('⚠️ Output node not found');
      }

      if (this.ttsNode) {
        this.setupTTSEvents();
        this.addNodeToUI(this.ttsNode);
      } else {
        console.warn('⚠️ TTS node not found - TTS audio will not work');
      }

      if (this.humanNode) {
        this.setupHumanEvents();
        this.addNodeToUI(this.humanNode);
      } else {
        console.warn('⚠️ Human node not found - microphone control will not work');
      }

      if (this.llmContextEventsNode) {
        this.setupLLMContextEventsEvents();
        this.addNodeToUI(this.llmContextEventsNode);
      } else {
        console.warn('⚠️ LLM Context Events node not found - context events will not work');
      }

      const allNodesForUI = this.engine.listNodes();
      console.log(`📋 Total nodes discovered: ${allNodesForUI.length}`);
      allNodesForUI.forEach(node => {
        if (![this.vadNode, this.llmNode, this.outputNode, this.ttsNode, this.humanNode].includes(node)) {
          this.addNodeToUI(node);
        }
      });
      if (this.humanAudioPad) {
        document.getElementById('mic-button').disabled = false;
        document.getElementById('mic-instructions').textContent = 'Click the microphone to start/stop recording';
      }

      if (this.humanVideoPad) {
        document.getElementById('camera-button').disabled = false;
        document.getElementById('camera-instructions').textContent = 'Click the camera to start/stop video';
      }

    }, 3000); // TODO: Change this to a more robust way to wait for nodes to be discovered
  }

  setupVADEvents() {
    console.log('🎤 Setting up VAD events using trigger pads');

    if (!this.vadNode) {
      console.warn('⚠️ VAD node not found');
      return;
    }

    // Set up generic data event handling
    this.vadNode.on('data-received', (data) => {
      this.handleVADData(data);
    });

    // Set up specific trigger pad handling
    const speechStartPad = this.vadNode.getTriggerSourcePadByName('Speech Started');
    const speechEndPad = this.vadNode.getTriggerSourcePadByName('Speech Ended');
    const continuedSpeechPad = this.vadNode.getTriggerSourcePadByName('Continued Speech');

    if (speechStartPad) {
      console.log('🎤 Found speech start trigger pad');
      speechStartPad.on('trigger-received', (data) => {
        this.handleVADSpeechStarted(data);
      });
    }

    if (speechEndPad) {
      console.log('🎤 Found speech end trigger pad');
      speechEndPad.on('trigger-received', (data) => {
        this.handleVADSpeechEnded(data);
      });
    }

    if (continuedSpeechPad) {
      console.log('🎤 Found continued speech trigger pad');
      continuedSpeechPad.on('trigger-received', (data) => {
        this.handleVADContinuedSpeech(data);
      });
    }

    // Set up audio pad monitoring
    const audioInputPad = this.vadNode.getAudioSinkPadByName('Audio Input');
    if (audioInputPad) {
      console.log('🎤 Found VAD audio input pad');
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
    console.log('🤖 Setting up LLM events using data pads');

    if (!this.llmNode) {
      console.warn('⚠️ LLM node not found');
      return;
    }

    // Set up text input pad
    const textInputPad = this.llmNode.getDataSinkPadByName('Text Input');
    if (textInputPad) {
      console.log('🤖 Found LLM text input pad');
      textInputPad.on('data-received', (data) => {
        this.addTriggerEvent('LLM', 'Text Input Received', data);
      });
    }

    // Set up text output pad
    const textOutputPad = this.llmNode.getDataSourcePadByName('Text Output');
    if (textOutputPad) {
      console.log('🤖 Found LLM text output pad');
      textOutputPad.on('data-received', (data) => {
        if (data.type === 'message') {
          if (data.role === 'user') {
            this.addTriggerEvent('LLM', `User Message: ${data.content.substring(0, 50)}...`, data);
            console.log(`👤 User: ${data.content}`);
          } else if (data.role === 'assistant') {
            this.addTriggerEvent('LLM', `Assistant Message: ${data.content.substring(0, 50)}...`, data);
            console.log(`🤖 Assistant: ${data.content}`);
          }
        }
      });
    }

    // Set up run trigger pad
    const runTriggerPad = this.llmNode.getTriggerSourcePadByName('Run');
    if (runTriggerPad) {
      console.log('🤖 Found LLM run trigger pad');
      runTriggerPad.on('trigger-received', (data) => {
        this.addTriggerEvent('LLM', 'Processing Started', data);
        console.log('🤖 LLM processing started...');
      });
    }

    // Set up completion trigger pad
    const completionTriggerPad = this.llmNode.getTriggerSourcePadByName('Completion');
    if (completionTriggerPad) {
      console.log('🤖 Found LLM completion trigger pad');
      completionTriggerPad.on('trigger-received', (data) => {
        this.addTriggerEvent('LLM', 'Processing Completed', data);
        console.log('✅ LLM processing completed');
      });
    }

    // Set up generic data event handling
    this.llmNode.on('data-received', (data) => {
      this.handleLLMData(data);
    });
  }

  setupOutputEvents() {
    console.log('🔊 Setting up Output events using pad-level subscriptions');

    if (!this.outputAudioPad) {
      console.warn('⚠️ No Output audio pad found');
      return;
    }

    this.outputAudioPad.on('stream-received', (stream) => {
      this.addTriggerEvent('Output', 'Audio Stream Received', { padId: this.outputAudioPad.id, trackCount: stream.getTracks().length });
      console.log('🔊 Output audio stream received');
    });

    this.outputAudioPad.on('connection-changed', (connected) => {
      this.addTriggerEvent('Output', `Audio ${connected ? 'Connected' : 'Disconnected'}`, { padId: this.outputAudioPad.id });
      console.log(`🔊 Output audio ${connected ? 'connected' : 'disconnected'}`);
    });
  }

  setupTTSEvents() {
    console.log('🔊 Setting up TTS events using pad-level subscription');

    if (!this.ttsNode) {
      console.warn('⚠️ No TTS node found');
      return;
    }

    // Get TTS audio output pad using getAudioSourcePadByName
    this.ttsAudioPad = this.ttsNode.getAudioSourcePadByName('Audio');
    if (!this.ttsAudioPad) {
      console.warn('⚠️ No TTS audio output pad found');
      return;
    }

    console.log(`🔊 TTS pad direction: ${this.ttsAudioPad.direction}, type: ${this.ttsAudioPad.dataType}`);

    const ttsAudioElement = document.createElement('audio');
    ttsAudioElement.autoplay = true;
    ttsAudioElement.controls = false;
    ttsAudioElement.volume = 1.0;
    ttsAudioElement.muted = false;

    // Set up audio element event listeners
    ttsAudioElement.addEventListener('play', () => {
      console.log('🔊 TTS audio started playing');
    });

    ttsAudioElement.addEventListener('ended', () => {
      console.log('🔊 TTS audio finished playing');
    });

    ttsAudioElement.addEventListener('error', (error) => {
      console.error('🔊 TTS audio error:', error);
    });

    // Subscribe to the TTS audio pad
    this.ttsAudioPad.subscribe(ttsAudioElement).then(() => {
      console.log('🔊 Subscribed to TTS audio pad');
    }).catch((error) => {
      console.error('🔊 Failed to subscribe to TTS audio pad:', error);
    });

    // Listen for stream events
    this.ttsAudioPad.on('stream-received', (stream) => {
      console.log('🔊 TTS audio stream received:', stream);
    });

    // Listen for connection changes
    this.ttsAudioPad.on('connection-changed', (connected) => {
      console.log(`🔊 TTS audio pad connection ${connected ? 'established' : 'lost'}`);
    });

    // Listen for subscription state changes
    this.ttsAudioPad.on('subscribe-state-changed', (state) => {
      console.log('🔊 TTS audio subscription state changed:', state);
    });
  }

  setupHumanEvents() {
    console.log('👤 Setting up Human events using pad-level publishing');

    if (this.humanNode) {
      console.log('👤 Human node found:', {
        id: this.humanNode.id,
        type: this.humanNode.type
      });

      // Set up text pad using getDataSourcePadByName
      this.humanTextPad = this.humanNode.getDataSourcePadByName('Text');
      if (this.humanTextPad) {
        console.log('💬 Found text source pad:', {
          name: this.humanTextPad.name,
          type: this.humanTextPad.dataType,
          direction: this.humanTextPad.direction
        });
        document.getElementById('send-text-btn').disabled = false;
        document.getElementById('text-input').disabled = false;
        document.getElementById('text-input-status').textContent = 'Ready to send messages';
      } else {
        console.warn('⚠️ No Text pad found');
      }

      // Set up audio pad using getAudioSourcePadByName
      this.humanAudioPad = this.humanNode.getAudioSourcePadByName('Audio');
      if (this.humanAudioPad) {
        console.log(`🎤 Human audio pad: ${this.humanAudioPad.direction} ${this.humanAudioPad.dataType} (${this.humanAudioPad.name})`);

        this.humanAudioPad.on('connection-changed', (connected) => {
          if (connected) {
            this.addTriggerEvent('Human', 'Audio Publishing Started', { padId: this.humanAudioPad.id });
            console.log('🎤 Microphone started publishing');
          } else {
            this.addTriggerEvent('Human', 'Audio Publishing Stopped', { padId: this.humanAudioPad.id });
            console.log('⏹️ Microphone stopped publishing');
          }
        });

        this.humanAudioPad.on('stream-received', (stream) => {
          console.log('🎤 Human audio stream received:', stream);
          this.addTriggerEvent('Human', 'Audio Stream Received', { padId: this.humanAudioPad.id });
        });
      } else {
        console.warn('⚠️ No human audio pad found');
      }

      // Set up video pad using getVideoSourcePadByName
      this.humanVideoPad = this.humanNode.getVideoSourcePadByName('Video');
      if (this.humanVideoPad) {
        console.log(`📹 Human video pad: ${this.humanVideoPad.direction} ${this.humanVideoPad.dataType} (${this.humanVideoPad.name})`);

        this.humanVideoPad.on('connection-changed', (connected) => {
          if (connected) {
            this.addTriggerEvent('Human', 'Video Publishing Started', { padId: this.humanVideoPad.id });
            console.log('📹 Camera started publishing');
          } else {
            this.addTriggerEvent('Human', 'Video Publishing Stopped', { padId: this.humanVideoPad.id });
            console.log('⏹️ Camera stopped publishing');
          }
        });

        this.humanVideoPad.on('stream-received', (stream) => {
          console.log('📹 Video stream available for preview');
          this.showVideoPreview(stream);
        });
      } else {
        console.warn('⚠️ No human video pad found');
      }
    } else {
      console.warn('⚠️ Human node not found for setup');
    }
  }

  setupLLMContextEventsEvents() {
    console.log('💬 Setting up generic LLM Context Events using trigger pads');

    // Listen for generic data events from LLM Context Events node
    this.llmContextEventsNode.on('data-received', (data) => {
      this.handleLLMData(data);
    });

    // Also listen to trigger pads if available using the new node methods
    const triggerPads = this.llmContextEventsNode.getOutputPads('trigger');
    triggerPads.forEach(pad => {
      pad.on('trigger-received', (data) => {
        this.handleLLMData(data);
      });
    });
  }

  async stopWorkflow() {
    try {
      this.updateWorkflowStatus('stopping');
      console.log('⏹️ Stopping workflow...');

      if (this.engine) {
        await this.engine.stopAppRun();
        this.engine = null;
      }

      this.resetUI();
      this.updateWorkflowStatus('idle');
      console.log('⏹️ Workflow stopped');

    } catch (error) {
      console.error(`❌ Error stopping workflow: ${error.message}`);
      this.updateWorkflowStatus('idle');
    }
  }

  async toggleMicrophone() {
    console.log('🎤 Toggle microphone called');
    console.log('🎤 Human audio pad available:', !!this.humanAudioPad);

    if (!this.humanAudioPad) {
      console.error('❌ Human audio pad not available');

      // Try to find audio pad again before giving up
      if (this.humanNode) {
        console.log('🎤 Trying to find audio pad again...');
        const humanAudioPads = this.humanNode.getOutputPads('audio');
        this.humanAudioPad = humanAudioPads.length > 0 ? humanAudioPads[0] : null;
        if (!this.humanAudioPad) {
          console.error('❌ No audio pad found on human node - microphone unavailable');
          return;
        }
        console.log('🎤 Found audio pad on retry, proceeding...');
        // Retry the operation now that we have the pad
        this.toggleMicrophone();
      }
      return;
    }

    try {
      console.log('🎤 Current publishing state:', this.humanAudioPad.isPublishing());
      console.log('🎤 Pad internal state:', {
        publishing: this.humanAudioPad.publishing,
        isConnected: this.humanAudioPad.isConnected,
        currentStream: !!this.humanAudioPad.currentStream
      });

      if (this.humanAudioPad.isPublishing()) {
        console.log('🎤 Stopping microphone...');
        await this.humanAudioPad.unpublish();
        this.updateMicrophoneStatus('disconnected');
        const micButton = document.getElementById('mic-button');
        micButton.textContent = '🎤 Microphone';
        micButton.className = 'btn btn-primary';
        document.getElementById('mic-instructions').textContent = 'Click the microphone to start recording';
      } else {
        console.log('🎤 Starting microphone...');
        // Get user media and publish through the human audio pad
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('🎤 Got user media stream:', stream);
        await this.humanAudioPad.publish(stream);
        console.log('🎤 Published to audio pad');
        this.updateMicrophoneStatus('connected');
        const micButton = document.getElementById('mic-button');
        micButton.textContent = '🔴 Recording';
        micButton.className = 'btn btn-danger';
        document.getElementById('mic-instructions').textContent = 'Recording... Click to stop';
      }
    } catch (error) {
      console.error(`❌ Microphone error: ${error.message}`);
      console.error('❌ Full error:', error);
    }
  }

  async toggleCamera() {
    if (!this.humanVideoPad) {
      console.error('❌ Human video pad not available');
      return;
    }

    try {
      if (this.humanVideoPad.isPublishing()) {
        await this.humanVideoPad.unpublish();
        this.updateCameraStatus('disconnected');
        this.hideVideoPreview();
        const cameraButton = document.getElementById('camera-button');
        cameraButton.textContent = '📹 Camera';
        cameraButton.className = 'btn btn-primary';
        document.getElementById('camera-instructions').textContent = 'Click the camera to start video';
      } else {
        // Get user media and publish through the human video pad
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        await this.humanVideoPad.publish(stream);
        this.updateCameraStatus('connected');
        const cameraButton = document.getElementById('camera-button');
        cameraButton.textContent = '🔴 Recording';
        cameraButton.className = 'btn btn-danger';
        document.getElementById('camera-instructions').textContent = 'Recording video... Click to stop';
      }
    } catch (error) {
      console.error(`❌ Camera error: ${error.message}`);
    }
  }

  // Generic data handlers that work with any node type
  handleVADData(data) {
    if (data.type === 'trigger') {
      const padId = data.padId || '';
      const padName = data.padName || '';

      console.log('🎤 VAD trigger received:', { padId, padName, data });

      // Route to appropriate handler based on trigger type
      if (padName === 'Speech Started' || padId.includes('speech_started')) {
        this.handleVADSpeechStarted(data);
      } else if (padName === 'Speech Ended' || padId.includes('speech_ended')) {
        this.handleVADSpeechEnded(data);
      } else if (padName === 'Continued Speech' || padId.includes('continued_speech')) {
        this.handleVADContinuedSpeech(data);
      } else {
        // Generic trigger handling
        this.addTriggerEvent('VAD', `Trigger: ${padName || padId}`, data);
      }
    } else if (data.payload && data.payload.speechDetected !== undefined) {
      // Legacy handling for speech detection payload
      this.handleVADSpeechChange(data.payload.speechDetected, data);
    }
  }

  handleVADTrigger(triggerName, data) {
    const triggerNameLower = triggerName.toLowerCase();

    if (triggerNameLower.includes('speech_start')) {
      this.handleVADSpeechStarted(data);
    } else if (triggerNameLower.includes('speech_end')) {
      this.handleVADSpeechEnded(data);
    } else if (triggerNameLower.includes('continued_speech')) {
      this.handleVADContinuedSpeech(data);
    }
  }

  handleLLMData(data) {
    if (data.type === 'trigger') {
      const padId = data.padId || '';
      const padName = data.padName || '';

      console.log('🤖 LLM trigger received:', { padId, padName, data });

      if (padName === 'Run' || padId.includes('run_trigger')) {
        this.addTriggerEvent('LLM', 'LLM Run Triggered', data);
        console.log('🤖 LLM processing triggered');
      } else {
        this.addTriggerEvent('LLM', `Trigger: ${padName || padId}`, data);
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
          'stream': '🌊'
        };

        const typeColor = {
          'audio': '#28a745',
          'video': '#17a2b8',
          'trigger': '#ffc107',
          'data': '#6f42c1',
          'text': '#20c997',
          'stream': '#fd7e14'
        };

        const color = typeColor[pad.dataType] || '#6c757d';

        return `<div class="pad-item" style="border-left-color: ${color};">
          <span class="pad-icon">${typeIcon[pad.dataType] || '📄'}</span>
          <span class="pad-name">${pad.name}</span>
          <span class="pad-type" style="color: ${color};">(${pad.dataType})</span>
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
    // Reset controls
    document.getElementById('start-workflow-btn').disabled = false;
    document.getElementById('stop-workflow-btn').disabled = true;
    document.getElementById('mic-button').disabled = true;
    document.getElementById('camera-button').disabled = true;
    document.getElementById('send-text-btn').disabled = true;
    document.getElementById('text-input').disabled = true;
    document.getElementById('mic-instructions').textContent = 'Start the workflow to begin voice & video interaction';
    document.getElementById('camera-instructions').textContent = 'Camera controls will be available after workflow starts';
    document.getElementById('text-input-status').textContent = 'Start the workflow to enable text input';

    // Reset status
    this.updateMicrophoneStatus('disconnected');
    this.updateCameraStatus('disconnected');
    this.hideVideoPreview();

    // Clear nodes
    document.getElementById('workflow-nodes').innerHTML = '<p>Connect to workflow to see active nodes...</p>';

    // Reset node references
    this.vadNode = null;
    this.llmNode = null;
    this.outputNode = null;
    this.ttsNode = null;
    this.humanNode = null;
    this.llmContextEventsNode = null;

    // Reset pad references
    this.humanAudioPad = null;
    this.humanVideoPad = null;
    this.humanTextPad = null;
    this.ttsAudioPad = null;
    this.outputAudioPad = null;
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

  async sendTextMessage() {
    if (!this.humanTextPad) {
      console.error('❌ Text pad not available');
      return;
    }

    const textInput = document.getElementById('text-input');
    const message = textInput.value.trim();

    if (!message) {
      return;
    }

    try {
      console.log('💬 Sending text message:', message);
      await this.humanTextPad.publish(message);
      this.addTriggerEvent('Human', 'Text Message Sent', { message });
      textInput.value = '';
    } catch (error) {
      console.error('❌ Failed to send text message:', error);
      this.addTriggerEvent('Human', 'Text Message Failed', { error: error.message });
    }
  }
}

// Initialize the demo when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new SimpleVoiceDemo();
});