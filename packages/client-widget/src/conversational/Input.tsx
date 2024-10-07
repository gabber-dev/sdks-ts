import React, { useCallback, useMemo, useState } from "react";
import { useSession } from "gabber-client-react";
import { useSettings } from "./SettingsProvider";
import { MicrophoneOff } from "../components/icons/MicrophoneOff";
import { MicrophoneOn } from "../components/icons/MicrophoneOn";
import { Chat } from "../components/icons/Chat";
import { BarAudioVisualizer } from "./BarAudioVisualizer";
import { Send } from "../components/icons/Send";

type Props = {
    heightPixels: number
}

export function Input({heightPixels}: Props) {
  const [value, setValue] = useState("");
  const {
    sendChatMessage,
    microphoneEnabled,
    setMicrophoneEnabled,
    userVolumeBands
  } = useSession();
  const { settings } = useSettings();
  const [mode, setMode] = useState<"chat" | "voice">("chat");
  const { mic, chat, visualizer } = useMemo(() => {
    const halfHeight = Math.floor(heightPixels / 2);
    const mic = {left: 0, bottom: 0, top: "calc(50%)", right: `calc(100% - ${halfHeight}px)`}
    const chat = {
      backgroundColor:mode === "chat" ? settings.baseColorContent : "transparent",
      overflow: mode === "chat" ? "hidden" : "",
      left: mode === "chat" ? `calc(${halfHeight}px + 4px` : `calc(100% - ${halfHeight}px)`,
      bottom: 0,
      top: mode === "chat" ? `calc(${halfHeight}px)` : `calc(${halfHeight}px)`,
      right: 0
    }
    const visualizer = {
      top: '25%',
      bottom: '0%',
      left: mode === "voice" ? `25%`: `50%`,
      right: mode === "voice" ? `25%` : `50%`,
      opacity: mode === "voice" ? "100%": "0%"
    }

    return {mic, chat, visualizer}
  }, [mode]);

  const micComponent = useMemo(() => {
    const style = {
      width: "90%",
      height: "90%",
      color: settings.baseColorContent,
    };
    if (mode !== "voice") {
      return <MicrophoneOff style={style} />;
    }

    return microphoneEnabled ? (
      <MicrophoneOn style={style} />
    ) : (
      <MicrophoneOff style={style} />
    );
  }, [mode, settings.baseColor, microphoneEnabled]);

  const micClicked = useCallback(() => {
    if (mode === "chat") {
      setMode("voice");
      setMicrophoneEnabled(true);
      return;
    }

    setMicrophoneEnabled(!microphoneEnabled);
  }, [mode, microphoneEnabled]);

  return (
    <div className="relative h-full w-full">
      <div className="absolute transition-all" style={visualizer}>
        <div
          className="rounded-md w-full h-full p-4"
          style={{
            backgroundColor: settings.baseColorPlusOne,
            border: settings.baseColorPlusTwo,
            borderWidth: "2px",
            borderStyle: "solid",
          }}
        >
          <BarAudioVisualizer
            gap={2}
            color={settings.primaryColor || "#ff0000"}
            values={userVolumeBands}
          />
        </div>
      </div>
      <div className="absolute transition-all" style={mic}>
        <button className="h-full w-full" onClick={micClicked}>
          <div className="h-full w-full p-2">{micComponent}</div>
        </button>
      </div>
      <div className="absolute transition-all rounded-md" style={chat}>
        {mode === "chat" ? (
          <form
            className="h-full w-full flex justify-center items-center p-2"
            onSubmit={async (e) => {
              e.preventDefault();
              await sendChatMessage({ text: value });
              setValue("");
            }}
          >
            <input
              className="grow h-full bg-transparent outline-none"
              placeholder="Say something..."
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
              }}
            />
            <button
              className="h-full aspect-square"
              style={{
                color: settings.baseColor,
              }}
              onClick={async () => {
                await sendChatMessage({ text: value });
                setValue("");
              }}
            >
              <Send className="w-4/5 h-4/5" />
            </button>
          </form>
        ) : (
          <button
            className="w-full h-full flex items-center justify-center"
            onClick={() => {
              setMicrophoneEnabled(false);
              setMode("chat");
            }}
          >
            <Chat
              style={{
                width: "50%",
                height: "50%",
                color: settings.baseColorContent,
              }}
            />
          </button>
        )}
      </div>
    </div>
  );
}
