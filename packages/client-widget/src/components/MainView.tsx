import React from "react";
import { MicrophoneToggle } from "./MicrophoneToggle";
import { ChatInput } from "./ChatInput";
import { ContentView } from "./ContentView";

export function MainView() {
    return (
      <div className="w-full h-full flex flex-col bg-red-400">
        <div className="grow bg-blue-400">
          <ContentView />
        </div>
        <div className="h-[50px] bg-green-400">
          <div className="flex h-full w-full">
            <div className="h-full aspect-square">
              <MicrophoneToggle />
            </div>
            <div className="h-full grow">
              <ChatInput />
            </div>
          </div>
        </div>
      </div>
    );
}