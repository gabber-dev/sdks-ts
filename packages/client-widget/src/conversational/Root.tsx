import React from "react";
import { MainView } from "./MainView";
import { SettingsProvider } from "./SettingsProvider";
import { Toaster } from "react-hot-toast";
import {
  ConversationalWidgetSettings,
} from "../ConversationalWidget";
import { UsageProvider } from "../providers/UsageProvider";
import { TokenProvider } from "../providers/TokenProvider";

const DEFAULT_SETTINGS: ConversationalWidgetSettings = {};

type Props = {
  tokenGenerator: () => Promise<string>;
  usageLimitExceededCallback?: () => void;
  settings?: ConversationalWidgetSettings;
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
