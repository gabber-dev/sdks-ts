import React from "react";
import { MainView } from "./MainView";
import { SettingsProvider } from "./SettingsProvider";
import { ConversationalWidgetSettings } from "../ConversationalWidget";
import { UsageProvider } from "../providers/UsageProvider";
import { TokenProvider } from "../providers/TokenProvider";
import { VoiceProvider } from "../providers/VoiceProvider";
import { ScenarioProvider } from "../providers/ScenarioProvider";
import { PersonaProvider } from "../providers/PersonaProvider";
import { ConnectionOptsProvider } from "../providers/ConnectionOptsProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DEFAULT_SETTINGS: ConversationalWidgetSettings = {};

type Props = {
  tokenGenerator: () => Promise<string>;
  usageLimitExceededCallback?: () => void;
  settings?: ConversationalWidgetSettings;
};

export function Root({
  tokenGenerator,
  usageLimitExceededCallback,
  settings,
}: Props) {
  return (
    <TokenProvider tokenGenerator={tokenGenerator}>
      <VoiceProvider>
        <ScenarioProvider>
          <PersonaProvider>
            <UsageProvider
              usageLimitExceededCallback={usageLimitExceededCallback}
            >
              <ConnectionOptsProvider>
                <ToastContainer />
                <SettingsProvider settings={settings || DEFAULT_SETTINGS}>
                  <MainView />
                </SettingsProvider>
              </ConnectionOptsProvider>
            </UsageProvider>
          </PersonaProvider>
        </ScenarioProvider>
      </VoiceProvider>
    </TokenProvider>
  );
}
