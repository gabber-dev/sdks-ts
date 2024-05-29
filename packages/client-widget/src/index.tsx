import React from 'react'
import { createRoot } from 'react-dom/client';
import './index.css';
import { Root } from './components/Root';
import { Gabber } from 'gabber-client-core';

export class Widget {
  private connectHandler: (() => void) | null = null;

  static create({ elementID, session, persona, scenario, connectionDetails }: CreateParams) {
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
          widget={w}
          connectionDetails={connectionDetails}
          session={session}
          persona={persona}
          scenario={scenario}
        />
      </React.StrictMode>
    );
    return w;
  }

  registerConnectHandler(h: () => void) {
    this.connectHandler = h;
  }

  unregisterConnectHandler(h: () => void) {
    if (this.connectHandler === h) {
      this.connectHandler = null;
    }
  }

  connect() {
    // Hack to let the connect handler register
    // from the react component
    setTimeout(() => {
      if (this.connectHandler) {
        this.connectHandler();
      }
    }, 10);
  }
}

export type CreateParams = { elementID: string } & Pick<
  Gabber.SessionEngineParams,
  "session" | "persona" | "scenario" | "connectionDetails"
>;