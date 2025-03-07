import React, { useEffect, useRef, useState } from "react";
import { useSettings } from "./SettingsProvider";
import { useRealtimeSessionEngine } from "gabber-client-react";

export function Messages() {
  const { settings } = useSettings();
  const { messages, transcription } = useRealtimeSessionEngine();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        const { scrollHeight, clientHeight } = messagesContainerRef.current;
        messagesContainerRef.current.scrollTo({
          top: scrollHeight - clientHeight,
          behavior: "smooth",
        });
      }
    };

    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 1;
      setShouldAutoScroll(isScrolledToBottom);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden relative">
      {/* Messages view */}
      <h4
        className="font-semibold mb-1 text-sm"
        style={{ color: settings.primaryColor }}
      >
        Messages:
      </h4>
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-1 rounded mb-16 md:mb-4"
        style={{
          backgroundColor: settings.baseColorPlusOne || "#333333",
        }}
        onScroll={handleScroll}
      >
        <ul className="space-y-1">
          {messages.map((msg) => (
            <li
              key={`${msg.id}_${msg.agent}`}
              className={`text-xs p-2 rounded-lg ${
                msg.agent ? "text-left" : "text-right"
              }`}
              style={{
                backgroundColor: msg.agent
                  ? settings.baseColorPlusTwo || "#444444"
                  : settings.primaryColor,
                color: msg.agent
                  ? settings.baseColorContent
                  : settings.baseColor,
                maxWidth: "80%",
                marginLeft: msg.agent ? "0" : "auto",
                marginRight: msg.agent ? "auto" : "0",
              }}
            >
              <strong>{msg.agent ? "Agent: " : "You: "}</strong>
              {msg.text}
            </li>
          ))}
          {transcription.text && (
            <li
              className="text-xs italic p-2"
              style={{ color: settings.baseColorContent }}
            >
              Transcription: {transcription.text}
            </li>
          )}
          <div ref={messagesEndRef} />
        </ul>
      </div>
    </div>
  );
}
