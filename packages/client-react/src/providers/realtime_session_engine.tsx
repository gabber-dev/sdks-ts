"use client"
import { createContext, useRef, useEffect, useState, useMemo } from "react";
import {
  RealtimeSessionEngine,
  RealtimeSessionError,
  SDKAgentState,
  SDKConnectionState,
  SDKConnectOptions,
  SDKSendChatMessageParams,
  SDKSessionTranscription,
  WebcamState,
} from "gabber-client-core";
import React from "react";

type RealtimeSessionEngineContextData = {
  id: string | null;
  connectionState: SDKConnectionState;
  messages: SDKSessionTranscription[];
  lastError: { message: string } | null;
  microphoneEnabled: boolean;
  webcamState: WebcamState;
  agentVolumeBands: number[];
  agentVolume: number;
  userVolumeBands: number[];
  userVolume: number;
  agentState: SDKAgentState;
  remainingSeconds: number | null;
  transcription: { text: string; final: boolean };
  canPlayAudio: boolean;
  agentVideoEnabled: boolean;
  innerEngine: RealtimeSessionEngine;
  setWebcamEnabled: (state: WebcamState) => Promise<void>;
  setMicrophoneEnabled: (enabled: boolean) => Promise<void>;
  sendChatMessage: (p: SDKSendChatMessageParams) => Promise<void>;
  startAudio: () => Promise<void>;
};

const RealtimeSessionEngineContext = createContext<RealtimeSessionEngineContextData | undefined>(undefined);

type Props = {
  connectionOpts: SDKConnectOptions | null;
  videoTrackDestination?: HTMLVideoElement | string;
  webcamTrackDestination?: HTMLVideoElement | string;
  children: React.ReactNode;
};

export function RealtimeSessionEngineProvider({ connectionOpts, children, videoTrackDestination, webcamTrackDestination }: Props) {
  const [id, setId] = useState<string | null>(null);
  const [connectionState, setConnectionState] =
    useState<SDKConnectionState>("not_connected");
  const [messages, setMessages] = useState<SDKSessionTranscription[]>([]);
  const [microphoneEnabledState, setMicrophoneEnabledState] = useState(false);
  const [webcamState, setWebcamState] = useState<WebcamState>("off");
  const [agentVideoEnabled, setAgentVideoEnabled] = useState(false);
  const [agentVolumeBands, setAgentVolumeBands] = useState<number[]>([]);
  const [agentVolume, setAgentVolume] = useState<number>(0);
  const [userVolumeBands, setUserVolumeBands] = useState<number[]>([]);
  const [userVolume, setUserVolume] = useState<number>(0);
  const [agentState, setAgentState] = useState<SDKAgentState>("listening");
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [lastError, setLastError] = useState<RealtimeSessionError | null>(null);
  const [canPlayAudio, setCanPlayAudio] = useState(true);
  const createOnce = useRef(false);
  const connecting = useRef(false)
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

  useEffect(() => {
    sessionEngine.current.setVideoTrackDestination({element: videoTrackDestination});
  }, [videoTrackDestination]);

  useEffect(() => {
    sessionEngine.current.setWebcamTrackDestination({element: webcamTrackDestination});
  }, [webcamTrackDestination]);

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

  const onAgentVideoChanged = useRef((enabled: boolean) => {
    setAgentVideoEnabled(enabled);
  })

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

  const onWebcamChanged = useRef((enabled: WebcamState) => {
    setWebcamState(enabled);
  });

  const onRemainingSecondsChanged = useRef((seconds: number | null) => {
    setRemainingSeconds(seconds);
  });

  const onError = useRef((error: RealtimeSessionError) => {
    setLastError(error);
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
        onError: onError.current,
        onAgentStateChanged: onAgentStateChanged.current,
        onRemainingSecondsChanged: onRemainingSecondsChanged.current,
        onUserVolumeChanged: onUserVolumeChanged.current,
        onAgentVolumeChanged: onAgentVolumeChanged.current,
        onConnectionStateChanged: onConnectionStateChanged.current,
        onMessagesChanged: onMessagesChanged.current,
        onMicrophoneChanged: onMicrophoneChanged.current,
        onCanPlayAudioChanged: onCanPlayAudio.current,
        onAgentVideoChanged: onAgentVideoChanged.current,
        onWebcamChanged: onWebcamChanged.current,
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

  const setWebcamEnabled = useRef(async (state: WebcamState) => {
    if (!sessionEngine.current) {
      console.error("Trying to set webcam when there is no session");
      return;
    }
    await sessionEngine.current.setWebcamEnabled(state);
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
      if(connecting.current) {
        console.warn("Already connecting");
        return;
      }
      connecting.current = true
      sessionEngine.current.connect(connectionOpts).finally(() => {
        connecting.current = false
      });
    } else {
      if (connectionState === "not_connected") {
        return;
      }
      sessionEngine.current.disconnect()
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
        agentVideoEnabled,
        webcamState,
        innerEngine: sessionEngine.current,
        setWebcamEnabled: setWebcamEnabled.current,
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
