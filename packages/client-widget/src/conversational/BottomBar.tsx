import { useRealtimeSessionEngine } from "gabber-client-react";
import React, { useState } from "react";
import { useSettings } from "./SettingsProvider";
import { useConnectionOpts } from "../providers/ConnectionOptsProvider";
import { MicrophoneButton } from "./MicrophoneButton";
import { Send } from "../components/icons/Send";
import { BarAudioVisualizer } from "./BarAudioVisualizer";

export function BottomBar() {
  const {
    connectionState,
    sendChatMessage,
    microphoneEnabled,
    userVolumeBands,
  } = useRealtimeSessionEngine();

  const { connect } = useConnectionOpts();

  const { settings } = useSettings();

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendChatMessage({ text: inputMessage });
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const [inputMessage, setInputMessage] = useState("");

  if (connectionState !== "connected") {
    return (
      <button
        className="w-full h-full font-semibold"
        style={{
          backgroundColor: settings.primaryColor,
          color: settings.baseColor,
          opacity: connectionState === "not_connected" ? 1.0 : 0.7,
          cursor:
            connectionState === "not_connected" ? "pointer" : "not-allowed",
        }}
        onClick={() => {
          connect();
        }}
        disabled={connectionState !== "not_connected"}
      >
        {connectionState === "not_connected"
          ? settings.connectButtonText || "Connect"
          : "Connecting..."}
      </button>
    );
  }

  return (
    <div className="h-full w-full flex items-center">
      <div className="h-full aspect-square p-2">
        <MicrophoneButton />
      </div>
      {microphoneEnabled ? (
        <div className="grow h-full flex items-center justify-center">
          <div className="w-1/3 h-full">
            <BarAudioVisualizer
              gap={2}
              color={settings.baseColorContent || "gray"}
              values={userVolumeBands}
            />
          </div>
        </div>
      ) : (
        <div className="h-full my-1 grow">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="outline-none w-full h-full px-2"
            style={{
              backgroundColor: settings.baseColorPlusOne || "#333333",
              color: settings.baseColorContent || "#ffffff",
              borderColor: settings.primaryColor,
              resize: "none",
              minHeight: "40px",
              maxHeight: "120px",
              overflow: "auto",
            }}
            placeholder="Type a message..."
          />
        </div>
      )}
      <div className="h-full aspect-square">
        <button
          onClick={handleSendMessage}
          className="w-full h-full p-2"
          style={{
            backgroundColor: settings.primaryColor,
            color: settings.baseColor,
          }}
        >
          <Send className="w-full h-full" />
        </button>
      </div>
    </div>
  );
}
