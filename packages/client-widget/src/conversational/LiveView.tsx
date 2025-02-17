import React, { useState, useEffect } from "react";
import { useSettings } from "./SettingsProvider";
import { useRealtimeSessionEngine } from "gabber-client-react";
import { useUsage } from "../providers/UsageProvider";
import { BottomBar } from "./BottomBar";
import { Messages } from "./Messages";
import { ConnectionSettings } from "./ConnectionSettings";
import { AgentVisualizer } from "./AgentVisualizer";
import { useConnectionOpts } from "../providers/ConnectionOptsProvider";
import { toast } from "react-toastify";

export function LiveView() {
  const { settings } = useSettings();
  const { connectionState, lastError } = useRealtimeSessionEngine();
  const { checkUsage } = useUsage();
  const [activeTab, setActiveTab] = useState<"messages" | "connection">(
    "connection",
  );
  const { dirty, restart } = useConnectionOpts();

  useEffect(() => {
    console.log("New Error", lastError);
    if (lastError) {
      toast.error(lastError.message);
    }
  }, [lastError]);

  useEffect(() => {
    if (connectionState !== "connected") {
      checkUsage("conversational_seconds");
    }
  }, [checkUsage, connectionState]);

  return (
    <div
      className="mx-auto h-full w-full flex flex-col overflow-hidden p-2 gap-2"
      style={{
        backgroundColor: settings.baseColor || "#000000",
        color: settings.baseColorContent || "#ffffff",
        borderColor: settings.primaryColor,
      }}
    >
      <div className="flex-grow flex flex-col overflow-hidden">
        {dirty && connectionState === "connected" && (
          <div className="flex justify-center items-center w-full h-[0px]">
            <div className="relative w-1/3">
              <div
                className="absolute rounded-md top-0 left-0 right-0 flex flex-col items-center p-2"
                style={{
                  backgroundColor: settings.primaryColor,
                  color: settings.primaryColorContent,
                }}
              >
                <div>Configuration has changed</div>
                <button
                  className="rounded-full p-2 w-4/5"
                  style={{
                    backgroundColor: settings.baseColorPlusOne,
                    color: settings.baseColorContent,
                  }}
                  onClick={restart}
                >
                  Tap to restart
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="w-full flex-shrink-0">
          <h3
            className="text-lg md:text-2xl font-semibold mb-2 md:mb-4"
            style={{ color: settings.primaryColor }}
          >
            {settings.liveTitleText || "Chat"}
          </h3>
          <div className="flex flex-col items-center mb-2">
            {connectionState === "connected" ? (
              <div className="w-1/2 md:w-1/3 h-[80px]">
                <AgentVisualizer
                  gap={2}
                  color={settings.secondaryColor || "#ff00ff"}
                  shadowColor={settings.primaryColor || "#ffffff"}
                />
              </div>
            ) : (
              <div
                className="h-[80px] w-1/2 md:w-1/3 flex items-center justify-center rounded-md border-2"
                style={{
                  color: settings.primaryColor,
                  borderColor: settings.baseColorPlusTwo,
                  backgroundColor: `${settings.baseColorPlusOne}80`,
                }}
              >
                <span className="font-semibold">Not Connected</span>
              </div>
            )}
          </div>
        </div>
        <div className="w-full flex mb-2 flex-shrink-0">
          <button
            className={`flex-1 py-1 px-2 text-sm ${
              activeTab === "connection" ? "border-b-2" : ""
            }`}
            style={{
              borderColor:
                activeTab === "connection"
                  ? settings.primaryColor
                  : "transparent",
              color:
                activeTab === "connection"
                  ? settings.primaryColor
                  : settings.baseColorContent,
            }}
            onClick={() => setActiveTab("connection")}
          >
            Configuration
          </button>
          <button
            className={`flex-1 py-1 px-2 text-sm ${
              activeTab === "messages" ? "border-b-2" : ""
            }`}
            style={{
              borderColor:
                activeTab === "messages"
                  ? settings.primaryColor
                  : "transparent",
              color:
                activeTab === "messages"
                  ? settings.primaryColor
                  : settings.baseColorContent,
            }}
            onClick={() => setActiveTab("messages")}
          >
            Messages
          </button>
        </div>
        <div className="flex-grow overflow-hidden">
          <div
            className={`h-full ${activeTab === "connection" ? "block" : "hidden"}`}
          >
            <div className="h-full overflow-y-auto">
              <ConnectionSettings />
            </div>
          </div>
          <div
            className={`h-full ${activeTab === "messages" ? "block" : "hidden"}`}
          >
            <Messages />
          </div>
        </div>
      </div>
      <div className="w-full h-[50px] flex-shrink-0">
        <BottomBar />
      </div>
    </div>
  );
}
