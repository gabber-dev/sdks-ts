import { useSession } from "gabber-client-react"
import { Mic, MicOff } from "@mui/icons-material";
import React from "react";

export function MicrophoneToggle() {
    const { setMicrophoneEnabled, microphoneEnabled } = useSession();
    return (
      <div className="w-full h-full">
        <button
          className="w-full h-full"
          onClick={() => {
            setMicrophoneEnabled(!microphoneEnabled);
          }}
        >
          {microphoneEnabled ? <Mic /> : <MicOff />}
        </button>
      </div>
    );
}