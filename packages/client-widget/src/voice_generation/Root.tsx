import React from "react";
import { MainView } from "./MainView";
import { SettingsProvider } from "./SettingsProvider";
import { Toaster } from "react-hot-toast";
import {VoiceGenerationWidgetSettings, InternalVoiceGenerationWidget} from "../VoiceGenerationWidget";
import { TokenProvider } from "../providers/TokenProvider";
import { UsageProvider } from "../providers/UsageProvider";

const DEFAULT_SETTINGS: VoiceGenerationWidgetSettings = {};

type Props = {
  tokenGenerator: () => Promise<string>;
  usageLimitExceededCallback?: () => void;
  settings?: VoiceGenerationWidgetSettings;
  widget: InternalVoiceGenerationWidget;
};

export function Root({ tokenGenerator, usageLimitExceededCallback, settings }: Props) {
  return (
    <TokenProvider tokenGenerator={tokenGenerator}>
      <UsageProvider usageLimitExceededCallback={usageLimitExceededCallback}>
        <Toaster />
        <SettingsProvider settings={settings || DEFAULT_SETTINGS}>
          <MainView />
        </SettingsProvider>
      </UsageProvider>
    </TokenProvider>
  );
}