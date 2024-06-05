import { useSession } from "gabber-client-react";
import React from "react";
import { useSettings } from "./SettingsProvider";
import { AgentVisualizer } from "./AgentVisualizer";

export function ContentView() {
  const { inProgressState } = useSession();
  const { settings } = useSettings();

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="absolute top-[8px] right-[8px] h-[50px] w-[100px] z-[20]">
        {inProgressState === "not_connected" ? null : (
          <div className="relative rounded-md w-full h-full">
            <div
              className="absolute top-0 bottom-0 rounded-md left-0 right-0"
              style={{
                backgroundColor: settings.baseColorPlusOne,
                opacity: "40%",
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: settings.baseColor || "",
              }}
            />
            <div className="absolute top-0 right-0 bottom-0 left-0 p-2">
              <AgentVisualizer
                gap={1}
                color={settings.secondaryColor || "#ff0000"}
              />
            </div>
          </div>
        )}
      </div>
      <div className="absolute top-0 left-0 right-0 bottom-[20%] bg-transparent overlow-hidden z-5">
        {settings.personaImage && (
          <img
            className="w-full h-full object-cover"
            src={settings.personaImage}
          />
        )}
      </div>
      <div
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 60%, ${settings.baseColor} 80%)`,
        }}
        className={`absolute top-0 left-0 right-0 bottom-0 z-10`}
      />
      <div className="absolute top-0 left-0 right-0 bottom-0">
        {inProgressState}
      </div>
    </div>
  );
}
