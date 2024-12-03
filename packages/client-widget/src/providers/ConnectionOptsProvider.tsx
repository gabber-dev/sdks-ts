import { ConnectOptions } from "gabber-client-core";
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
  connectionOpts: ConnectOptions | null;
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
    useState<ConnectOptions | null>(null);
  const prevSelectedVoiceIdx = useRef(selectedVoiceIdx);

  const connect = useCallback(() => {
    if (!dirty || !token) {
      return;
    }
    setDirty(false);

    const selectedPersona = personas[selectedPersonaIdx];
    const selectedScenario = scenarios[selectedScenarioIdx];
    const selectedVoice = voices[selectedVoiceIdx];

    if (!selectedPersona || !selectedScenario || !selectedVoice) {
      return;
    }

    setConnectionOpts({
      token,
      sessionConnectOptions: {
        persona: selectedPersona.id,
        scenario: selectedScenario.id,
        voice_override: selectedVoice.id,
      },
    });
  }, [
    dirty,
    token,
    personas,
    selectedPersonaIdx,
    scenarios,
    selectedScenarioIdx,
    voices,
    selectedVoiceIdx,
  ]);

  const restart = useCallback(() => {
    setConnectionOpts(null);
    connect();
  }, [connect]);

  useEffect(() => {
    if (prevSelectedVoiceIdx.current === selectedVoiceIdx) {
      return;
    }
    prevSelectedVoiceIdx.current = selectedVoiceIdx;
    setDirty(true);
  }, [selectedVoiceIdx]);

  useEffect(() => {
    setDirty(true);
  }, [selectedPersonaIdx, selectedScenarioIdx]);

  return (
    <ConnectionOptsContext.Provider
      value={{ connectionOpts, dirty, connect, prompt, setPrompt, restart }}
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
