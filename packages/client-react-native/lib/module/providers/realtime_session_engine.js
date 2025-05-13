"use strict";

import { createContext, useEffect, useState, useMemo, useCallback } from "react";
import React from "react";
import { LiveKitRoom, useConnectionState, useDataChannel, useLocalParticipant, useMultibandTrackVolume, useRemoteParticipant, useRoomInfo, useTrackVolume, registerGlobals } from "@livekit/react-native";
import { ParticipantKind, ConnectionState, Track } from "livekit-client";
import { Api } from "../lib/api.js";
import { jsx as _jsx } from "react/jsx-runtime";
registerGlobals();
const RealtimeSessionEngineContext = /*#__PURE__*/createContext(undefined);
export function RealtimeSessionEngineProvider({
  connectionOpts,
  children
}) {
  const [conDetails, setConDetails] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    console.log("NEIL connectionOpts", connectionOpts);
    if (!connectionOpts) {
      return;
    }
    if ("connection_details" in connectionOpts) {
      setConDetails(connectionOpts.connection_details);
    } else if ("token" in connectionOpts && "config" in connectionOpts) {
      const api = new Api(connectionOpts.token);
      api.realtime.startRealtimeSession(connectionOpts).then(res => {
        if (res.data.connection_details) {
          setConDetails(res.data.connection_details);
        }
      }).catch(err => {
        setError(err.message);
      });
    }
  }, [connectionOpts]);
  return /*#__PURE__*/_jsx(LiveKitRoom, {
    serverUrl: conDetails?.url,
    token: conDetails?.token,
    connect: Boolean(conDetails),
    children: /*#__PURE__*/_jsx(RealtimeSessionEngineProviderInner, {
      error: error,
      children: children
    })
  });
}
function RealtimeSessionEngineProviderInner({
  error,
  children
}) {
  const {
    message
  } = useDataChannel();
  const agentParticipant = useRemoteParticipant({
    kind: ParticipantKind.AGENT
  });
  const {
    localParticipant,
    microphoneTrack,
    isMicrophoneEnabled
  } = useLocalParticipant();
  const {
    metadata
  } = useRoomInfo();
  const roomConnectionState = useConnectionState();
  const [messages, setMessages] = useState([]);
  const [lastError, setLastError] = useState(error);
  const [transcription, setTranscription] = useState({
    text: "",
    final: false
  });
  const lastUserMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!messages[i].agent) {
        return messages[i];
      }
    }
    return null;
  }, [messages]);
  const {
    id
  } = useMemo(() => {
    if (!metadata) {
      return {
        id: null
      };
    }
    return {
      id: JSON.parse(metadata)["session"] || null
    };
  }, [metadata]);
  useEffect(() => {
    if (!message) {
      return;
    }
    const decoded = new TextDecoder().decode(message.payload);
    if (message?.topic === "message") {
      const message = JSON.parse(decoded);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages.push(message);
        return newMessages;
      });
      setTranscription({
        final: message.final,
        text: message.text
      });
    } else if (message?.topic === "error") {
      const payload = JSON.parse(decoded);
      setLastError({
        message: payload.message
      });
    }
  }, [message]);
  useEffect(() => {
    setTranscription({
      final: false,
      text: lastUserMessage?.text || ""
    });
  }, [lastUserMessage]);
  const setMicrophoneEnabled = useCallback(async enabled => {
    await localParticipant.setMicrophoneEnabled(enabled);
  }, [localParticipant]);
  const sendChatMessage = useCallback(async p => {
    if (!p.text) {
      console.error("Trying to send empty chat message");
      return;
    }
    const te = new TextEncoder();
    const encoded = te.encode(JSON.stringify({
      text: p.text
    }));
    await localParticipant.publishData(encoded, {
      topic: "chat_input"
    });
  }, [localParticipant]);
  const agentMicrophoneTrack = useMemo(() => {
    if (!agentParticipant) {
      return;
    }
    for (const track in agentParticipant.audioTrackPublications) {
      const pub = agentParticipant.audioTrackPublications.get(track);
      if (!pub) {
        continue;
      }
      if (pub.source === Track.Source.Microphone) {
        return pub.track;
      }
    }
    return;
  }, [agentParticipant]);
  const agentVolumeBands = useMultibandTrackVolume(agentMicrophoneTrack, {
    maxFrequency: 2000,
    minFrequency: 100
  });
  const userVolumeBands = useMultibandTrackVolume(microphoneTrack?.track, {
    maxFrequency: 2000,
    minFrequency: 100
  });
  const agentVolume = useTrackVolume(agentMicrophoneTrack);
  const userVolume = useTrackVolume(microphoneTrack?.track);
  const connectionState = useMemo(() => {
    if (roomConnectionState === ConnectionState.Disconnected) {
      return "not_connected";
    }
    if (roomConnectionState === ConnectionState.Connecting || roomConnectionState === ConnectionState.Reconnecting) {
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
  const {
    agentState,
    remainingSeconds
  } = useMemo(() => {
    if (!agentParticipant) {
      return {
        agentState: "warmup",
        remainingSeconds: null
      };
    }
    const mdStr = agentParticipant.metadata;
    if (!mdStr) {
      console.error("Agent metadata is not set");
      return {
        agentState: "warmup",
        remainingSeconds: null
      };
    }
    let remainingSeconds = null;
    let agentState = "warmup";
    const md = JSON.parse(mdStr);
    if (md.remaining_seconds) {
      remainingSeconds = md.remaining_seconds;
    }
    const {
      agent_state
    } = md;
    if (agent_state !== "speaking" && agent_state !== "listening" && agent_state !== "thinking" && agent_state !== "warmup" && agent_state !== "time_limit_exceeded" && agent_state !== "usage_limit_exceeded") {
      console.error("Unrecognized agent_state", agent_state);
      return {
        agentState: "warmup",
        remainingSeconds
      };
    }
    agentState = agent_state;
    return {
      agentState,
      remainingSeconds
    };
  }, [agentParticipant]);
  return /*#__PURE__*/_jsx(RealtimeSessionEngineContext.Provider, {
    value: {
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
      setMicrophoneEnabled
    },
    children: children
  });
}
export function useRealtimeSessionEngine() {
  const context = React.useContext(RealtimeSessionEngineContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
//# sourceMappingURL=realtime_session_engine.js.map