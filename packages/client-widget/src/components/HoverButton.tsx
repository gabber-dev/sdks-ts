import { useState } from "react";
import { useSettings } from "./SettingsProvider";
import React from "react";

export function HoverButton({
  onClick,
  text,
}: {
  onClick: () => void;
  text: string;
}) {
  const [connectHovered, setConnectHovered] = useState(false);
  const { settings } = useSettings();

  return (
    <div className="h-full w-full flex items-center justify-center">
      <button
        onMouseEnter={() => {
          setConnectHovered(true);
        }}
        onMouseLeave={() => {
          setConnectHovered(false);
        }}
        onClick={onClick}
        className="w-1/3 h-1/2 rounded-lg"
        style={{
          backgroundColor: connectHovered
            ? settings.baseColorPlusOne
            : settings.baseColor,
          color: settings.baseColorContent,
          borderColor: settings.primaryColor,
          borderWidth: "2px",
          borderStyle: "solid",
          boxShadow: `0px 0px 20px 1px ${settings.primaryColor}`,
        }}
      >
        {text}
      </button>
    </div>
  );
}