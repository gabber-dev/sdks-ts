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
  const [selectedPersonaIdx, setSelectedPersonaIdx] = useState(0)
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(0);
  const [selectedVoiceIdx, setSelectedVoiceIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'personas' | 'scenarios' | 'voices'>('personas');
  const api = useRef<Gabber.Api | null>(null); 
  const apiProm = useRef<Promise<Gabber.Api> | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const createApi = useCallback(async () => {
    if (api.current) {
      return api.current;
    }

    if (apiProm.current) {
      return apiProm.current;
    }

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
    const personas = await api.getPersonas()
    setPersonas(personas.values);
  }, [createApi]);

  const getScenarios = useCallback(async () => {
    const api = await createApi();
    const scenarios = api.getScenarios()
    setScenarios((await scenarios).values);
  }, [createApi]);

  const getVoices = useCallback(async () => {
    const api = await createApi();
    const voices = await api.getVoices()
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

  useEffect(() => {
    console.log({ personas, scenarios, voices });
  }, [personas, scenarios, voices]);

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
    <div className="w-full h-full flex flex-col items-center justify-center p-4" style={{ backgroundColor: settings?.baseColor || '#ffffff' }}>
      <div className="w-full max-w-2xl">
        <textarea
          className="w-full mb-4 p-2 rounded-md border"
          style={{ 
            backgroundColor: settings?.baseColorPlusOne || '#f0f0f0',
            color: settings?.baseColorContent || '#000000',
            borderColor: settings?.primaryColor || '#000000'
          }}
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
          }}
        />
        <div className="md:hidden mb-4">
          <div className="flex border-b">
            {['personas', 'scenarios', 'voices'].map((tab) => (
              <button
                key={tab}
                className={`flex-1 py-2 px-4 tab-button ${activeTab === tab ? 'border-b-2' : ''}`}
                style={{
                  borderColor: activeTab === tab ? settings?.primaryColor : 'transparent',
                  color: activeTab === tab ? settings?.primaryColor : settings?.baseColorContent,
                }}
                onClick={() => setActiveTab(tab as typeof activeTab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="mt-4">
            {activeTab === 'personas' && (
              <SelectionColumn title="Personas" items={personas} selectedIdx={selectedPersonaIdx} onSelect={setSelectedPersonaIdx} />
            )}
            {activeTab === 'scenarios' && (
              <SelectionColumn title="Scenarios" items={scenarios} selectedIdx={selectedScenarioIdx} onSelect={setSelectedScenarioIdx} />
            )}
            {activeTab === 'voices' && (
              <SelectionColumn title="Voices" items={voices} selectedIdx={selectedVoiceIdx} onSelect={setSelectedVoiceIdx} />
            )}
          </div>
        </div>
        <div className="hidden md:flex md:flex-row gap-4 mb-4">
          <SelectionColumn title="Personas" items={personas} selectedIdx={selectedPersonaIdx} onSelect={setSelectedPersonaIdx} />
          <SelectionColumn title="Scenarios" items={scenarios} selectedIdx={selectedScenarioIdx} onSelect={setSelectedScenarioIdx} />
          <SelectionColumn title="Voices" items={voices} selectedIdx={selectedVoiceIdx} onSelect={setSelectedVoiceIdx} />
        </div>
        <button
          className="w-full px-4 py-2 rounded-md font-semibold connect-button"
          style={buttonStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() =>
            onConnectPressed({
              prompt: prompt,
              voice: voices[selectedVoiceIdx]?.id,
            })
          }
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
    <div className="flex flex-col w-full md:w-1/3">
      <div className="font-semibold mb-2 md:block hidden" style={{ color: settings?.primaryColorContent || '#ffffff' }}>{title}</div>
      <div 
        className="flex-grow overflow-y-auto rounded-md border"
        style={{ 
          backgroundColor: settings?.baseColorPlusTwo || '#e0e0e0',
          borderColor: settings?.primaryColor || '#000000',
          height: '200px'
        }}
      >
        {items.map((item, idx) => (
          <button
            key={item.id}
            className="w-full p-2 text-left transition-colors"
            style={{ 
              backgroundColor: selectedIdx === idx ? `${settings?.secondaryColor}20` || '#cccccc20' : 'transparent',
              color: settings?.baseColorContent || '#000000',
              outline: selectedIdx === idx ? `2px solid ${settings?.secondaryColor || '#cccccc'}` : 'none',
              outlineOffset: '-2px'
            }}
            onClick={() => onSelect(idx)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <style jsx>{`
        button:hover {
          background-color: ${settings?.secondaryColor}40 !important;
          color: ${settings?.baseColorContent || '#000000'} !important;
        }
      `}</style>
    </div>
  );
}
