import React from "react";
import { useSettings } from "./SettingsProvider";
import { useSession } from "gabber-client-react";

type Props = {
  onConnectPressed: () => Promise<void>;
};

export function ConnectionView({ onConnectPressed }: Props) {
  const { settings } = useSettings();

  return (
    <div className="w-full h-full flex items-center justify-center">
      <button onClick={onConnectPressed}>
        {settings?.connectText || "Connect"}
      </button>
    </div>
  );
} 