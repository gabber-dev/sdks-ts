import { Gabber } from "gabber-client-core";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePersona } from "./PersonaProvider";
import { useVoice } from "./VoiceProvider";
import { useScenario } from "./ScenarioProvider";
import { useToken } from "./TokenProvider";

type ConnectionOptsContextData = {
  connectionOpts: Gabber.ConnectOptions | null;
  prompt: string;
  setPrompt: (prompt: string) => void;
  dirty: boolean;
  connect: () => void;
  restart: () => void;
};

const ConnectionOptsContext = createContext<
  ConnectionOptsContextData | undefined
>(undefined);

type Props = {
  children: React.ReactNode;
};

export function ConnectionOptsProvider({ children }: Props) {
  const { token } = useToken();
  const { personas, selectedPersonaIdx } = usePersona();
  const { voices, selectedVoiceIdx } = useVoice();
  const { scenarios, selectedScenarioIdx } = useScenario();
  const [prompt, setPrompt] = useState("");
  const [dirty, setDirty] = useState<boolean>(true);
  const [connectionOpts, setConnectionOpts] =
    useState<Gabber.ConnectOptions | null>(null);
  const prevSelectedVoiceIdx = useRef(selectedVoiceIdx);

  const connect = useCallback(() => {
    if (!dirty || !token) {
      return;
    }
    setDirty(false);
    setConnectionOpts({
      token,
      sessionConnectOptions: {
        history: [{ role: "system", content: prompt }],
        voice_override: voices[selectedVoiceIdx]?.id,
      },
    });
  }, [dirty, prompt, token, voices, selectedVoiceIdx]);

  const restart = useCallback(() => {
    setConnectionOpts(null)
    connect()
  }, []);

  const persona = useMemo(() => {
    return personas[selectedPersonaIdx] || null;
  }, [personas, selectedPersonaIdx]);

  const scenario = useMemo(() => {
    return scenarios[selectedScenarioIdx] || null;
  }, [scenarios, selectedScenarioIdx]);

  useEffect(() => {
    if(!persona || !scenario) {
      return;
    }
    const newPrompt = `You are a ${persona.description}. ${scenario.prompt}`;
    setPrompt((prev) => {
      if (prev === newPrompt) {
        return prev;
      }
      setDirty(true);
      return newPrompt;
    });
  }, [
    persona,
    scenario,
  ]);

  useEffect(() => {
    if (prevSelectedVoiceIdx.current === selectedVoiceIdx) {
      return;
    }
    prevSelectedVoiceIdx.current = selectedVoiceIdx;
    setDirty(true);
  }, [selectedVoiceIdx]);

  const _setPrompt  = useCallback((prompt: string) => {
    setPrompt(prev => {
      if (prev === prompt) {
        return prev;
      }
      setDirty(true);
      return prompt;
    });
  }, []);

  return (
    <ConnectionOptsContext.Provider
      value={{ connectionOpts, dirty, connect, prompt, setPrompt: _setPrompt, restart }}
    >
      {children}
    </ConnectionOptsContext.Provider>
  );
}

export function useConnectionOpts() {
  const context = React.useContext(ConnectionOptsContext);
  if (!context) {
    throw "useConnectionOpts must be used within a ConnectionOptsProvider";
  }
  return context;
}
