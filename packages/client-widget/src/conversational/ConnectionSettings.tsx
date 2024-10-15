import React, { useState, useEffect } from "react";
import { useSettings } from "./SettingsProvider";
import { useVoice } from "../providers/VoiceProvider";
import { usePersona } from "../providers/PersonaProvider";
import { useScenario } from "../providers/ScenarioProvider";
import { Selector } from "./Selector";
import { useConnectionOpts } from "../providers/ConnectionOptsProvider";

type Props = {};

export function ConnectionSettings({}: Props) {
  const { settings } = useSettings();
  const { voices, selectedVoiceIdx, setSelectedVoiceIdx } = useVoice();
  const { personas, selectedPersonaIdx, setSelectedPersonaIdx } = usePersona();
  const { scenarios, selectedScenarioIdx, setSelectedScenarioIdx } =
    useScenario();
  const [tab, setTab] = useState<"persona" | "scenario" | "voice">("persona");
  const { prompt, setPrompt } = useConnectionOpts();

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

  return (
    <div className="flex flex-col h-full">
      <div className="h-[100px] w-full flex flex-col">
        <div
          className="text-xs italic"
          style={{ color: settings.baseColorContent }}
        >
          Choose a scenario/persona to change the prompt or write your own:
        </div>
        <textarea
          className="w-full p-1 select-none"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
          }}
          style={{
            backgroundColor: settings.baseColorPlusTwo,
            border: `1px solid ${settings.baseColorContent}`,
            color: settings.baseColorContent,
          }}
        />
      </div>
      <div className="flex w-full h-[50px]">
        <button
          className="grow"
          onClick={() => {
            setTab("persona");
          }}
          style={{
            color: settings.primaryColor,
            backgroundColor:
              tab === "persona"
                ? settings.baseColorPlusOne
                : settings.baseColor,
          }}
        >
          Persona
        </button>
        <button
          className="grow"
          onClick={() => {
            setTab("scenario");
          }}
          style={{
            color: settings.primaryColor,
            backgroundColor:
              tab === "scenario"
                ? settings.baseColorPlusOne
                : settings.baseColor,
          }}
        >
          Scenario
        </button>
        <button
          className="grow"
          onClick={() => {
            setTab("voice");
          }}
          style={{
            color: settings.primaryColor,
            backgroundColor:
              tab === "voice" ? settings.baseColorPlusOne : settings.baseColor,
          }}
        >
          Voice
        </button>
      </div>
      <div className="grow relative w-full">
        <div
          className={`absolute top-0 bottom-0 left-0 right-0 ${
            tab === "persona" ? "" : "hidden"
          }`}
        >
          <Selector
            name={(item) => {
              return item.name || "";
            }}
            items={personas}
            setSelectedItemIdx={setSelectedPersonaIdx}
            selectedItemIdx={selectedPersonaIdx}
          />
        </div>
        <div
          className={`absolute top-0 bottom-0 left-0 right-0 ${
            tab === "scenario" ? "" : "hidden"
          }`}
        >
          <Selector
            name={(item) => {
              return item.name || "";
            }}
            items={scenarios}
            setSelectedItemIdx={setSelectedScenarioIdx}
            selectedItemIdx={selectedScenarioIdx}
          />
        </div>
        <div
          className={`absolute top-0 bottom-0 left-0 right-0 ${
            tab === "voice" ? "" : "hidden"
          }`}
        >
          <Selector
            name={(item) => {
              return item.name || "";
            }}
            items={voices}
            setSelectedItemIdx={setSelectedVoiceIdx}
            selectedItemIdx={selectedVoiceIdx}
          />
        </div>
      </div>
    </div>
  );
}
