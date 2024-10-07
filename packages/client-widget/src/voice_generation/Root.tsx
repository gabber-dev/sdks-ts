import React from "react";
import { MainView } from "./MainView";
import { SettingsProvider } from "./SettingsProvider";
import { Toaster } from "react-hot-toast";
import {VoiceGenerationWidgetSettings, InternalVoiceGenerationWidget} from "../VoiceGenerationWidget";

const DEFAULT_SETTINGS: VoiceGenerationWidgetSettings = {};

type Props = {
  tokenGenerator: () => Promise<string>;
  settings?: VoiceGenerationWidgetSettings;
  widget: InternalVoiceGenerationWidget;
};

export function Root({ tokenGenerator, settings }: Props) {
  const [token, setToken] = React.useState<string | null>(null);
  if (!token) {
    tokenGenerator().then(setToken);
    return <div>Loading...</div>;
  }
  return (
    <>
      <Toaster />
      <SettingsProvider settings={settings || DEFAULT_SETTINGS}>
        <MainView token={token} />
      </SettingsProvider>
    </>
  );
}