import { useState } from "react";
import { Settings } from "..";
import { SessionProvider } from "gabber-client-react";
import React from "react";
import { MainView } from "./MainView";
import { Gabber } from "gabber-client-core";

type Props = {
  connectionDetails: Gabber.ConnectionDetails;
  settings?: Settings;
};

export function Root({ connectionDetails, settings }: Props) {
  const [shouldConnect, setShouldConnect] = useState(
    Boolean(settings?.autoConnect)
  );

  return (
    <SessionProvider
      connectionDetails={connectionDetails}
      connect={shouldConnect}
    >
      <>
        <MainView connect={() => setShouldConnect(true)} settings={settings} />
      </>
    </SessionProvider>
  );
}