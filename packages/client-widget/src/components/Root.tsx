import { useState } from "react";
import { Settings } from "..";
import { SessionProvider } from "gabber-client-react";
import React from "react";
import { MainView } from "./MainView";
import { Gabber } from "gabber-client-core";
import { SettingsProvider } from "./SettingsProvider";

const DEFAULT_SETTINGS: Settings = {};

type Props = {
  connectionDetails: Gabber.ConnectionDetails;
  settings?: Settings;
};

export function Root({ connectionDetails, settings }: Props) {
  const [shouldConnect, setShouldConnect] = useState(
    Boolean(settings?.autoConnect)
  );

  console.log("shold conect", shouldConnect)

  return (
    <SessionProvider
      connectionDetails={connectionDetails}
      connect={shouldConnect}
    >
      <SettingsProvider
        connect={() => setShouldConnect(true)}
        settings={settings || DEFAULT_SETTINGS}
      >
        <MainView />
      </SettingsProvider>
    </SessionProvider>
  );
}