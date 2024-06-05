import React from "react";
import { ContentView } from "./ContentView";
import { Input } from "./Input";

export function MainView() {
  return (
    <div className="relative w-full h-full bg-red-400">
      <div className="absolute left-0 right-0 bottom-0 top-0">
        <ContentView />
      </div>
      <div className="absolute left-0 right-0 bottom-0 h-[120px] m-2 z-10">
        <Input heightPixels={120} />
      </div>
    </div>
  );
}