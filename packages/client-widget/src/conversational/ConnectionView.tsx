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
  const [selectedPersonaIdx, setSelectedPersonaIdx] = useState(0)
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(0);
  const [selectedVoiceIdx, setSelectedVoiceIdx] = useState(0);
  const api = useRef<Gabber.Api | null>(null); 
  const apiProm = useRef<Promise<Gabber.Api> | null>(null);

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
  }, []);

  const getPersonas = useCallback(async () => {
    const api = await createApi();
    const personas = await api.getPersonas()
    setPersonas(personas.values);
  }, []);

  const getScenarios = useCallback(async () => {
    const api = await createApi();
    const scenarios = api.getScenarios()
    setScenarios((await scenarios).values);
  }, []);

  const getVoices = useCallback(async () => {
    const api = await createApi();
    const voices = await api.getVoices()
    setVoices(voices.values);
  }, []);


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
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <textarea
        value={prompt}
        onChange={(e) => {
          setPrompt(e.target.value);
        }}
      />
      <div className="flex gap-2">
        <div className="flex flex-col max-h-[200px] overflow-y-scroll">
          <div>Personas</div>
          {personas.map((p, idx) => {
            return (
              <button
                onClick={() => {
                  setSelectedPersonaIdx(idx);
                  const vIdx = voices.findIndex((v) => v.id === p.voice);
                  if (vIdx !== -1) {
                    setSelectedVoiceIdx(vIdx);
                  }
                }}
              >
                <Item label={p.name} selected={selectedPersonaIdx === idx} />
              </button>
            );
          })}
        </div>
        <div className="flex flex-col max-h-[200px] overflow-y-scroll">
          <div>Scenarios</div>
          {scenarios.map((p, idx) => {
            return (
              <button onClick={() => setSelectedScenarioIdx(idx)}>
                <Item label={p.name} selected={selectedScenarioIdx === idx} />
              </button>
            );
          })}
        </div>
        <div className="flex flex-col max-h-[200px] overflow-y-scroll">
          <div>Voices</div>
          {voices.map((p, idx) => {
            return (
              <button onClick={() => setSelectedVoiceIdx(idx)}>
                <Item label={p.name} selected={selectedVoiceIdx === idx} />
              </button>
            );
          })}
        </div>
      </div>
      <button
        onClick={() =>
          onConnectPressed({
            prompt: prompt,
            voice: voices[selectedVoiceIdx].id,
          })
        }
      >
        {settings?.connectText || "Connect"}
      </button>
    </div>
  );
} 

function Item({ label, selected }: { label: string; selected: boolean }) {
  return (
    <div className="flex justify-between">
      <div>{label}</div>
      {selected ? <div className="bg-black w-[12px] h-[12px]" /> : null}
    </div>
  );
}