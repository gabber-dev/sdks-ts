import React, { useState, useEffect } from 'react';
import { v2 } from 'gabber-client-react';

interface TriggerEvent {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  data?: any;
}

function TriggerEvents() {
  const { nodes, connectionState, runState } = v2.useAppEngine();
  const [events, setEvents] = useState<TriggerEvent[]>([]);

  const addEvent = (source: string, message: string, data?: any) => {
    const event: TriggerEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      source,
      message,
      data
    };

    setEvents(prev => [event, ...prev].slice(0, 50)); // Keep only last 50 events
  };

  // Set up event listeners for workflow events
  useEffect(() => {
    addEvent('Workflow', `Connection State: ${connectionState}`);
  }, [connectionState]);

  useEffect(() => {
    addEvent('Workflow', `Run State: ${runState}`);
  }, [runState]);

  // Set up event listeners for all nodes
  useEffect(() => {
    if (nodes.length === 0) return;

    const cleanupFunctions: Array<() => void> = [];

    nodes.forEach(node => {
      // VAD events
      if (node.type.toLowerCase().includes('vad')) {
        const speechStartedPad = node.getSourcePad('speech_started_trigger');
        const speechEndedPad = node.getSourcePad('speech_ended_trigger');
        const continuedSpeechPad = node.getSourcePad('continued_speech_trigger');

        const handleSpeechStarted = (data: any) => {
          addEvent('VAD', 'Speech Started', data);
        };

        const handleSpeechEnded = (data: any) => {
          addEvent('VAD', 'Speech Ended', data);
        };

        const handleContinuedSpeech = (data: any) => {
          addEvent('VAD', 'Continued Speech', data);
        };

        speechStartedPad?.on('trigger-received', handleSpeechStarted);
        speechEndedPad?.on('trigger-received', handleSpeechEnded);
        continuedSpeechPad?.on('trigger-received', handleContinuedSpeech);

        cleanupFunctions.push(() => {
          speechStartedPad?.off('trigger-received', handleSpeechStarted);
          speechEndedPad?.off('trigger-received', handleSpeechEnded);
          continuedSpeechPad?.off('trigger-received', handleContinuedSpeech);
        });
      }

      // LLM events
      if (node.type.toLowerCase().includes('llm')) {
        const responsePad = node.getSourcePad('response');
        const responseTextPad = node.getSourcePad('response_text');
        const startedPad = node.getSourcePad('started_trigger');
        const finishedPad = node.getSourcePad('finished_trigger');

        const handleLLMResponse = (data: any) => {
          addEvent('LLM', 'Response Generated', data);
        };

        const handleLLMResponseText = (data: any) => {
          addEvent('LLM', 'Response Text', data);
        };

        const handleLLMStarted = (data: any) => {
          addEvent('LLM', 'Processing Started', data);
        };

        const handleLLMFinished = (data: any) => {
          addEvent('LLM', 'Processing Finished', data);
        };

        responsePad?.on('data-received', handleLLMResponse);
        responseTextPad?.on('data-received', handleLLMResponseText);
        startedPad?.on('trigger-received', handleLLMStarted);
        finishedPad?.on('trigger-received', handleLLMFinished);

        cleanupFunctions.push(() => {
          responsePad?.off('data-received', handleLLMResponse);
          responseTextPad?.off('data-received', handleLLMResponseText);
          startedPad?.off('trigger-received', handleLLMStarted);
          finishedPad?.off('trigger-received', handleLLMFinished);
        });
      }

      // TTS events
      if (node.type.toLowerCase().includes('tts')) {
        const startedPad = node.getSourcePad('started_trigger');
        const finishedPad = node.getSourcePad('finished_trigger');
        const audioSourcePad = node.getSourcePad('audio_source');

        const handleTTSStarted = (data: any) => {
          addEvent('TTS', 'Speech Generation Started', data);
        };

        const handleTTSFinished = (data: any) => {
          addEvent('TTS', 'Speech Generation Finished', data);
        };

        const handleTTSAudio = (stream: MediaStream) => {
          addEvent('TTS', 'Audio Stream Connected', {
            trackCount: stream.getTracks().length
          });
        };

        startedPad?.on('trigger-received', handleTTSStarted);
        finishedPad?.on('trigger-received', handleTTSFinished);
        audioSourcePad?.on('stream-received', handleTTSAudio);

        cleanupFunctions.push(() => {
          startedPad?.off('trigger-received', handleTTSStarted);
          finishedPad?.off('trigger-received', handleTTSFinished);
          audioSourcePad?.off('stream-received', handleTTSAudio);
        });
      }

      // Generic node events
      const handleNodeData = (data: any) => {
        addEvent(node.type, 'Data Received', data);
      };

      const handleNodeStream = (stream: MediaStream) => {
        addEvent(node.type, 'Stream Received', {
          trackCount: stream.getTracks().length
        });
      };

      node.on('data-received', handleNodeData);
      node.on('stream-received', handleNodeStream);

      cleanupFunctions.push(() => {
        node.off('data-received', handleNodeData);
        node.off('stream-received', handleNodeStream);
      });
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [nodes]);

  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <div className="section">
      <h3>⚡ Trigger Events</h3>
      <div className="trigger-log">
        {events.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No events yet. Connect to a workflow to see real-time events.
          </p>
        ) : (
          events.map(event => (
            <div key={event.id} className="trigger-event">
              <div className="trigger-event-header">
                <span className="trigger-event-time">{event.timestamp}</span>
                <span className="trigger-event-source">{event.source}</span>
              </div>
              <div className="trigger-event-message">{event.message}</div>
              {event.data && (
                <div className="trigger-event-data">
                  <pre>{JSON.stringify(event.data, null, 2)}</pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <button
        className="btn btn-secondary"
        onClick={clearEvents}
        style={{ marginTop: '10px' }}
      >
        Clear Events
      </button>
    </div>
  );
}

export default TriggerEvents;