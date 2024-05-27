import React from 'react'
import { createRoot } from 'react-dom/client';
import './index.css';
import { Root } from './components/Root';

export class Widget {
  private connectHandler: ((p: ConnectParams) => void) | null = null;

  static create({ elementID }: CreateParams) {
    const w = new Widget();
    const el = document.getElementById(elementID);
    if (!el) {
      console.error("Can't find the element with id", elementID);
      return;
    }
    const root = createRoot(el);
    root.render(
      <React.StrictMode>
        <Root widget={w} />
      </React.StrictMode>
    );
    return w;
  }

  registerConnectHandler(h: (p: ConnectParams) => void) {
    this.connectHandler = h;
  }

  unregisterConnectHandler(h: (p: ConnectParams) => void) {
    if (this.connectHandler === h) {
      this.connectHandler = null;
    }
  }

  connect(p: ConnectParams) {
    // Hack to let the connect handler register
    // from the react component
    setTimeout(() => {
      if (this.connectHandler) {
        this.connectHandler(p);
      }
    }, 10);
  }
}

export type ConnectParams = { url: string; token: string };
export type CreateParams = { elementID: string };