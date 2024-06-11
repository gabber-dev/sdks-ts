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

export function BottomBarView() {
  const [value, setValue] = useState("");
  const {
    sendChatMessage,
    microphoneEnabled,
    setMicrophoneEnabled,
    userVolumeBands,
    lastError
  } = useSession();

  const { settings, needsManualConnect } = useSettings();
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
    console.error(lastError)
    if(lastError) {
        toast.error(lastError);
    }
  }, [lastError])

  if (needsManualConnect) {
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        style={{ backgroundColor: settings.baseColor }}
      >
        <ConnectButton />
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full flex items-center gap-2 overflow-hidden"
      style={{
        backgroundColor: settings.baseColor,
      }}
    >
      <div className="relative h-full ml-2 flex flex-col">
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
        <div className="h-2/3 aspect-square rounded-full overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={settings.personaImage}
          />
        </div>
        <div className="grow w-full">
          <AgentVisualizer gap={2} color={settings.secondaryColor || "green"} />
        </div>
      </div>
    </div>
  );
}
