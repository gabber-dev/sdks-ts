import React from 'react'
import { createRoot } from 'react-dom/client';
import { Root } from "./conversational/Root";
import './index.css';

export class InternalConversationalWidget {
  private _disconnectHandler: () => void = () => null;

  public registerDisconnectHandler(h: () => void) {
    this._disconnectHandler = h;
  }

  public disconnect() {
    this._disconnectHandler();
  }
}

export class ConversationalWidget extends InternalConversationalWidget {
  static create({
    elementID,
    settings,
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
        <Root widget={w} settings={settings} tokenGenerator={tokenGenerator} />
      </React.StrictMode>
    );
    return w;
  }

  public disconnect() {
    super.disconnect();
  }
}

export type ConversationalWidgetCreateParams = {
  elementID: string;
  settings?: ConversationalWidgetSettings;
  tokenGenerator: () => Promise<string>;
};

export type ConversationalWidgetSettings = {
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

