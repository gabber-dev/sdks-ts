import React, { useMemo, useState } from "react";
import { ConnectionView } from "./ConnectionView";
import { LiveView } from "./LiveView";
import { SessionProvider } from "gabber-client-react";
import { useToken } from "../providers/TokenProvider";
import { useUsage } from "../providers/UsageProvider";

export function MainView() {
  const {token} = useToken();
  const [prompt, setPrompt] = useState<string | null>(null);
  const [voice, setVoice] = useState<string | null>(null);

  const { exceededLimits } = useUsage();

  const connectionOpts = useMemo(() => {
    console.log("ConnectionOpts", exceededLimits, token, prompt, voice);
    if (exceededLimits.includes("conversational_seconds")) {
      return null;
    }
    if (!token || !prompt || !voice) {
      return null;
    }

    return {
      token,
      sessionConnectOptions: {
        history: [{ role: "system", content: prompt }],
        voice_override: voice,
      },
    };
  }, [exceededLimits, token, prompt, voice]);

  if (!connectionOpts) {
    return (
      <ConnectionView
        onConnectPressed={(opts) => {
          console.log("Connection", opts);
          setPrompt(opts.prompt);
          setVoice(opts.voice);
        }}
      />
    );
  }

  return (
    <SessionProvider connectionOpts={connectionOpts}>
      <LiveView />
    </SessionProvider>
  );
}
