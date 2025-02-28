import { createContext, useRef, useEffect, useState, useMemo } from "react";
import {SDKAgentState, SDKConnectionState} from "../generated"
import type { SDKConnectOptions, SDKSendChatMessageParams, SDKSessionTranscription} from "../generated"
import React from "react";
import { RealtimeSessionEngine } from "../lib/session";

type RealtimeSessionEngineContextData = {
  id: string | null;
  connectionState: SDKConnectionState;
  messages: SDKSessionTranscription[];
  lastError: {message: string} | null;
  microphoneEnabled: boolean;
  agentVolumeBands: number[];
  agentVolume: number;
  userVolumeBands: number[];
  userVolume: number;
  agentState: SDKAgentState;
  remainingSeconds: number | null;
  transcription: { text: string; final: boolean };
  canPlayAudio: boolean;
  setMicrophoneEnabled: (enabled: boolean) => Promise<void>;
  sendChatMessage: (p: SDKSendChatMessageParams) => Promise<void>;
  startAudio: () => Promise<void>;
};

const RealtimeSessionEngineContext = createContext<RealtimeSessionEngineContextData | undefined>(undefined);

type Props = {
  connectionOpts: SDKConnectOptions | null;
  children: React.ReactNode;
};

export function RealtimeSessionEngineProvider({ connectionOpts, children }: Props) {
  const [id, setId] = useState<string | null>(null);
  const [connectionState, setConnectionState] =
    useState<SDKConnectionState>("not_connected");
  const [messages, setMessages] = useState<SDKSessionTranscription[]>([]);
  const [microphoneEnabledState, setMicrophoneEnabledState] = useState(false);
  const [agentVolumeBands, setAgentVolumeBands] = useState<number[]>([]);
  const [agentVolume, setAgentVolume] = useState<number>(0);
  const [userVolumeBands, setUserVolumeBands] = useState<number[]>([]);
  const [userVolume, setUserVolume] = useState<number>(0);
  const [agentState, setAgentState] = useState<SDKAgentState>("listening");
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [lastError, setLastError] = useState<{message: string} | null>(null);
  const [canPlayAudio, setCanPlayAudio] = useState(true);
  const createOnce = useRef(false);
  const [transcription, setTranscription] = useState({
    text: "",
    final: false,
  });

  const lastUserMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!messages[i]!.agent) {
        return messages[i];
      }
    }
    return null;
  }, [messages]);

  useEffect(() => {
    setTranscription({ final: false, text: lastUserMessage?.text || "" });
  }, [lastUserMessage]);

  const onConnectionStateChanged = useRef((sessionState: SDKConnectionState) => {
    setConnectionState(sessionState);
    setId(sessionEngine.current.id);
  });

  const onMessagesChanged = useRef((messages: SDKSessionTranscription[]) => {
    setMessages([...messages]);
  });

  const onMicrophoneChanged = useRef(async (enabled: boolean) => {
    setMicrophoneEnabledState(enabled);
  });

  const onAgentVolumeChanged = useRef((values: number[], volume: number) => {
    setAgentVolumeBands(values);
    setAgentVolume(volume);
  });

  const onUserVolumeChanged = useRef((values: number[], volume: number) => {
    setUserVolumeBands(values);
    setUserVolume(volume);
  });

  const onAgentStateChanged = useRef((as: SDKAgentState) => {
    setAgentState(as);
  });

  const onRemainingSecondsChanged = useRef((seconds: number | null) => {
    setRemainingSeconds(seconds);
  });

  const onAgentError = useRef((message: string) => {
    setLastError({message});
  });

  const onCanPlayAudio = useRef((allowed: boolean) => {
    setCanPlayAudio(allowed);
  });

  const sessionEngine = useRef(
    (() => {
      // React will always return the first instantiation
      // even though this function will be called multiple times
      if (createOnce.current) {
        return {} as RealtimeSessionEngine;
      }
      createOnce.current = true;
      return new RealtimeSessionEngine({
        onAgentError: onAgentError.current,
        onAgentStateChanged: onAgentStateChanged.current,
        onRemainingSecondsChanged: onRemainingSecondsChanged.current,
        onUserVolumeChanged: onUserVolumeChanged.current,
        onAgentVolumeChanged: onAgentVolumeChanged.current,
        onConnectionStateChanged: onConnectionStateChanged.current,
        onMessagesChanged: onMessagesChanged.current,
        onMicrophoneChanged: onMicrophoneChanged.current,
        onCanPlayAudioChanged: onCanPlayAudio.current,
      });
    })()
  );

  const setMicrophoneEnabled = useRef(async (enabled: boolean) => {
    if (!sessionEngine.current) {
      console.error("Trying to set microphone when there is no session");
      return;
    }
    await sessionEngine.current.setMicrophoneEnabled(enabled);
  });

  const sendChatMessage = useRef(async (p: SDKSendChatMessageParams) => {
    if (!sessionEngine.current) {
      console.error("Trying to send chat message when there is no session");
      return;
    }
    await sessionEngine.current.sendChatMessage(p);
  });

  const startAudio = useRef(async () => {
    await sessionEngine.current.startAudio();
  });

  useEffect(() => {
    if (connectionOpts) {
      if (connectionState !== "not_connected") {
        return;
      }
      sessionEngine.current.connect(connectionOpts);
    } else {
      if (connectionState === "not_connected") {
        return;
      }
      sessionEngine.current.disconnect();
    }
  }, [connectionOpts, connectionState]);

  return (
    <RealtimeSessionEngineContext.Provider
      value={{
        id,
        messages,
        connectionState: connectionState,
        microphoneEnabled: microphoneEnabledState,
        agentVolumeBands,
        agentVolume,
        userVolumeBands,
        userVolume,
        agentState,
        remainingSeconds,
        transcription,
        lastError,
        canPlayAudio,
        sendChatMessage: sendChatMessage.current,
        setMicrophoneEnabled: setMicrophoneEnabled.current,
        startAudio: startAudio.current,
      }}
    >
      {children}
    </RealtimeSessionEngineContext.Provider>
  );
}

export function useRealtimeSessionEngine() {
  const context = React.useContext(RealtimeSessionEngineContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}