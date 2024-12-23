import { Api, Voice } from "gabber-client-core";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useToken } from "./TokenProvider";

type VoiceContextData = {
  voices: Voice[];
  selectedVoiceIdx: number;
  setSelectedVoiceIdx: (idx: number) => void;
};

const VoiceContext = createContext<VoiceContextData | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export function VoiceProvider({ children }: Props) {
  const { token } = useToken();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceIdx, setSelectedVoiceIdx] = useState<number>(0);
  const api = useMemo(() => {
    if (!token) {
      return null;
    }
    return new Api(token);
  }, [token]);

  const loadVoices = useCallback(async () => {
    if (!api) {
      return;
    }
    const voices = await api.voice.listVoices();
    const filteredVoices = voices.data.values.filter((voice) =>
      Boolean(voice.project),
    );
    setVoices(filteredVoices);
  }, [api]);

  useEffect(() => {
    loadVoices();
  }, [loadVoices]);

  return (
    <VoiceContext.Provider
      value={{ voices, selectedVoiceIdx, setSelectedVoiceIdx }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = React.useContext(VoiceContext);
  if (!context) {
    throw new Error("useVoice must be used within a VoiceProvider");
  }
  return context;
}
