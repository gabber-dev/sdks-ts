"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RealtimeSessionEngineProvider = RealtimeSessionEngineProvider;
exports.useRealtimeSessionEngine = useRealtimeSessionEngine;
var _react = _interopRequireWildcard(require("react"));
var _session = require("../lib/session.js");
var _jsxRuntime = require("react/jsx-runtime");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const RealtimeSessionEngineContext = /*#__PURE__*/(0, _react.createContext)(undefined);
function RealtimeSessionEngineProvider({
  connectionOpts,
  children
}) {
  const [id, setId] = (0, _react.useState)(null);
  const [connectionState, setConnectionState] = (0, _react.useState)("not_connected");
  const [messages, setMessages] = (0, _react.useState)([]);
  const [microphoneEnabledState, setMicrophoneEnabledState] = (0, _react.useState)(false);
  const [agentVolumeBands, setAgentVolumeBands] = (0, _react.useState)([]);
  const [agentVolume, setAgentVolume] = (0, _react.useState)(0);
  const [userVolumeBands, setUserVolumeBands] = (0, _react.useState)([]);
  const [userVolume, setUserVolume] = (0, _react.useState)(0);
  const [agentState, setAgentState] = (0, _react.useState)("listening");
  const [remainingSeconds, setRemainingSeconds] = (0, _react.useState)(null);
  const [lastError, setLastError] = (0, _react.useState)(null);
  const [canPlayAudio, setCanPlayAudio] = (0, _react.useState)(true);
  const createOnce = (0, _react.useRef)(false);
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
  (0, _react.useEffect)(() => {
    setTranscription({
      final: false,
      text: lastUserMessage?.text || ""
    });
  }, [lastUserMessage]);
  const onConnectionStateChanged = (0, _react.useRef)(sessionState => {
    setConnectionState(sessionState);
    setId(sessionEngine.current.id);
  });
  const onMessagesChanged = (0, _react.useRef)(messages => {
    setMessages([...messages]);
  });
  const onMicrophoneChanged = (0, _react.useRef)(async enabled => {
    setMicrophoneEnabledState(enabled);
  });
  const onAgentVolumeChanged = (0, _react.useRef)((values, volume) => {
    setAgentVolumeBands(values);
    setAgentVolume(volume);
  });
  const onUserVolumeChanged = (0, _react.useRef)((values, volume) => {
    setUserVolumeBands(values);
    setUserVolume(volume);
  });
  const onAgentStateChanged = (0, _react.useRef)(as => {
    setAgentState(as);
  });
  const onRemainingSecondsChanged = (0, _react.useRef)(seconds => {
    setRemainingSeconds(seconds);
  });
  const onAgentError = (0, _react.useRef)(message => {
    setLastError({
      message
    });
  });
  const onCanPlayAudio = (0, _react.useRef)(allowed => {
    setCanPlayAudio(allowed);
  });
  const sessionEngine = (0, _react.useRef)((() => {
    // React will always return the first instantiation
    // even though this function will be called multiple times
    if (createOnce.current) {
      return {};
    }
    createOnce.current = true;
    return new _session.RealtimeSessionEngine({
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
  const setMicrophoneEnabled = (0, _react.useRef)(async enabled => {
    if (!sessionEngine.current) {
      console.error("Trying to set microphone when there is no session");
      return;
    }
    await sessionEngine.current.setMicrophoneEnabled(enabled);
  });
  const sendChatMessage = (0, _react.useRef)(async p => {
    if (!sessionEngine.current) {
      console.error("Trying to send chat message when there is no session");
      return;
    }
    await sessionEngine.current.sendChatMessage(p);
  });
  const startAudio = (0, _react.useRef)(async () => {
    await sessionEngine.current.startAudio();
  });
  (0, _react.useEffect)(() => {
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
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(RealtimeSessionEngineContext.Provider, {
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
function useRealtimeSessionEngine() {
  const context = _react.default.useContext(RealtimeSessionEngineContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
//# sourceMappingURL=realtime_session_engine.js.map