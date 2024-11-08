import React, { useState, useEffect } from "react";
import { useSettings } from "./SettingsProvider";
import { useVoice } from "../providers/VoiceProvider";
import { usePersona } from "../providers/PersonaProvider";
import { useScenario } from "../providers/ScenarioProvider";
import { useConnectionOpts } from "../providers/ConnectionOptsProvider";

type Props = {};

export function ConnectionSettings({}: Props) {
  const { settings } = useSettings();
  const { voices, selectedVoiceIdx, setSelectedVoiceIdx } = useVoice();
  const { personas, selectedPersonaIdx, setSelectedPersonaIdx } = usePersona();
  const { scenarios, selectedScenarioIdx, setSelectedScenarioIdx } = useScenario();
  const { prompt, setPrompt } = useConnectionOpts();
  const [isFreeform, setIsFreeform] = useState(false);

  useEffect(() => {
    if (settings.initialPersona) {
      const index = personas.findIndex(p => p.id === settings.initialPersona);
      if (index !== -1) {
        setSelectedPersonaIdx(index);
      }
    }
  }, [personas, settings.initialPersona, setSelectedPersonaIdx]);

  useEffect(() => {
    if (settings.initialScenario) {
      const index = scenarios.findIndex(s => s.id === settings.initialScenario);
      if (index !== -1) {
        setSelectedScenarioIdx(index);
      }
    }
  }, [scenarios, settings.initialScenario, setSelectedScenarioIdx]);

  useEffect(() => {
    if (settings.initialVoice) {
      const index = voices.findIndex(v => v.id === settings.initialVoice);
      if (index !== -1) {
        setSelectedVoiceIdx(index);
      }
    }
  }, [voices, settings.initialVoice, setSelectedVoiceIdx]);

  const handlePersonaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    setSelectedPersonaIdx(idx);
    setIsFreeform(false);
  };

  const handleScenarioSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    setSelectedScenarioIdx(idx);
    setIsFreeform(false);
  };

  // const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  //   setPrompt(e.target.value);
  //   setIsFreeform(true);
  // };

  return (
    <div className="flex flex-col h-full">
      <div className="h-[100px] w-full flex flex-col mb-4">
        <div
          className="text-xs italic mb-1"
          style={{ color: settings.baseColorContent }}
        >
          Choose a scenario/persona to change the prompt or write your own:
        </div>
        <div
          className="w-full p-1 select-none min-h-[100px]"
          style={{
            backgroundColor: settings.baseColorPlusTwo,
            border: `1px solid ${settings.baseColorContent}`,
            color: settings.baseColorContent,
          }}
        >{prompt}</div>
      </div>
      <div className="flex flex-col space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: settings.primaryColor }}>
            Persona
          </label>
          <select
            value={isFreeform ? "freeform" : selectedPersonaIdx}
            onChange={handlePersonaSelect}
            className="w-full p-2 border border-gray-300 rounded"
            style={{ backgroundColor: settings.baseColorPlusOne, color: settings.primaryColor }}
          >
            {/* <option value="freeform" disabled={!isFreeform}>Freeform</option> */}
            {personas.map((persona, idx) => (
              <option key={persona.id} value={idx}>
                {persona.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: settings.primaryColor }}>
            Scenario
          </label>
          <select
            value={isFreeform ? "freeform" : selectedScenarioIdx}
            onChange={handleScenarioSelect}
            className="w-full p-2 border border-gray-300 rounded"
            style={{ backgroundColor: settings.baseColorPlusOne, color: settings.primaryColor }}
          >
            {/* <option value="freeform" disabled={!isFreeform}>Freeform</option> */}
            {scenarios.map((scenario, idx) => (
              <option key={scenario.id} value={idx}>
                {scenario.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: settings.primaryColor }}>
            Voice
          </label>
          <select
            value={selectedVoiceIdx}
            onChange={(e) => setSelectedVoiceIdx(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
            style={{ backgroundColor: settings.baseColorPlusOne, color: settings.primaryColor }}
          >
            {voices.map((voice, idx) => (
              <option key={voice.id} value={idx}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
