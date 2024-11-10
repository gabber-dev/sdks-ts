import { Api, Voice } from "gabber-client-core";
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useToken } from "./TokenProvider";

type VoiceContextData = {
    voices: Voice[];
    selectedVoiceIdx: number;
    setSelectedVoiceIdx: (idx: number) => void;
};

const VoiceContext = createContext<VoiceContextData | undefined>(
  undefined
);

type Props = {
  children: React.ReactNode;
};

export function VoiceProvider({
  children,
}: Props) {
  const {token} = useToken();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceIdx, setSelectedVoiceIdx] = useState<number>(0);
  const api = useMemo(() => {
    if(!token) {
      return null;
    }
    return new Api(token);
  }, [token]);

  const loadVoices = useCallback(async () => {
    if(!api) {
      return;
    }
    const voices = await api.getVoices();
    setVoices(voices.values);
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
    throw "useVoice must be used within a VoiceProvider";
  }
  return context;
}
