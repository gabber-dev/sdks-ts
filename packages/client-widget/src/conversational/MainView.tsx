import React from "react";
import { LiveView } from "./LiveView";
import { SessionProvider } from "gabber-client-react";
import { useConnectionOpts } from "../providers/ConnectionOptsProvider";

export function MainView() {
  const { connectionOpts } = useConnectionOpts();

  return (
    <SessionProvider connectionOpts={connectionOpts}>
      <LiveView />
    </SessionProvider>
  );
}
