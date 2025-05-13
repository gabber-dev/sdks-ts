"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RealtimeSessionEngineProvider = RealtimeSessionEngineProvider;
exports.useRealtimeSessionEngine = useRealtimeSessionEngine;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("@livekit/react-native");
var _livekitClient = require("livekit-client");
var _api = require("../lib/api.js");
var _jsxRuntime = require("react/jsx-runtime");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
(0, _reactNative.registerGlobals)();
const RealtimeSessionEngineContext = /*#__PURE__*/(0, _react.createContext)(undefined);
function RealtimeSessionEngineProvider({
  connectionOpts,
  children
}) {
  const [conDetails, setConDetails] = (0, _react.useState)(null);
  const [error, setError] = (0, _react.useState)(null);
  (0, _react.useEffect)(() => {
    console.log("NEIL connectionOpts", connectionOpts);
    if (!connectionOpts) {
      return;
    }
    if ("connection_details" in connectionOpts) {
      setConDetails(connectionOpts.connection_details);
    } else if ("token" in connectionOpts && "config" in connectionOpts) {
      const api = new _api.Api(connectionOpts.token);
      api.realtime.startRealtimeSession(connectionOpts).then(res => {
        if (res.data.connection_details) {
          setConDetails(res.data.connection_details);
        }
      }).catch(err => {
        setError(err.message);
      });
    }
  }, [connectionOpts]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.LiveKitRoom, {
    serverUrl: conDetails?.url,
    token: conDetails?.token,
    connect: Boolean(conDetails),
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(RealtimeSessionEngineProviderInner, {
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
  } = (0, _reactNative.useDataChannel)();
  const agentParticipant = (0, _reactNative.useRemoteParticipant)({
    kind: _livekitClient.ParticipantKind.AGENT
  });
  const {
    localParticipant,
    microphoneTrack,
    isMicrophoneEnabled
  } = (0, _reactNative.useLocalParticipant)();
  const {
    metadata
  } = (0, _reactNative.useRoomInfo)();
  const roomConnectionState = (0, _reactNative.useConnectionState)();
  const [messages, setMessages] = (0, _react.useState)([]);
  const [lastError, setLastError] = (0, _react.useState)(error);
  const [transcription, setTranscription] = (0, _react.useState)({
    text: "",
    final: false
  });
  const lastUserMessage = (0, _react.useMemo)(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!messages[i].agent) {
        return messages[i];
      }
    }
    return null;
  }, [messages]);
  const {
    id
  } = (0, _react.useMemo)(() => {
    if (!metadata) {
      return {
        id: null
      };
    }
    return {
      id: JSON.parse(metadata)["session"] || null
    };
  }, [metadata]);
  (0, _react.useEffect)(() => {
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
  (0, _react.useEffect)(() => {
    setTranscription({
      final: false,
      text: lastUserMessage?.text || ""
    });
  }, [lastUserMessage]);
  const setMicrophoneEnabled = (0, _react.useCallback)(async enabled => {
    await localParticipant.setMicrophoneEnabled(enabled);
  }, [localParticipant]);
  const sendChatMessage = (0, _react.useCallback)(async p => {
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
  const agentMicrophoneTrack = (0, _react.useMemo)(() => {
    if (!agentParticipant) {
      return;
    }
    for (const track in agentParticipant.audioTrackPublications) {
      const pub = agentParticipant.audioTrackPublications.get(track);
      if (!pub) {
        continue;
      }
      if (pub.source === _livekitClient.Track.Source.Microphone) {
        return pub.track;
      }
    }
    return;
  }, [agentParticipant]);
  const agentVolumeBands = (0, _reactNative.useMultibandTrackVolume)(agentMicrophoneTrack, {
    maxFrequency: 2000,
    minFrequency: 100
  });
  const userVolumeBands = (0, _reactNative.useMultibandTrackVolume)(microphoneTrack?.track, {
    maxFrequency: 2000,
    minFrequency: 100
  });
  const agentVolume = (0, _reactNative.useTrackVolume)(agentMicrophoneTrack);
  const userVolume = (0, _reactNative.useTrackVolume)(microphoneTrack?.track);
  const connectionState = (0, _react.useMemo)(() => {
    if (roomConnectionState === _livekitClient.ConnectionState.Disconnected) {
      return "not_connected";
    }
    if (roomConnectionState === _livekitClient.ConnectionState.Connecting || roomConnectionState === _livekitClient.ConnectionState.Reconnecting) {
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
  } = (0, _react.useMemo)(() => {
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
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(RealtimeSessionEngineContext.Provider, {
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
function useRealtimeSessionEngine() {
  const context = _react.default.useContext(RealtimeSessionEngineContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
//# sourceMappingURL=realtime_session_engine.js.map