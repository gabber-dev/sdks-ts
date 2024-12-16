import React, { createContext } from "react";
import { VoiceGenerationWidgetSettings } from "../VoiceGenerationWidget";

type SettingsContextData = {
  settings: VoiceGenerationWidgetSettings;
};

const SettingsContext = createContext<SettingsContextData | undefined>(
  undefined,
);

type Props = {
  settings: VoiceGenerationWidgetSettings;
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
