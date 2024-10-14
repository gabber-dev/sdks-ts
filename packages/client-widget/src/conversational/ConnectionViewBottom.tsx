import React, { useState, useEffect, useCallback } from "react";
import { useSettings } from "./SettingsProvider";
import { Gabber } from "gabber-client-core";
import { useToken } from "../providers/TokenProvider";

type Props = {
  onConnectPressed: (info: { prompt: string; voice: string }) => void;
  onSelectionChange: (persona: string | null, scenario: string | null) => void;
};

export function ConnectionViewBottom({ onConnectPressed, onSelectionChange }: Props) {
  const { settings } = useSettings();
  const { token } = useToken();
  const [personas, setPersonas] = useState<Gabber.Persona[]>([]);
  const [scenarios, setScenarios] = useState<Gabber.Scenario[]>([]);
  const [voices, setVoices] = useState<Gabber.Voice[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Gabber.Persona | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Gabber.Scenario | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<Gabber.Voice | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) {
      console.error("No token available");
      return;
    }

    try {
      const api = new Gabber.Api(token);
      
      const [fetchedPersonas, fetchedScenarios, fetchedVoices] = await Promise.all([
        api.getPersonas(),
        api.getScenarios(),
        api.getVoices()
      ]);

      setPersonas(fetchedPersonas.values);
      setScenarios(fetchedScenarios.values);
      setVoices(fetchedVoices.values);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    onSelectionChange(
      selectedPersona ? selectedPersona.name : null,
      selectedScenario ? selectedScenario.prompt : null
    );
  }, [selectedPersona, selectedScenario, onSelectionChange]);

  const generatePrompt = (persona: Gabber.Persona | null, scenario: Gabber.Scenario | null) => {
    if (!persona && !scenario) return "";
    let prompt = "";
    if (persona) prompt += `You are a ${persona.name}. `;
    if (scenario) prompt += `${scenario.prompt}`;
    return prompt.trim();
  };

  const handleConnect = () => {
    if (selectedPersona && selectedScenario && selectedVoice) {
      onConnectPressed({ prompt: generatePrompt(selectedPersona, selectedScenario), voice: selectedVoice.id });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex flex-col space-y-3 p-3 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col">
            <h3 className="text-base md:text-lg font-semibold mb-2" style={{ color: settings.primaryColor }}>Persona</h3>
            <select
              onChange={(e) => setSelectedPersona(personas.find(p => p.id === e.target.value) || null)}
              className="w-full p-2 md:p-3 rounded text-sm md:text-base flex-grow"
              style={{ backgroundColor: settings.baseColorPlusOne, color: settings.baseColorContent }}
            >
              <option value="">Select a persona</option>
              {personas.map(persona => (
                <option key={persona.id} value={persona.id}>{persona.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <h3 className="text-base md:text-lg font-semibold mb-2" style={{ color: settings.primaryColor }}>Scenario</h3>
            <select
              onChange={(e) => setSelectedScenario(scenarios.find(s => s.id === e.target.value) || null)}
              className="w-full p-2 md:p-3 rounded text-sm md:text-base flex-grow"
              style={{ backgroundColor: settings.baseColorPlusOne, color: settings.baseColorContent }}
            >
              <option value="">Select a scenario</option>
              {scenarios.map(scenario => (
                <option key={scenario.id} value={scenario.id}>{scenario.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <h3 className="text-base md:text-lg font-semibold mb-2" style={{ color: settings.primaryColor }}>Voice</h3>
            <select
              onChange={(e) => setSelectedVoice(voices.find(v => v.id === e.target.value) || null)}
              className="w-full p-2 md:p-3 rounded text-sm md:text-base flex-grow"
              style={{ backgroundColor: settings.baseColorPlusOne, color: settings.baseColorContent }}
            >
              <option value="">Select a voice</option>
              {voices.map(voice => (
                <option key={voice.id} value={voice.id}>{voice.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
