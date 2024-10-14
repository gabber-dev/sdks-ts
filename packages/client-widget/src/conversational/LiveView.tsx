import React, { useRef, useState, useEffect } from "react";
import { useSettings } from "./SettingsProvider";
import { useSession } from "gabber-client-react";
import { IoMdSend } from "react-icons/io";
import { BarAudioVisualizer } from "./BarAudioVisualizer";
import { useUsage } from "../providers/UsageProvider";
import { ConnectionViewBottom } from "./ConnectionViewBottom";

export function LiveView() {
  const { settings } = useSettings();
  const {
    connectionState,
    agentState,
    microphoneEnabled,
    setMicrophoneEnabled,
    agentVolumeBands,
    userVolumeBands,
    remainingSeconds,
    messages,
    transcription,
    sendChatMessage
  } = useSession();
  const [inputMessage, setInputMessage] = useState("");
  const [prompt, setPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const { checkUsage } = useUsage();
  const [activeTab, setActiveTab] = useState<"messages" | "connection">("connection");
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  useEffect(() => {
    console.log("Connection state changed:", connectionState);
    if(connectionState !== 'connected') {
      checkUsage("conversational_seconds")
    }
  }, [connectionState]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 1;
      setShouldAutoScroll(isScrolledToBottom);
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
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

  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
  };

  return (
    <div 
      className="rounded-lg shadow-md h-full w-full mx-auto flex flex-col overflow-hidden p-2 md:p-4"
      style={{ 
        backgroundColor: settings.baseColor || '#000000',
        color: settings.baseColorContent || '#ffffff',
        borderColor: settings.primaryColor
      }}
    >
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden space-y-2 md:space-y-0 md:space-x-2">
        {/* Left column (mic, agent volumes) */}
        <div className="w-full md:w-1/3 flex flex-col overflow-hidden">
          <h3 className="text-lg md:text-2xl font-semibold mb-2 md:mb-4" style={{ color: settings.primaryColor }}>{settings.liveTitleText || "Chat"}</h3>
          <div className="mb-1 md:mb-2 text-xs md:text-sm" style={{ color: settings.baseColorContent }}>
            <span className="font-semibold">Connection:</span> {connectionState}
          </div>
          <div className="mb-1 md:mb-2 text-xs md:text-sm" style={{ color: settings.baseColorContent }}>
            <span className="font-semibold">Agent State:</span> {agentState}
          </div>
          <button
            onClick={() => setMicrophoneEnabled(!microphoneEnabled)}
            className="mb-2 md:mb-4 px-2 py-1 md:px-4 md:py-2 rounded font-semibold text-xs md:text-sm"
            style={{ 
              backgroundColor: 'transparent',
              color: microphoneEnabled ? settings.primaryColor : settings.baseColorContent,
              border: `2px solid ${microphoneEnabled ? settings.primaryColor : settings.baseColorContent}`,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {microphoneEnabled ? 'Disable Mic' : 'Enable Mic'}
          </button>
          <div className="flex flex-col overflow-hidden">
            <h4 className="font-semibold mb-1 md:mb-2 text-xs md:text-sm" style={{ color: settings.primaryColor }}>Volume Bands:</h4>
            <div className="flex space-x-2 h-12 md:h-16 mb-2 md:mb-4 overflow-hidden">
              <div className="w-1/2">
                <BarAudioVisualizer
                  gap={1}
                  color={settings.secondaryColor || '#ff00ff'}
                  values={agentVolumeBands}
                />
              </div>
              <div className="w-1/2">
                <BarAudioVisualizer
                  gap={1}
                  color={settings.primaryColor || '#00ff00'}
                  values={userVolumeBands}
                />
              </div>
            </div>
            {remainingSeconds !== null && (
              <div className="mb-2 md:mb-4">
                <h4 className="font-semibold mb-1 text-xs md:text-sm" style={{ color: settings.primaryColor }}>Remaining Time:</h4>
                <div className="text-xs md:text-sm font-semibold">{remainingSeconds} seconds</div>
              </div>
            )}
          </div>
        </div>

        {/* Right column (messages/connection) */}
        <div className="w-full md:w-2/3 flex flex-col overflow-hidden">
          {/* Tab switcher (visible on mobile, hidden on desktop) */}
          <div className="md:hidden mb-2 flex border-b">
            <button
              className={`flex-1 py-1 px-2 text-sm ${activeTab === "connection" ? "border-b-2" : ""}`}
              style={{
                borderColor: activeTab === "connection" ? settings.primaryColor : "transparent",
                color: activeTab === "connection" ? settings.primaryColor : settings.baseColorContent,
              }}
              onClick={() => setActiveTab("connection")}
            >
              Connection
            </button>
            <button
              className={`flex-1 py-1 px-2 text-sm ${activeTab === "messages" ? "border-b-2" : ""}`}
              style={{
                borderColor: activeTab === "messages" ? settings.primaryColor : "transparent",
                color: activeTab === "messages" ? settings.primaryColor : settings.baseColorContent,
              }}
              onClick={() => setActiveTab("messages")}
            >
              Messages
            </button>
          </div>

          <div className="flex-grow flex flex-col overflow-hidden h-full relative">
            {/* Messages view */}
            <div className={`h-full flex flex-col ${activeTab === "messages" ? "block" : "hidden md:block"}`}>
              <h4 className="font-semibold mb-1 text-sm" style={{ color: settings.primaryColor }}>Messages:</h4>
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-1 rounded mb-16 md:mb-4"
                style={{ 
                  backgroundColor: settings.baseColorPlusOne || '#333333',
                }}
                onScroll={handleScroll}
              >
                <ul className="space-y-1">
                  {messages.map((msg) => (
                    <li 
                      key={`${msg.id}_${msg.agent}`}
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
                  {transcription.text && (
                    <li className="text-xs italic p-2" style={{ color: settings.baseColorContent }}>Transcription: {transcription.text}</li>
                  )}
                  <div ref={messagesEndRef} />
                </ul>
              </div>

              {/* Chat input */}
              <div className="md:relative absolute bottom-0 left-0 right-0 bg-inherit p-2">
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

            {/* Connection view */}
            <div className={`h-full flex flex-col ${activeTab === "connection" ? "block" : "hidden md:block"}`}>
              <div className="flex-grow overflow-y-auto">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full mb-4 p-2 rounded-md border"
                  style={{
                    backgroundColor: settings.baseColorPlusOne || '#f0f0f0',
                    color: settings.baseColorContent || '#000000',
                    borderColor: settings.primaryColor || '#000000',
                    resize: 'vertical',
                    minHeight: '80px',
                  }}
                  placeholder="Enter your prompt here..."
                />
                <div className="h-auto max-h-[50vh] overflow-y-auto mb-4">
                  <ConnectionViewBottom 
                    onConnectPressed={(info) => {
                      // Handle connection info
                      console.log("New connection info:", info);
                      // Implement the logic to update the session with the new connection info
                    }} 
                    onSelectionChange={handlePromptChange}
                  />
                </div>
                <button
                  className="w-full py-2 px-4 rounded-md font-semibold text-sm md:text-base"
                  style={{
                    backgroundColor: settings.primaryColor,
                    color: settings.baseColor,
                    opacity: isConnecting ? 0.7 : 1,
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                  }}
                  onClick={() => {
                    if (!isConnecting) {
                      setIsConnecting(true);
                      // Implement the connection logic here
                      // Once connected, set setIsConnecting(false)
                    }
                  }}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : (settings.connectButtonText || 'Connect')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}