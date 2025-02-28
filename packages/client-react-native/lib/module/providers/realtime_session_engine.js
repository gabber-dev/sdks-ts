"use strict";

import { createContext, useRef, useEffect, useState, useMemo } from "react";
import React from "react";
import { RealtimeSessionEngine } from "../lib/session.js";
import { jsx as _jsx } from "react/jsx-runtime";
const RealtimeSessionEngineContext = /*#__PURE__*/createContext(undefined);
export function RealtimeSessionEngineProvider({
  connectionOpts,
  children
}) {
  const [id, setId] = useState(null);
  const [connectionState, setConnectionState] = useState("not_connected");
  const [messages, setMessages] = useState([]);
  const [microphoneEnabledState, setMicrophoneEnabledState] = useState(false);
  const [agentVolumeBands, setAgentVolumeBands] = useState([]);
  const [agentVolume, setAgentVolume] = useState(0);
  const [userVolumeBands, setUserVolumeBands] = useState([]);
  const [userVolume, setUserVolume] = useState(0);
  const [agentState, setAgentState] = useState("listening");
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [lastError, setLastError] = useState(null);
  const [canPlayAudio, setCanPlayAudio] = useState(true);
  const createOnce = useRef(false);
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
  useEffect(() => {
    setTranscription({
      final: false,
      text: lastUserMessage?.text || ""
    });
  }, [lastUserMessage]);
  const onConnectionStateChanged = useRef(sessionState => {
    setConnectionState(sessionState);
    setId(sessionEngine.current.id);
  });
  const onMessagesChanged = useRef(messages => {
    setMessages([...messages]);
  });
  const onMicrophoneChanged = useRef(async enabled => {
    setMicrophoneEnabledState(enabled);
  });
  const onAgentVolumeChanged = useRef((values, volume) => {
    setAgentVolumeBands(values);
    setAgentVolume(volume);
  });
  const onUserVolumeChanged = useRef((values, volume) => {
    setUserVolumeBands(values);
    setUserVolume(volume);
  });
  const onAgentStateChanged = useRef(as => {
    setAgentState(as);
  });
  const onRemainingSecondsChanged = useRef(seconds => {
    setRemainingSeconds(seconds);
  });
  const onAgentError = useRef(message => {
    setLastError({
      message
    });
  });
  const onCanPlayAudio = useRef(allowed => {
    setCanPlayAudio(allowed);
  });
  const sessionEngine = useRef((() => {
    // React will always return the first instantiation
    // even though this function will be called multiple times
    if (createOnce.current) {
      return {};
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
      onCanPlayAudioChanged: onCanPlayAudio.current
    });
  })());
  const setMicrophoneEnabled = useRef(async enabled => {
    if (!sessionEngine.current) {
      console.error("Trying to set microphone when there is no session");
      return;
    }
    await sessionEngine.current.setMicrophoneEnabled(enabled);
  });
  const sendChatMessage = useRef(async p => {
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
  return /*#__PURE__*/_jsx(RealtimeSessionEngineContext.Provider, {
    value: {
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
      startAudio: startAudio.current
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