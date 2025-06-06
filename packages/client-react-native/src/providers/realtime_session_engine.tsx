import {
  createContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { SDKAgentState, SDKConnectionState } from "../generated";
import type {
  RealtimeSessionConnectionDetails,
  SDKConnectOptions,
  SDKSendChatMessageParams,
  SDKSessionTranscription,
} from "../generated";
import React from "react";
import {
  LiveKitRoom,
  useConnectionState,
  useDataChannel,
  useLocalParticipant,
  useMultibandTrackVolume,
  useRemoteParticipant,
  useRoomInfo,
  useTrackVolume,
  registerGlobals,
  useParticipantInfo,
  useTracks,
} from "@livekit/react-native";
import {
  ParticipantKind,
  ConnectionState,
  Track,
  RemoteAudioTrack,
  LocalAudioTrack,
  RemoteParticipant,
} from "livekit-client";
import { Api } from "../lib/api";

registerGlobals();

type RealtimeSessionEngineContextData = {
  id: string | null;
  connectionState: SDKConnectionState;
  messages: SDKSessionTranscription[];
  lastError: { message: string } | null;
  microphoneEnabled: boolean;
  agentVolumeBands: number[];
  agentVolume: number;
  userVolumeBands: number[];
  userVolume: number;
  agentState: SDKAgentState;
  remainingSeconds: number | null;
  transcription: { text: string; final: boolean };
  setMicrophoneEnabled: (enabled: boolean) => Promise<void>;
  sendChatMessage: (p: SDKSendChatMessageParams) => Promise<void>;
};

const RealtimeSessionEngineContext = createContext<
  RealtimeSessionEngineContextData | undefined
>(undefined);

type Props = {
  connectionOpts: SDKConnectOptions | null;
  children: React.ReactNode;
};

export function RealtimeSessionEngineProvider({
  connectionOpts,
  children,
}: Props) {
  const [conDetails, setConDetails] =
    useState<RealtimeSessionConnectionDetails | null>(null);
  const [error, setError] = useState<{ message: string } | null>(null);

  useEffect(() => {
    if (!connectionOpts) {
      return;
    }
    if ("connection_details" in connectionOpts) {
      setConDetails(connectionOpts.connection_details);
    } else if ("token" in connectionOpts && "config" in connectionOpts) {
      const api = new Api(connectionOpts.token);
      api.realtime
        .startRealtimeSession(connectionOpts)
        .then((res) => {
          if (res.data.connection_details) {
            setConDetails(res.data.connection_details);
          }
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [connectionOpts]);

  return (
    <LiveKitRoom
      serverUrl={conDetails?.url}
      token={conDetails?.token}
      connect={Boolean(conDetails)}
    >
      <RealtimeSessionEngineProviderInner error={error}>
        {children}
      </RealtimeSessionEngineProviderInner>
    </LiveKitRoom>
  );
}

type InnerProps = {
  error: { message: string } | null;
  children: React.ReactNode;
};
function RealtimeSessionEngineProviderInner({ error, children }: InnerProps) {
  const { message } = useDataChannel();
  const agentParticipant = useRemoteParticipant({
    kind: ParticipantKind.AGENT,
  });
  const { localParticipant, microphoneTrack, isMicrophoneEnabled } =
    useLocalParticipant();
  const { metadata } = useRoomInfo();
  const roomConnectionState = useConnectionState();
  const [messages, setMessages] = useState<SDKSessionTranscription[]>([]);
  const [lastError, setLastError] = useState<{ message: string } | null>(error);
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

  const { id }: { id: string | null } = useMemo(() => {
    if (!metadata) {
      return { id: null };
    }
    return { id: JSON.parse(metadata)["session"] || null };
  }, [metadata]);

  useEffect(() => {
    if (!message) {
      return;
    }
    const decoded = new TextDecoder().decode(message.payload);
    if (message?.topic === "message") {
      const messageData = JSON.parse(decoded) as SDKSessionTranscription;
      setMessages((prev) => {
        const newMessages = [...prev];
        const existingIndex = newMessages.findIndex(
          (m) => m.id === messageData.id && m.agent === messageData.agent,
        );
        if (existingIndex >= 0) {
          newMessages[existingIndex] = messageData; // Update existing message
        } else {
          newMessages.push(messageData); // Append new message
        }
        return newMessages;
      });
    } else if (message?.topic === "error") {
      const payload = JSON.parse(decoded);
      setLastError({ message: payload.message });
    }
  }, [message]);

  useEffect(() => {
    setTranscription({ final: false, text: lastUserMessage?.text || "" });
  }, [lastUserMessage]);

  const setMicrophoneEnabled = useCallback(
    async (enabled: boolean) => {
      await localParticipant.setMicrophoneEnabled(enabled);
    },
    [localParticipant],
  );

  const sendChatMessage = useCallback(
    async (p: SDKSendChatMessageParams) => {
      if (!p.text) {
        console.error("Trying to send empty chat message");
        return;
      }
      const te = new TextEncoder();
      const encoded = te.encode(JSON.stringify({ text: p.text }));
      await localParticipant.publishData(encoded, {
        topic: "chat_input",
      });
    },
    [localParticipant],
  );

  const agentMicrophoneTrack = useAgentMicrophoneTrack({
    agentParticipant,
  });

  const agentVolumeBands = useMultibandTrackVolume(agentMicrophoneTrack, {
    maxFrequency: 15000,
    minFrequency: 500,
    bands: 20,
    updateInterval: 50,
  });
  const userVolumeBands = useMultibandTrackVolume(
    microphoneTrack?.track as LocalAudioTrack | undefined,
    { maxFrequency: 15000, minFrequency: 500, bands: 20, updateInterval: 50 },
  );
  const agentVolume = useTrackVolume(agentMicrophoneTrack);
  const userVolume = useTrackVolume(
    microphoneTrack?.track as LocalAudioTrack | undefined,
  );

  const connectionState: SDKConnectionState = useMemo(() => {
    if (roomConnectionState === ConnectionState.Disconnected) {
      return "not_connected";
    }
    if (
      roomConnectionState === ConnectionState.Connecting ||
      roomConnectionState === ConnectionState.Reconnecting
    ) {
      return "connecting";
    }

    if (!agentParticipant) {
      return "waiting_for_agent";
    }

    if (!agentMicrophoneTrack) {
      return "waiting_for_agent";
    }

    return "connected";
  }, [agentMicrophoneTrack, agentParticipant, roomConnectionState]);

  const { metadata: agentMetadata } = useAgentMetadata({
    agentParticipant,
  });

  const {
    agentState,
    remainingSeconds,
  }: { agentState: SDKAgentState; remainingSeconds: number | null } =
    useMemo(() => {
      if (!agentParticipant) {
        return { agentState: "warmup", remainingSeconds: null };
      }
      if (!agentMetadata) {
        console.error("Agent metadata is not set");
        return { agentState: "warmup", remainingSeconds: null };
      }
      let remainingSeconds: number | null = null;
      let agentState: SDKAgentState = "warmup";
      const md = JSON.parse(agentMetadata);
      if (md.remaining_seconds) {
        remainingSeconds = md.remaining_seconds;
      }
      const { agent_state } = md;
      if (
        agent_state !== "speaking" &&
        agent_state !== "listening" &&
        agent_state !== "thinking" &&
        agent_state !== "warmup" &&
        agent_state !== "time_limit_exceeded" &&
        agent_state !== "usage_limit_exceeded"
      ) {
        console.error("Unrecognized agent_state", agent_state);
        return { agentState: "warmup", remainingSeconds };
      }
      agentState = agent_state;
      return { agentState, remainingSeconds };
    }, [agentMetadata, agentParticipant]);

  return (
    <RealtimeSessionEngineContext.Provider
      value={{
        id,
        messages,
        connectionState: connectionState,
        microphoneEnabled: isMicrophoneEnabled,
        agentVolumeBands,
        agentVolume,
        userVolumeBands,
        userVolume,
        agentState,
        remainingSeconds,
        transcription,
        lastError,
        sendChatMessage,
        setMicrophoneEnabled,
      }}
    >
      {children}
    </RealtimeSessionEngineContext.Provider>
  );
}

function useAgentMetadata({
  agentParticipant,
}: {
  agentParticipant: RemoteParticipant | undefined;
}) {
  const { metadata } = useParticipantInfo({ participant: agentParticipant });

  return { metadata };
}

function useAgentMicrophoneTrack({
  agentParticipant,
}: {
  agentParticipant: RemoteParticipant | undefined;
}) {
  const allTracks = useTracks([Track.Source.Microphone]);

  const agentMicrophoneTrack = useMemo(() => {
    if (!agentParticipant) {
      return;
    }
    for (let t of allTracks) {
      if (t.participant.identity === agentParticipant.identity) {
        return t.publication.track as RemoteAudioTrack;
      }
    }

    return;
  }, [agentParticipant, allTracks]);

  return agentMicrophoneTrack;
}

export function useRealtimeSessionEngine() {
  const context = React.useContext(RealtimeSessionEngineContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
