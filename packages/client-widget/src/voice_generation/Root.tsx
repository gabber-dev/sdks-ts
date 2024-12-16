import React from "react";
import { MainView } from "./MainView";
import { SettingsProvider } from "./SettingsProvider";
import { ToastContainer } from "react-toastify";
import {
  VoiceGenerationWidget,
  VoiceGenerationWidgetSettings,
} from "../VoiceGenerationWidget";
import { TokenProvider } from "../providers/TokenProvider";
import { UsageProvider } from "../providers/UsageProvider";
import { VoiceProvider } from "../providers/VoiceProvider";
import "react-toastify/dist/ReactToastify.css";

const DEFAULT_SETTINGS: VoiceGenerationWidgetSettings = {};

type Props = {
  tokenGenerator: () => Promise<string>;
  usageLimitExceededCallback?: () => void;
  settings?: VoiceGenerationWidgetSettings;
  widget: VoiceGenerationWidget;
};

export function Root({
  tokenGenerator,
  usageLimitExceededCallback,
  settings,
}: Props) {
  return (
    <TokenProvider tokenGenerator={tokenGenerator}>
      <UsageProvider usageLimitExceededCallback={usageLimitExceededCallback}>
        <ToastContainer />
        <SettingsProvider settings={settings || DEFAULT_SETTINGS}>
          <VoiceProvider>
            <MainView />
          </VoiceProvider>
        </SettingsProvider>
      </UsageProvider>
    </TokenProvider>
  );
}
