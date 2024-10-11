import React, { useCallback, useEffect, useRef, useState } from "react";
import { Gabber } from "gabber-client-core";
import { useSettings } from "../conversational/SettingsProvider";

type Props = {
  onConnectPressed: (info: { prompt: string; voice: string }) => void;
  tokenGenerator: () => Promise<string>;
};

export function ConnectionView({ onConnectPressed, tokenGenerator }: Props) {
  const { settings } = useSettings();
  const [prompt, setPrompt] = useState<string>("loading...");
  const [personas, setPersonas] = useState<Gabber.Persona[]>([]);
  const [scenarios, setScenarios] = useState<Gabber.Scenario[]>([]);
  const [voices, setVoices] = useState<Gabber.Voice[]>([]);
  const [selectedPersonaIdx, setSelectedPersonaIdx] = useState(0);
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(0);
  const [selectedVoiceIdx, setSelectedVoiceIdx] = useState(0);
  const api = useRef<Gabber.Api | null>(null);
  const apiProm = useRef<Promise<Gabber.Api> | null>(null);

  const createApi = useCallback(async () => {
    if (api.current) return api.current;
    if (apiProm.current) return apiProm.current;

    const prom = new Promise<Gabber.Api>(async (resolve, reject) => {
      try {
        const token = await tokenGenerator();
        api.current = new Gabber.Api(token);
        resolve(api.current);
      } catch (e) {
        reject(e);
      }
    });
    apiProm.current = prom;
    return prom;
  }, [tokenGenerator]);

  const getPersonas = useCallback(async () => {
    const api = await createApi();
    const personas = await api.getPersonas();
    setPersonas(personas.values);
  }, [createApi]);

  const getScenarios = useCallback(async () => {
    const api = await createApi();
    const scenarios = await api.getScenarios();
    setScenarios(scenarios.values);
  }, [createApi]);

  const getVoices = useCallback(async () => {
    const api = await createApi();
    const voices = await api.getVoices();
    setVoices(voices.values);
  }, [createApi]);

  useEffect(() => {
    const p = `You are a ${personas[selectedPersonaIdx]?.name}. ${scenarios[selectedScenarioIdx]?.name}.`;
    setPrompt(p);
  }, [personas, scenarios, selectedPersonaIdx, selectedScenarioIdx]);

  useEffect(() => {
    getPersonas();
    getScenarios();
    getVoices();
  }, [getPersonas, getScenarios, getVoices]);

  return (
    <div style={{ backgroundColor: settings?.baseColor || '#ffffff', padding: '20px' }}>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '20px',
          backgroundColor: settings?.baseColorPlusOne || '#f0f0f0',
          color: settings?.baseColorContent || '#000000',
          border: `1px solid ${settings?.primaryColor || '#000000'}`,
        }}
      />
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <SelectionColumn title="Personas" items={personas} selectedIdx={selectedPersonaIdx} onSelect={setSelectedPersonaIdx} />
        <SelectionColumn title="Scenarios" items={scenarios} selectedIdx={selectedScenarioIdx} onSelect={setSelectedScenarioIdx} />
        <SelectionColumn title="Voices" items={voices} selectedIdx={selectedVoiceIdx} onSelect={setSelectedVoiceIdx} />
      </div>
      <button
        onClick={() => onConnectPressed({ prompt, voice: voices[selectedVoiceIdx]?.id })}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: settings?.primaryColor || 'rgb(255, 215, 0)',
          color: settings?.baseColor || '#ffffff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {settings?.connectText || "Connect"}
      </button>
    </div>
  );
}

function SelectionColumn({ title, items, selectedIdx, onSelect }: { 
  title: string, 
  items: any[], 
  selectedIdx: number, 
  onSelect: (idx: number) => void 
}) {
  const { settings } = useSettings();
  
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px', color: settings?.primaryColorContent || '#000000' }}>{title}</div>
      <div style={{ 
        height: '200px', 
        overflowY: 'auto', 
        backgroundColor: settings?.baseColorPlusTwo || '#e0e0e0',
        border: `1px solid ${settings?.primaryColor || '#000000'}`,
      }}>
        {items.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => onSelect(idx)}
            style={{
              padding: '5px',
              backgroundColor: selectedIdx === idx ? settings?.secondaryColor || '#cccccc' : 'transparent',
              color: settings?.baseColorContent || '#000000',
              cursor: 'pointer',
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}