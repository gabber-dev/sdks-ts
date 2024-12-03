import { ConnectOptions } from "gabber-client-core";
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePersona } from "./PersonaProvider";
import { useVoice } from "./VoiceProvider";
import { useScenario } from "./ScenarioProvider";
import { useToken } from "./TokenProvider";

type ConnectionOptsContextData = {
  connectionOpts: ConnectOptions | null;
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
  const [dirty, setDirty] = useState<boolean>(true);
  const [connectionOpts, setConnectionOpts] =
    useState<ConnectOptions | null>(null);

  const connect = useCallback(() => {
    if (!dirty || !token) {
      return;
    }

    const selectedPersona = personas[selectedPersonaIdx];
    const selectedScenario = scenarios[selectedScenarioIdx];
    const selectedVoice = voices[selectedVoiceIdx];

    if (!selectedPersona || !selectedScenario || !selectedVoice) {
      return;
    }

    setDirty(false);
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
    setDirty(true);
    // We need to wait for the next tick to ensure connectionOpts is null
    // before attempting to connect again
    setTimeout(() => {
      connect();
    }, 0);
  }, [connect]);

  // Mark as dirty when any selection changes
  useEffect(() => {
    setDirty(true);
  }, [selectedPersonaIdx, selectedScenarioIdx, selectedVoiceIdx]);

  return (
    <ConnectionOptsContext.Provider
      value={{ connectionOpts, dirty, connect, restart }}
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
