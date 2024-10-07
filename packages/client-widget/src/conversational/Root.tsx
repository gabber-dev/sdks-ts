import { useState } from "react";
import { SessionProvider } from "gabber-client-react";
import React from "react";
import { MainView } from "./MainView";
import { Gabber } from "gabber-client-core";
import { SettingsProvider } from "./SettingsProvider";
import { Toaster } from "react-hot-toast";
import { ConnectionView } from "./ConnectionView";
import {
  ConversationalWidgetSettings,
  InternalConversationalWidget,
} from "../ConversationalWidget";

const DEFAULT_SETTINGS: ConversationalWidgetSettings = {};

type Props = {
  tokenGenerator: () => Promise<string>;
  settings?: ConversationalWidgetSettings;
  widget: InternalConversationalWidget;
};

export function Root({ tokenGenerator, settings }: Props) {
  const [connectionOpts, setConnectionOpts] =
    useState<Gabber.ConnectOptions | null>(null);

  if (!connectionOpts) {
    return (
      <SettingsProvider settings={settings || DEFAULT_SETTINGS}>
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
      <SettingsProvider settings={settings || DEFAULT_SETTINGS}>
        <MainView />
      </SettingsProvider>
    </SessionProvider>
  );
}
