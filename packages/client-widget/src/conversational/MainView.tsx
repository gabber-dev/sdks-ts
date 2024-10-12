import React, { useRef, useState, useEffect } from "react";
import { Input } from "./Input";
import { useSettings } from "./SettingsProvider";
import { AgentVisualizer } from "./AgentVisualizer";
import { useSession } from "gabber-client-react";
import { IoMdSend } from "react-icons/io";

export function MainView() {
  const { settings } = useSettings();
  const {
    connectionState,
    agentState,
    microphoneEnabled,
    setMicrophoneEnabled,
    agentVolumeBands,
    agentVolume,
    userVolume,
    remainingSeconds,
    messages,
    transcription,
    sendChatMessage
  } = useSession();
  const [inputMessage, setInputMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<Array<{agent: boolean, text: string}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const isScrolledToBottom = messagesContainerRef.current.scrollHeight - messagesContainerRef.current.clientHeight <= messagesContainerRef.current.scrollTop + 1;
      if (isScrolledToBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [localMessages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = { agent: false, text: inputMessage };
      setLocalMessages(prevMessages => [...prevMessages, newMessage]);
      sendChatMessage({ text: inputMessage });
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div 
      className="rounded-lg shadow-md h-full w-full mx-auto flex flex-col overflow-hidden p-4 md:p-6"
      style={{ 
        backgroundColor: settings.baseColor || '#000000',
        color: settings.baseColorContent || '#ffffff',
        borderColor: settings.primaryColor
      }}
    >
      <div className="p-4 flex-grow flex flex-col md:flex-row overflow-hidden space-y-4 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-1/2 flex flex-col overflow-hidden">
          <h3 className="text-xl md:text-2xl font-semibold mb-4" style={{ color: settings.primaryColor }}>Gabber AI Chat</h3>
          <div className="mb-2 text-xs md:text-sm" style={{ color: settings.baseColorContent }}>
            <span className="font-semibold">Connection:</span> {connectionState}
          </div>
          <div className="mb-2 text-xs md:text-sm" style={{ color: settings.baseColorContent }}>
            <span className="font-semibold">Agent State:</span> {agentState}
          </div>
          <button
            onClick={() => setMicrophoneEnabled(!microphoneEnabled)}
            className="mb-4 px-3 py-1 md:px-4 md:py-2 rounded font-semibold text-xs md:text-sm transition-colors"
            style={{ 
              backgroundColor: microphoneEnabled ? settings.secondaryColor : 'transparent',
              color: microphoneEnabled ? settings.baseColor : settings.primaryColor,
              border: `2px solid ${microphoneEnabled ? settings.secondaryColor : settings.primaryColor}`,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {microphoneEnabled ? 'Disable Mic' : 'Enable Mic'}
          </button>
          <div className="flex flex-col overflow-hidden">
            <h4 className="font-semibold mb-2 text-sm" style={{ color: settings.primaryColor }}>Volume Bands:</h4>
            <div className="flex space-x-1 h-16 mb-4 overflow-hidden">
              {agentVolumeBands.map((band, index) => (
                <div
                  key={index}
                  className="w-1 md:w-2 self-end transition-all duration-75"
                  style={{ 
                    height: `${band * 100}%`,
                    backgroundColor: settings.secondaryColor
                  }}
                ></div>
              ))}
            </div>
            <div className="mb-4">
              <h4 className="font-semibold mb-1 text-sm" style={{ color: settings.primaryColor }}>Agent Volume:</h4>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full transition-all duration-75" 
                  style={{ 
                    width: `${agentVolume * 100}%`,
                    backgroundColor: settings.secondaryColor
                  }}
                ></div>
              </div>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold mb-1 text-sm" style={{ color: settings.primaryColor }}>User Volume:</h4>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full transition-all duration-75" 
                  style={{ 
                    width: `${userVolume * 100}%`,
                    backgroundColor: settings.primaryColor
                  }}
                ></div>
              </div>
            </div>
            {remainingSeconds !== null && (
              <div className="mb-4">
                <h4 className="font-semibold mb-1 text-sm" style={{ color: settings.primaryColor }}>Remaining Time:</h4>
                <div className="text-sm font-semibold">{remainingSeconds} seconds</div>
              </div>
            )}
          </div>
        </div>
        <div className="w-full md:w-1/2 md:pl-4 md:border-l border-gray-200 flex flex-col overflow-hidden">
          <h4 className="font-semibold mb-1 text-sm" style={{ color: settings.primaryColor }}>Messages:</h4>
          <div 
            ref={messagesContainerRef}
            className="flex-grow overflow-y-auto p-1 rounded h-[280px]"
            style={{ backgroundColor: settings.baseColorPlusOne || '#333333' }}
          >
            <ul className="space-y-2">
              {localMessages.map((msg) => (
                <li 
                  key={`${msg.agent ? 'agent' : 'user'}-${msg.id}`}
                  className={`text-xs p-2 rounded-lg ${msg.agent ? 'text-left' : 'text-right'}`}
                  style={{ 
                    backgroundColor: msg.agent ? settings.baseColorPlusTwo || '#444444' : settings.primaryColor,
                    color: msg.agent ? settings.baseColorContent : settings.baseColor,
                    maxWidth: '80%',
                    marginLeft: msg.agent ? '0' : 'auto',
                    marginRight: msg.agent ? 'auto' : '0',
                  }}
                >
                  <strong>{msg.agent ? 'Agent: ' : 'You: '}</strong>{msg.text}
                </li>
              ))}
              {transcription.text && !transcription.final && (
                <li className="text-xs italic p-2" style={{ color: settings.baseColorContent }}>Transcription: {transcription.text}</li>
              )}
              <div ref={messagesEndRef} />
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="flex items-center">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-grow rounded-l px-2 py-1 text-xs md:text-sm focus:outline-none focus:ring-1"
            style={{ 
              backgroundColor: settings.baseColorPlusOne || '#333333',
              color: settings.baseColorContent || '#ffffff',
              borderColor: settings.primaryColor,
              resize: 'none',
              minHeight: '40px',
              maxHeight: '120px',
              overflow: 'auto',
            }}
            placeholder="Type a message..."
          />
          <button
            onClick={handleSendMessage}
            className="px-3 py-2 rounded-r font-semibold text-xs md:text-sm transition-colors"
            style={{ 
              backgroundColor: settings.primaryColor,
              color: settings.baseColor,
            }}
          >
            <IoMdSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
