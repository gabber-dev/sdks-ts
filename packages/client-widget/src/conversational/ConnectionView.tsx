import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "./SettingsProvider";
import { Gabber } from "gabber-client-core";

type Props = {
  onConnectPressed: (info: ConnectionInfo) => Promise<void>;
  tokenGenerator: () => Promise<string>;
};

export type ConnectionInfo = {
  prompt: string;
  voice: string;
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
  const [activeTab, setActiveTab] = useState<'personas' | 'scenarios' | 'voices'>('personas');
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

  const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: settings?.primaryColor || 'rgb(255, 215, 0)',
    color: settings?.baseColor || '#ffffff',
    border: `2px solid ${settings?.primaryColor || 'rgb(255, 215, 0)'}`,
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box' as const,
  };

  const buttonHoverStyle = {
    backgroundColor: settings?.baseColor || '#ffffff',
    color: settings?.primaryColor || 'rgb(255, 215, 0)',
    border: `2px solid ${settings?.primaryColor || 'rgb(255, 215, 0)'}`,
  };

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
      <div className="selection-container">
        <div className="tab-buttons">
          {['personas', 'scenarios', 'voices'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className="tab-button"
              style={{
                backgroundColor: activeTab === tab ? settings?.primaryColor : 'transparent',
                color: activeTab === tab ? settings?.baseColor : settings?.primaryColor,
                border: `2px solid ${settings?.primaryColor}`,
                padding: '10px',
                cursor: 'pointer',
                flex: '1',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="selection-columns">
          <SelectionColumn 
            title="Personas" 
            items={personas} 
            selectedIdx={selectedPersonaIdx} 
            onSelect={setSelectedPersonaIdx}
            isActive={activeTab === 'personas'}
          />
          <SelectionColumn 
            title="Scenarios" 
            items={scenarios} 
            selectedIdx={selectedScenarioIdx} 
            onSelect={setSelectedScenarioIdx}
            isActive={activeTab === 'scenarios'}
          />
          <SelectionColumn 
            title="Voices" 
            items={voices} 
            selectedIdx={selectedVoiceIdx} 
            onSelect={setSelectedVoiceIdx}
            isActive={activeTab === 'voices'}
          />
        </div>
      </div>
      <button
        onClick={() => onConnectPressed({ prompt, voice: voices[selectedVoiceIdx]?.id })}
        style={buttonStyle}
        className="connect-button"
      >
        {settings?.connectText || "Connect"}
      </button>
      <style jsx>{`
        .selection-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .tab-buttons {
          display: none;
        }
        .selection-columns {
          display: flex;
          gap: 20px;
        }
        .connect-button:hover, .tab-button:hover {
          background-color: ${buttonHoverStyle.backgroundColor} !important;
          color: ${buttonHoverStyle.color} !important;
        }
        .connect-button, .tab-button {
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .tab-buttons {
            display: flex;
            justify-content: space-between;
            gap: 10px;
          }
          .selection-columns {
            flex-direction: column;
          }
          .selection-columns > div {
            display: none;
          }
          .selection-columns > div.active {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}

function SelectionColumn({ title, items, selectedIdx, onSelect, isActive }: { 
  title: string, 
  items: any[], 
  selectedIdx: number, 
  onSelect: (idx: number) => void,
  isActive: boolean
}) {
  const { settings } = useSettings();
  
  return (
    <div className={isActive ? 'active' : ''} style={{ flex: 1 }}>
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