import React from "react";
import { Input } from "./Input";
import { useSettings } from "./SettingsProvider";
import { AgentVisualizer } from "./AgentVisualizer";
import { useSession } from "gabber-client-react";

export function MainView() {
  const { settings } = useSettings();
  const { connectionState } = useSession();


  return (
    <div
      className="relative w-full h-full"
      style={{
        backgroundColor: settings.baseColor,
      }}
    >
      <div className="absolute left-0 right-0 bottom-0 top-0">
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {connectionState === "connected" && (
            <div className="w-1/2 aspect-square">
              <AgentVisualizer
                gap={12}
                shadowColor={settings.baseColorContent || "#ff0000"}
                color={settings.secondaryColor || "#ff0000"}
              />
            </div>
          )}
          <div
            style={{
              background: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 60%, ${settings.baseColor} 80%)`,
            }}
            className={`absolute top-0 left-0 right-0 bottom-0 z-10`}
          />
        </div>
      </div>
      <div className="absolute left-0 right-0 bottom-0 h-[120px] m-2 z-10">
        <Input heightPixels={120} />
      </div>
    </div>
  );
}