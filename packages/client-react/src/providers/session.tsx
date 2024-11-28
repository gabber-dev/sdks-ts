import { createContext, useRef, useEffect, useState, useMemo } from "react";
import {
  Session,
  ConnectionState,
  SessionMessage,
  AgentState,
  SendChatMessageParams,
  ConnectOptions
} from "gabber-client-core";
import React from "react";

type SessionContextData = {
  id: string | null;
  connectionState: ConnectionState;
  messages: SessionMessage[];
  lastError: {message: string} | null;
  microphoneEnabled: boolean;
  agentVolumeBands: number[];
  agentVolume: number;
  userVolumeBands: number[];
  userVolume: number;
  agentState: AgentState;
  remainingSeconds: number | null;
  transcription: { text: string; final: boolean };
  canPlayAudio: boolean;
  setMicrophoneEnabled: (enabled: boolean) => Promise<void>;
  sendChatMessage: (p: SendChatMessageParams) => Promise<void>;
  startAudio: () => Promise<void>;
};

const SessionContext = createContext<SessionContextData | undefined>(undefined);

type Props = {
  connectionOpts: ConnectOptions | null;
  children: React.ReactNode;
};

export function SessionProvider({ connectionOpts, children }: Props) {
  const [id, setId] = useState<string | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("not_connected");
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [microphoneEnabledState, setMicrophoneEnabledState] = useState(false);
  const [agentVolumeBands, setAgentVolumeBands] = useState<number[]>([]);
  const [agentVolume, setAgentVolume] = useState<number>(0);
  const [userVolumeBands, setUserVolumeBands] = useState<number[]>([]);
  const [userVolume, setUserVolume] = useState<number>(0);
  const [agentState, setAgentState] = useState<AgentState>("listening");
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
      if (!messages[i].agent) {
        return messages[i];
      }
    }
    return null;
  }, [messages]);

  useEffect(() => {
    setTranscription({ final: false, text: lastUserMessage?.text || "" });
  }, [lastUserMessage]);

  const onConnectionStateChanged = useRef((sessionState: ConnectionState) => {
    setConnectionState(sessionState);
    setId(sessionEngine.current.id);
  });

  const onMessagesChanged = useRef((messages: SessionMessage[]) => {
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

  const onAgentStateChanged = useRef((as: AgentState) => {
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
        return {} as Session;
      }
      createOnce.current = true;
      return new Session({
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

  const sendChatMessage = useRef(async (p: SendChatMessageParams) => {
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
    <SessionContext.Provider
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
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = React.useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
