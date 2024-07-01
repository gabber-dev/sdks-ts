import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSettings } from "./SettingsProvider";
import { useSession } from "gabber-client-react";
import { MicrophoneOn } from "./icons/MicrophoneOn";
import { BarAudioVisualizer } from "./BarAudioVisualizer";
import { Send } from "./icons/Send";
import { ConnectButton } from "./ConnectButton";
import { MicrophoneOff } from "./icons/MicrophoneOff";
import { AgentVisualizer } from "./AgentVisualizer";
import { TranscriptionRenderer } from "./TranscriptionRenderer";
import toast from "react-hot-toast";
import { HoverButton } from "./HoverButton";

export function BottomBarView() {
  const [value, setValue] = useState("");
  const {
    sendChatMessage,
    microphoneEnabled,
    setMicrophoneEnabled,
    startAudio,
    userVolumeBands,
    lastError,
    canPlayAudio,
    agentState,
    connectionState
  } = useSession();

  const { settings, needsManualConnect, widget } = useSettings();

  // Sync widget with react. TODO, this should be in it's own provider
  useEffect(() => {
    widget.connectionState = connectionState;
  }, [connectionState])

  // Sync widget with react. TODO, this should be in it's own provider
  useEffect(() => {
    widget.agentState = agentState;
  }, [agentState])

  const micComponent = useMemo(() => {
    const style = {
      width: "90%",
      height: "90%",
      color: settings.baseColorContent,
    };
    return microphoneEnabled ? (
      <MicrophoneOn style={style} />
    ) : (
      <MicrophoneOff style={style} />
    );
  }, [settings.baseColor, microphoneEnabled]);

  const micClicked = useCallback(() => {
    setMicrophoneEnabled(!microphoneEnabled);
  }, [microphoneEnabled]);

  useEffect(() => {
    if(lastError) {
        toast.error(lastError);
    }
  }, [lastError])

  if (connectionState === "not_connected") {
    return (
      <div
        className="relative w-full h-full max-h-[80px] flex items-center gap-2 overflow-hidden"
        style={{
          backgroundColor: settings.baseColor,
        }}
      ></div>
    );
  }

  if (needsManualConnect) {
    return (
      <div
        className="h-full w-full max-h-[80px] flex items-center justify-center"
        style={{ backgroundColor: settings.baseColor }}
      >
        <ConnectButton />
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full max-h-[80px] flex items-center gap-2 overflow-hidden"
      style={{
        backgroundColor: settings.baseColor,
      }}
    >
      {canPlayAudio ? null : (
        <div
          className="absolute top-0 left-0 bottom-0 right-0 bg-red-500 flex flex-col items-center justify-center"
          style={{
            backgroundColor: settings.baseColorPlusTwo,
            zIndex: 9000,
          }}
        >
          <div style={{ color: settings.baseColorContent }}>
            {settings.audioPlaybackFailed?.descriptionText ||
              "Audio playback requires you to interact with this page."}
          </div>
          <HoverButton
            text={
              settings.audioPlaybackFailed?.buttonText || "Start Audio Playback"
            }
            onClick={() => {
              startAudio();
            }}
          />
        </div>
      )}
      <div className="relative h-full ml-2 flex flex-col justify-center">
        <div className="grow" />
        <button className="h-1/2 w-full" onClick={micClicked}>
          <div className="w-full h-full p-2">{micComponent}</div>
        </button>
        <div className="grow">
          <BarAudioVisualizer
            gap={2}
            color={settings.primaryColor || "#ff0000"}
            values={userVolumeBands}
          />
        </div>
      </div>
      <div className="h-full grow transition-all flex flex-col">
        <div className="grow" />
        <div className="h-2/3">
          <form
            className="h-full w-full flex justify-center items-center p-2 rounded-full"
            style={{
              borderColor: settings.baseColorPlusTwo || "white",
              borderStyle: "solid",
              borderWidth: "2px",
            }}
            onSubmit={async (e) => {
              e.preventDefault();
              await sendChatMessage({ text: value });
              setValue("");
            }}
          >
            {microphoneEnabled ? (
              <TranscriptionRenderer />
            ) : (
              <>
                <input
                  className="grow h-full bg-transparent outline-none"
                  placeholder="Start conversation..."
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                  }}
                  style={{
                    color: settings.baseColorContent || "white",
                  }}
                />
                <button
                  className="h-full aspect-square"
                  style={{
                    color: settings.baseColorContent,
                  }}
                  onClick={async () => {
                    await sendChatMessage({ text: value });
                    setValue("");
                  }}
                >
                  <Send className="w-4/5 h-4/5" />
                </button>
              </>
            )}
          </form>
        </div>
        <div className="grow" />
      </div>
      <div className="h-full aspect-square flex flex-col items-center justify-center">
        <div className="grow" />
        <div className="grow w-full mr-2">
          <AgentVisualizer gap={2} color={settings.secondaryColor || "green"} />
        </div>
        <div className="grow" />
      </div>
    </div>
  );
}
