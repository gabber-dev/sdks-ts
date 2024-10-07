import React from 'react'
import { createRoot } from 'react-dom/client';
import './index.css';
import { Root } from './voice_generation/Root';

export class InternalVoiceGenerationWidget {
  public constructor() {}
}

export class VoiceGenerationWidget extends InternalVoiceGenerationWidget {
  static create({
    elementID,
    settings,
    tokenGenerator,
  }: VoiceGenerationWidgetCreateParams) {
    const w = new VoiceGenerationWidget();
    const el = document.getElementById(elementID);
    if (!el) {
      console.error("Can't find the element with id", elementID);
      return;
    }
    const root = createRoot(el);
    root.render(
      <React.StrictMode>
        <Root
          widget={w}
          settings={settings}
          tokenGenerator={tokenGenerator}
        />
      </React.StrictMode>
    );
    return w;
  }
}

export type VoiceGenerationWidgetCreateParams = {
  elementID: string;
  settings?: VoiceGenerationWidgetSettings;
  tokenGenerator: () => Promise<string>;
};

export type VoiceGenerationWidgetSettings = {
  connectText?: string;
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
    descriptionText?: string
    buttonText?: string
  }
};

