import React from 'react'
import { createRoot } from 'react-dom/client';
import './index.css';
import { Root } from './components/Root';

export class Widget {
  static create({ elementID, connectionDetails, settings }: CreateParams) {
    console.log("Creating widget:", { elementID, connectionDetails, settings });
    const w = new Widget();
    const el = document.getElementById(elementID);
    if (!el) {
      console.error("Can't find the element with id", elementID);
      return;
    }
    const root = createRoot(el);
    root.render(
      <React.StrictMode>
        <Root
          connectionDetails={connectionDetails}
          settings={settings}
        />
      </React.StrictMode>
    );
    return w;
  }
}

export type CreateParams = { elementID: string } & {
  connectionDetails: { url: string; token: string };
} & { settings?: Settings };

export type Settings = {
  autoConnect?: boolean;
  layout?: "full" | "bottom_bar";
  connectText?: string;
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