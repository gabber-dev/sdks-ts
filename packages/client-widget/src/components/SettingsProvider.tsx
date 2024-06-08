import { createContext, useMemo } from "react";
import React from "react";
import { Settings } from "..";
import { useSession } from "gabber-client-react";

type SettingsContextData = {
  settings: Settings;
  needsManualConnect: boolean;
  connect: () => void;
};

const SettingsContext = createContext<SettingsContextData | undefined>(
  undefined
);

type Props = {
  settings: Settings;
  connect: () => void;
  children: React.ReactNode;
};

export function SettingsProvider({ settings, connect, children }: Props) {
  const { inProgressState } = useSession();

  const needsManualConnect = useMemo(() => {
    if (inProgressState === "not_connected" && !Boolean(settings.autoConnect)) {
      return true;
    }
    return false;
  }, [inProgressState])

  return (
    <SettingsContext.Provider
      value={{
        needsManualConnect,
        settings,
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
