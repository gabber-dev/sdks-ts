import React from "react";
import { Voice } from "gabber-client-core";
import { useSettings } from "./SettingsProvider";

type Props = {
  voice: Voice;
  selected: boolean;
  onClick: () => void;
};
export function VoiceItem({ voice, selected, onClick }: Props) {
  const { settings } = useSettings();
  return (
    <button
      className="w-full p-2 text-left transition-colors"
      style={{
        backgroundColor: selected
          ? `${settings?.secondaryColor}20` || "#cccccc20"
          : "transparent",
        color: settings?.baseColorContent || "#000000",
        outline: selected
          ? `2px solid ${settings?.secondaryColor || "#cccccc"}`
          : "none",
        outlineOffset: "-2px",
      }}
      onClick={() => onClick()}
    >
      {voice.name}
    </button>
  );
}
