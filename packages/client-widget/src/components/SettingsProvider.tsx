import React, { createContext } from "react";
import { InternalWidget } from "../InternalWidget";
import { ConversationalWidgetSettings } from "..";

type SettingsContextData = {
  widget: InternalWidget;
  settings: ConversationalWidgetSettings;
};

const SettingsContext = createContext<SettingsContextData | undefined>(
  undefined
);

type Props = {
  widget: InternalWidget;
  settings: ConversationalWidgetSettings;
  children: React.ReactNode;
};

export function SettingsProvider({ settings, children, widget }: Props) {
  return (
    <SettingsContext.Provider
      value={{
        settings,
        widget,
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
