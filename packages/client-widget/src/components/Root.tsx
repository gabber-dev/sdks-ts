import { useEffect, useRef, useState } from "react";
import { ConversationalWidgetSettings } from "..";
import { SessionProvider, useSession } from "gabber-client-react";
import React from "react";
import { MainView } from "./MainView";
import { Gabber } from "gabber-client-core";
import { SettingsProvider, useSettings } from "./SettingsProvider";
import { Toaster } from "react-hot-toast";
import { InternalWidget } from "../InternalWidget";
import { ConnectionView } from "./ConnectionView";

const DEFAULT_SETTINGS: ConversationalWidgetSettings = {};

type Props = {
  tokenGenerator: () => Promise<string>;
  settings?: ConversationalWidgetSettings;
  widget: InternalWidget;
};

export function Root({ tokenGenerator, settings, widget }: Props) {
  const [connectionOpts, setConnectionOpts] = useState<Gabber.ConnectOptions | null>(null);

  if (!connectionOpts) {
    return (
      <SettingsProvider settings={settings || DEFAULT_SETTINGS} widget={widget}>
        <ConnectionView
          tokenGenerator={tokenGenerator}
          onConnectPressed={async (info) => {
            const token = await tokenGenerator();
            const opts: Gabber.ConnectOptions = {
              token,
              sessionConnectOptions: {
                history: [
                  {
                    role: "system",
                    content: info.prompt,
                    import_id: null as any,
                  },
                ],
                voice_override: info.voice,
              },
            };
            setConnectionOpts(opts);
          }}
        />
        ;
      </SettingsProvider>
    );
  }

  return (
    <SessionProvider connectionOpts={connectionOpts}>
      <Toaster />
      <SettingsProvider settings={settings || DEFAULT_SETTINGS} widget={widget}>
        <CallbackSync />
        <MainView />
      </SettingsProvider>
    </SessionProvider>
  );
}

function CallbackSync() {
  const {
    agentState,
    remainingSeconds,
    connectionState
  } = useSession();

  const { widget } = useSettings();

  useEffect(() => {
    widget.connectionState = connectionState;
  }, [connectionState, widget])

  useEffect(() => {
    widget.agentState = agentState;
  }, [agentState, widget])

  useEffect(() => {
    widget.remainingSeconds = remainingSeconds
  }, [remainingSeconds, widget])
  
  return null;
}