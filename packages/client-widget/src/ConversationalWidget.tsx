import React from "react";
import { createRoot } from "react-dom/client";
import { Root } from "./conversational/Root";
import "./index.css";

export class ConversationalWidget {
  static create({
    elementID,
    settings,
    usageLimitExceededCallback,
    tokenGenerator,
  }: ConversationalWidgetCreateParams) {
    const w = new ConversationalWidget();
    const el = document.getElementById(elementID);
    if (!el) {
      console.error("Can't find the element with id", elementID);
      return;
    }
    const root = createRoot(el);
    root.render(
      <React.StrictMode>
        <Root
          settings={settings}
          tokenGenerator={tokenGenerator}
          usageLimitExceededCallback={usageLimitExceededCallback}
        />
      </React.StrictMode>,
    );
    return w;
  }
}

export type ConversationalWidgetCreateParams = {
  elementID: string;
  settings?: ConversationalWidgetSettings;
  usageLimitExceededCallback?: () => void;
  tokenGenerator: () => Promise<string>;
};

export type ConversationalWidgetSettings = {
  createTitleText?: string;
  liveTitleText?: string;
  connectButtonText?: string;
  initialPersona?: string;
  initialScenario?: string;
  initialVoice?: string;
  personaName?: string;
  personaImage?: string;
  primaryColor?: string;
  primaryColorContent?: string;
  secondaryColor?: string;
  secondaryColorContent?: string;
  baseColor?: string;
  baseColorPlusOne?: string;
  baseColorPlusTwo?: string;
  baseColorContent?: string;
  audioPlaybackFailed?: {
    descriptionText?: string;
    buttonText?: string;
  };
};
