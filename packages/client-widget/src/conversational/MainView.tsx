import React from "react";
import { LiveView } from "./LiveView";
import { RealtimeSessionEngineProvider } from "gabber-client-react";
import { useConnectionOpts } from "../providers/ConnectionOptsProvider";

export function MainView() {
  const { connectionOpts } = useConnectionOpts();

  return (
    <RealtimeSessionEngineProvider connectionOpts={connectionOpts}>
      <LiveView />
    </RealtimeSessionEngineProvider>
  );
}
