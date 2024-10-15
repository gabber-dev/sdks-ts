import React from "react";
import { useSettings } from "./SettingsProvider";
import { usePersona } from "../providers/PersonaProvider";
import { useScenario } from "../providers/ScenarioProvider";
import { useVoice } from "../providers/VoiceProvider";

type Props = {
  isFreeform: boolean;
};

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

function truncateText(text: string, maxLength: number) {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

export function SelectedOptions({ isFreeform }: Props) {
  const { settings } = useSettings();
  const { personas, selectedPersonaIdx } = usePersona();
  const { scenarios, selectedScenarioIdx } = useScenario();
  const { voices, selectedVoiceIdx } = useVoice();
  const isMobile = useIsMobile();

  const selectedPersona = isFreeform ? "Freeform" : personas[selectedPersonaIdx]?.name || "None";
  const selectedScenario = isFreeform ? "Freeform" : scenarios[selectedScenarioIdx]?.name || "None";
  const selectedVoice = voices[selectedVoiceIdx]?.name || "Default";

  const maxLength = isMobile ? 10 : Infinity;

  return (
    <div
      className="text-xs p-2 rounded-md flex justify-between items-center"
      style={{ backgroundColor: settings.baseColorPlusTwo }}
    >
      <div className="flex space-x-4 overflow-hidden">
        <p className="whitespace-nowrap">
          Persona: <span className="overflow-hidden text-ellipsis" style={{ color: settings.primaryColor }}>{truncateText(selectedPersona, maxLength)}</span>
        </p>
        <p className="whitespace-nowrap">
          Scenario: <span className="overflow-hidden text-ellipsis" style={{ color: settings.primaryColor }}>{truncateText(selectedScenario, maxLength)}</span>
        </p>
        <p className="whitespace-nowrap">
          Voice: <span className="overflow-hidden text-ellipsis" style={{ color: settings.primaryColor }}>{truncateText(selectedVoice, maxLength)}</span>
        </p>
      </div>
    </div>
  );
}
