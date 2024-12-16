import { useRealtimeSessionEngine } from "gabber-client-react";
import React from "react";
import { MicrophoneOff } from "../components/icons/MicrophoneOff";
import { MicrophoneOn } from "../components/icons/MicrophoneOn";

export function MicrophoneButton() {
  const { microphoneEnabled, setMicrophoneEnabled } =
    useRealtimeSessionEngine();
  return (
    <div className="w-full h-ful">
      <button
        onClick={() => {
          setMicrophoneEnabled(!microphoneEnabled);
        }}
        className="h-full w-full"
      >
        {microphoneEnabled ? (
          <MicrophoneOn className="h-full w-full" />
        ) : (
          <MicrophoneOff className="h-full w-full" />
        )}
      </button>
    </div>
  );
}
