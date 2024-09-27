import React from 'react'
import { createRoot } from 'react-dom/client';
import { Gabber } from "gabber-client-core";
import './index.css';
import { Root } from './components/Root';
import { InternalWidget } from './InternalWidget';

export class ConversationalWidget extends InternalWidget {
  static create({
    elementID,
    settings,
    onConnectionRequested,
    onAgentStateChanged,
    onRemainingSecondsChanged,
    onConnectionStateChanged,
  }: CreateParams) {
    const w = new ConversationalWidget({
      onAgentStateChanged,
      onConnectionStateChanged,
      onRemainingSecondsChanged,
    });
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
          onConnectionRequested={onConnectionRequested}
        />
      </React.StrictMode>
    );
    return w;
  }

  public get agentState() {
    return super.agentState;
  }

  public get connectionState() {
    return super.connectionState
  }

  public set agentState(value: Gabber.AgentState) {
    super.agentState = value;
  }

  public set connectionState(value: Gabber.ConnectionState) {
    super.connectionState = value;
  }

  public disconnect() {
    super.disconnect();
  }
}

export type CreateParams = {
  elementID: string;
  settings?: ConversationalWidgetSettings;
  onConnectionRequested: () => Promise<Gabber.ConnectionDetails>;
  onAgentStateChanged?: (state: Gabber.AgentState) => void;
  onRemainingSecondsChanged?: (seconds: number | null) => void;
  onConnectionStateChanged?: (state: Gabber.ConnectionState) => void;
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