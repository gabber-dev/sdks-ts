import React from 'react'
import { createRoot } from 'react-dom/client';
import './index.css';

export class Widget {
  static attach(elementId: string) {
    const el = document.getElementById(elementId);
    if(!el) {
      console.error("Can't find the element with id", elementId)
      return
    }
    const root = createRoot(el);
    root.render(
      <React.StrictMode>
        <div className='text-red-400'>Hello</div>
      </React.StrictMode>
    );
  }
}