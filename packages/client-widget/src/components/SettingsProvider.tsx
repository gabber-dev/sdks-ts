import { createContext, useEffect, useMemo } from "react";
import React from "react";
import { Settings } from "..";
import { useSession } from "gabber-client-react";
import { InternalWidget } from "../InternalWidget";

type SettingsContextData = {
  widget: InternalWidget;
  settings: Settings;
  needsManualConnect: boolean;
  connect: () => void;
};

const SettingsContext = createContext<SettingsContextData | undefined>(
  undefined
);

type Props = {
  widget: InternalWidget;
  settings: Settings;
  connect: () => void;
  children: React.ReactNode;
};

export function SettingsProvider({
  settings,
  connect,
  children,
  widget,
}: Props) {
  const { connectionState } = useSession();

  const needsManualConnect = useMemo(() => {
    if (connectionState === "not_connected" && !Boolean(settings.autoConnect)) {
      return true;
    }
    return false;
  }, [connectionState]);

  useEffect(() => {
    if (connectionState === "not_connected" && Boolean(settings.autoConnect)) {
      connect();
    }
  }, [connectionState, settings?.autoConnect]);

  return (
    <SettingsContext.Provider
      value={{
        needsManualConnect,
        settings,
        widget,
        connect,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = React.useContext(SettingsContext);
  if (!context) {
    throw "useSettings must be used within a SettingsProvider";
  }
  return context;
}
