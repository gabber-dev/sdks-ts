import { useCallback, useEffect, useState } from "react";
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
  onConnectionRequested: () => Promise<Gabber.ConnectionDetails>;
  settings?: ConversationalWidgetSettings;
  widget: InternalWidget;
};

export function Root({ onConnectionRequested, settings, widget }: Props) {
  const [loadingConnectionDetails, setLoadingConnectionDetails] =
    useState(false);
  const [connectionDetails, setConnectionDetails] = useState<Gabber.ConnectionDetails | null>(null);

  const onConnectPressed = useCallback(async () => {
    setLoadingConnectionDetails(true);
    const details = await onConnectionRequested();
    console.log("NEIL Connection details", details);
    setConnectionDetails(details);
    setLoadingConnectionDetails(false);
  }, []);

  if(!connectionDetails) {
    return (
      <SettingsProvider settings={settings || DEFAULT_SETTINGS} widget={widget}>
        <ConnectionView onConnectPressed={onConnectPressed} />
      </SettingsProvider>
    );
  }

  if(loadingConnectionDetails) {
    return null;
  }

  return (
    <SessionProvider
      connect={Boolean(connectionDetails)}
      connectionDetails={connectionDetails}
    >
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