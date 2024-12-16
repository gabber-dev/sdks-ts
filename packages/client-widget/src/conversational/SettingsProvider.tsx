import React, { createContext } from "react";
import { ConversationalWidgetSettings } from "../ConversationalWidget";

type SettingsContextData = {
  settings: ConversationalWidgetSettings;
};

const SettingsContext = createContext<SettingsContextData | undefined>(
  undefined,
);

type Props = {
  settings: ConversationalWidgetSettings;
  children: React.ReactNode;
};

export function SettingsProvider({ settings, children }: Props) {
  return (
    <SettingsContext.Provider
      value={{
        settings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = React.useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
