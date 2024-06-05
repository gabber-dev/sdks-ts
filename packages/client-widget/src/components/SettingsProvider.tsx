import { createContext } from "react";
import React from "react";
import { Settings } from "..";

type SettingsContextData = {
  settings: Settings;
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
  return (
    <SettingsContext.Provider
      value={{
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
