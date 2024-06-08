import { useSession } from "gabber-client-react"
import React, { useRef } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSettings } from "./SettingsProvider";

export function TranscriptionRenderer() {
    const {messages} = useSession();
    const {settings} = useSettings(); 
    const [workingText, setWorkingText] = useState("");
    const [final, setFinal] = useState(false);
    const workingId = useRef(-1)

    const lastUserMessage = useMemo(() => {
        for(let i = messages.length - 1; i >= 0; i--) {
            if(!messages[i].agent) {
                return messages[i];
            }
        }
        return null;
    }, [messages])

    useEffect(() => {
        setWorkingText(lastUserMessage?.text || "")
        setFinal(lastUserMessage?.final || false)
    }, [lastUserMessage])

    return (
      <div className="h-full w-full">
        <div
          style={{
            color: settings.baseColorContent,
          }}
        >
          {workingText}
          {final ? "" : "..."}
        </div>
      </div>
    );
}