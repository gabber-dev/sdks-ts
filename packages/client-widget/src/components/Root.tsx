import { useMemo, useState } from "react";
import { Settings } from "..";
import { SessionProvider } from "gabber-client-react";
import React from "react";
import { MainView } from "./MainView";
import { Gabber } from "gabber-client-core";
import { SettingsProvider } from "./SettingsProvider";
import { BottomBarView } from "./BottomBarView";
import { Toaster } from "react-hot-toast";

const DEFAULT_SETTINGS: Settings = {
  layout: "full"
};

type Props = {
  connectionDetails: Gabber.ConnectionDetails;
  settings?: Settings;
};

export function Root({ connectionDetails, settings }: Props) {
  const [shouldConnect, setShouldConnect] = useState(
    Boolean(settings?.autoConnect)
  );

  const component = useMemo(() => {
    if(settings?.layout === "full") {
      return <MainView />
    } else if(settings?.layout === "bottom_bar") {
      return <BottomBarView />
    }
    return <MainView />;
  }, [])

  return (
    <SessionProvider
      connectionDetails={connectionDetails}
      connect={shouldConnect}
    >
      <Toaster />
      <SettingsProvider
        connect={() => setShouldConnect(true)}
        settings={settings || DEFAULT_SETTINGS}
      >
        {component}
      </SettingsProvider>
    </SessionProvider>
  );
}