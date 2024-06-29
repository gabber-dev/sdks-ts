import { createContext, useEffect, useMemo } from "react";
import React from "react";
import { Settings, Widget } from "..";
import { useSession } from "gabber-client-react";

type SettingsContextData = {
  widget: Widget;
  settings: Settings;
  needsManualConnect: boolean;
  connect: () => void;
};

const SettingsContext = createContext<SettingsContextData | undefined>(
  undefined
);

type Props = {
  widget: Widget;
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
  const { inProgressState } = useSession();

  const needsManualConnect = useMemo(() => {
    if (inProgressState === "not_connected" && !Boolean(settings.autoConnect)) {
      return true;
    }
    return false;
  }, [inProgressState]);

  useEffect(() => {
    if (inProgressState === "not_connected" && Boolean(settings.autoConnect)) {
      connect();
    }
  }, [inProgressState, settings?.autoConnect]);

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
