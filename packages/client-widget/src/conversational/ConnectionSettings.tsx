import React, { useState, useEffect, useMemo } from "react";
import { useSettings } from "./SettingsProvider";
import { useVoice } from "../providers/VoiceProvider";
import { usePersona } from "../providers/PersonaProvider";
import { useScenario } from "../providers/ScenarioProvider";
import { Voice } from "../../node_modules/gabber-client-core/src/generated/model/voice";

export function ConnectionSettings() {
  const { settings } = useSettings();
  const { voices, selectedVoiceIdx, setSelectedVoiceIdx } = useVoice();
  const { personas, selectedPersonaIdx, setSelectedPersonaIdx } = usePersona();
  const { scenarios, selectedScenarioIdx, setSelectedScenarioIdx } =
    useScenario();
  const [isFreeform, setIsFreeform] = useState(false);

  // Separate and sort voices
  const { customVoices, standardVoices } = useMemo(() => {
    // Create a Map to track unique voices by ID
    const uniqueVoices = new Map();
    
    // First pass - add all voices to the Map, preferring custom voices
    voices.forEach(voice => {
      const existingVoice = uniqueVoices.get(voice.id);
      // Only add if not exists, or if this is a custom voice replacing a standard one
      if (!existingVoice || (!existingVoice.project && voice.project)) {
        uniqueVoices.set(voice.id, voice);
      }
    });

    // Separate into custom and standard voices
    const custom: Voice[] = [];
    const standard: Voice[] = [];
    
    uniqueVoices.forEach(voice => {
      if (voice.project != null) {
        custom.push(voice);
      } else {
        standard.push(voice);
      }
    });

    // Sort both arrays
    custom.sort((a, b) => a.name.localeCompare(b.name));
    standard.sort((a, b) => a.name.localeCompare(b.name));
    
    return { customVoices: custom, standardVoices: standard };
  }, [voices]);

  // Create sorted versions of other arrays
  const sortedPersonas = useMemo(() => {
    return [...personas].sort((a, b) => a.name.localeCompare(b.name));
  }, [personas]);

  const sortedScenarios = useMemo(() => {
    return [...scenarios].sort((a, b) => a.name.localeCompare(b.name));
  }, [scenarios]);

  // Map original indices
  const personaIndexMap = useMemo(() => {
    const map: Record<number, number> = {};
    sortedPersonas.forEach((persona, sortedIdx) => {
      const originalIdx = personas.findIndex(p => p.id === persona.id);
      map[sortedIdx] = originalIdx;
    });
    return map;
  }, [personas, sortedPersonas]);

  const scenarioIndexMap = useMemo(() => {
    const map: Record<number, number> = {};
    sortedScenarios.forEach((scenario, sortedIdx) => {
      const originalIdx = scenarios.findIndex(s => s.id === scenario.id);
      map[sortedIdx] = originalIdx;
    });
    return map;
  }, [scenarios, sortedScenarios]);

  const voiceIndexMap = useMemo(() => {
    const map: Record<number, number> = {};
    const sortedVoices = [...customVoices, ...standardVoices];
    sortedVoices.forEach((voice, sortedIdx) => {
      const originalIdx = voices.findIndex(v => v.id === voice.id);
      map[sortedIdx] = originalIdx;
    });
    return map;
  }, [voices, customVoices, standardVoices]);

  useEffect(() => {
    if (settings.initialPersona) {
      const index = personas.findIndex((p) => p.id === settings.initialPersona);
      if (index !== -1) {
        setSelectedPersonaIdx(index);
      }
    }
  }, [personas, settings.initialPersona, setSelectedPersonaIdx]);

  useEffect(() => {
    if (settings.initialScenario) {
      const index = scenarios.findIndex(
        (s) => s.id === settings.initialScenario,
      );
      if (index !== -1) {
        setSelectedScenarioIdx(index);
      }
    }
  }, [scenarios, settings.initialScenario, setSelectedScenarioIdx]);

  useEffect(() => {
    if (settings.initialVoice) {
      const index = voices.findIndex((v) => v.id === settings.initialVoice);
      if (index !== -1) {
        setSelectedVoiceIdx(index);
      }
    }
  }, [voices, settings.initialVoice, setSelectedVoiceIdx]);

  const handlePersonaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortedIdx = Number(e.target.value);
    setSelectedPersonaIdx(personaIndexMap[sortedIdx]);
    setIsFreeform(false);
  };

  const handleScenarioSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortedIdx = Number(e.target.value);
    setSelectedScenarioIdx(scenarioIndexMap[sortedIdx]);
    setIsFreeform(false);
  };

  const handleVoiceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortedIdx = Number(e.target.value);
    setSelectedVoiceIdx(voiceIndexMap[sortedIdx]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="w-full flex flex-col mb-4">
        <div className="text-xl" style={{ color: settings.baseColorContent }}>
          Choose a scenario/persona:
        </div>
      </div>
      <div className="flex flex-col">
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: settings.primaryColor }}
          >
            Persona
          </label>
          <select
            value={isFreeform ? "freeform" : personaIndexMap[selectedPersonaIdx]}
            onChange={handlePersonaSelect}
            className="w-full p-2 border border-gray-300 rounded"
            style={{
              backgroundColor: settings.baseColorPlusOne,
              color: settings.primaryColor,
            }}
          >
            {sortedPersonas.map((persona, idx) => (
              <option key={persona.id} value={idx}>
                {persona.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: settings.primaryColor }}
          >
            Scenario
          </label>
          <select
            value={isFreeform ? "freeform" : scenarioIndexMap[selectedScenarioIdx]}
            onChange={handleScenarioSelect}
            className="w-full p-2 border border-gray-300 rounded"
            style={{
              backgroundColor: settings.baseColorPlusOne,
              color: settings.primaryColor,
            }}
          >
            {sortedScenarios.map((scenario, idx) => (
              <option key={scenario.id} value={idx}>
                {scenario.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: settings.primaryColor }}
          >
            Voice
          </label>
          <select
            value={voiceIndexMap[selectedVoiceIdx]}
            onChange={handleVoiceSelect}
            className="w-full p-2 border border-gray-300 rounded"
            style={{
              backgroundColor: settings.baseColorPlusOne,
              color: settings.primaryColor,
            }}
          >
            {customVoices.length > 0 && (
              <optgroup label="Custom Voices">
                {customVoices.map((voice, idx) => (
                  <option key={voice.id} value={idx}>
                    {voice.name}
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label="Standard Voices">
              {standardVoices.map((voice, idx) => (
                <option key={voice.id} value={idx + customVoices.length}>
                  {voice.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>
    </div>
  );
}
