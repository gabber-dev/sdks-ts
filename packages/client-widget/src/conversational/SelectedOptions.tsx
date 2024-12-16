import React from "react";
import { useSettings } from "./SettingsProvider";
import { usePersona } from "../providers/PersonaProvider";
import { useScenario } from "../providers/ScenarioProvider";
import { useVoice } from "../providers/VoiceProvider";

type Props = {
  isFreeform: boolean;
};

export function SelectedOptions({ isFreeform }: Props) {
  const { settings } = useSettings();
  const { personas, selectedPersonaIdx } = usePersona();
  const { scenarios, selectedScenarioIdx } = useScenario();
  const { voices, selectedVoiceIdx } = useVoice();

  const selectedPersona = isFreeform
    ? "Freeform"
    : personas[selectedPersonaIdx]?.name || "None";
  const selectedScenario = isFreeform
    ? "Freeform"
    : scenarios[selectedScenarioIdx]?.name || "None";
  const selectedVoice = voices[selectedVoiceIdx]?.name || "Default";

  return (
    <div
      className="text-xs p-2 rounded-md flex justify-between items-center"
      style={{ backgroundColor: settings.baseColorPlusTwo }}
    >
      <div className="flex space-x-4 overflow-hidden">
        <p className="whitespace-nowrap">
          Persona:{" "}
          <span
            className="overflow-hidden text-ellipsis max-w-[80px] sm:max-w-full inline-block align-bottom"
            style={{ color: settings.primaryColor }}
          >
            {selectedPersona}
          </span>
        </p>
        <p className="whitespace-nowrap">
          Scenario:{" "}
          <span
            className="overflow-hidden text-ellipsis max-w-[80px] sm:max-w-full inline-block align-bottom"
            style={{ color: settings.primaryColor }}
          >
            {selectedScenario}
          </span>
        </p>
        <p className="whitespace-nowrap">
          Voice:{" "}
          <span
            className="overflow-hidden text-ellipsis max-w-[80px] sm:max-w-full inline-block align-bottom"
            style={{ color: settings.primaryColor }}
          >
            {selectedVoice}
          </span>
        </p>
      </div>
    </div>
  );
}
