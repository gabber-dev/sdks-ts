"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RealtimeSessionEngine = void 0;
var _livekitClient = require("livekit-client");
var _reactNative = require("@livekit/react-native");
var _track_volume_visualizer = require("./track_volume_visualizer.js");
var _api = require("./api.js");
(0, _reactNative.registerGlobals)();
class RealtimeSessionEngine {
  agentParticipant = null;
  agentTrack = null;
  _microphoneEnabledState = false;
  transcriptions = [];
  _agentState = "warmup";
  _remainingSeconds = null;
  id = null;
  constructor({
    onConnectionStateChanged,
    onMessagesChanged,
    onMicrophoneChanged,
    onAgentVolumeChanged,
    onUserVolumeChanged,
    onAgentStateChanged,
    onRemainingSecondsChanged,
    onAgentError,
    onCanPlayAudioChanged
  }) {
    this.livekitRoom = new _livekitClient.Room();
    this.livekitRoom.on("connected", this.onRoomConnected.bind(this));
    this.livekitRoom.on("disconnected", this.onRoomDisconnected.bind(this));
    this.livekitRoom.on("trackSubscribed", this.onTrackSubscribed.bind(this));
    this.livekitRoom.on("trackUnsubscribed", this.onTrackUnsubscribed.bind(this));
    this.livekitRoom.on("dataReceived", this.onDataReceived.bind(this));
    this.livekitRoom.on("participantMetadataChanged", this.onParticipantMetadataChanged.bind(this));
    this.livekitRoom.on("localTrackPublished", this.onLocalTrackPublished.bind(this));
    this.livekitRoom.on("localTrackUnpublished", this.onLocalTrackUnpublished.bind(this));
    this.livekitRoom.on("trackMuted", this.onTrackMuted.bind(this));
    this.livekitRoom.on("trackUnmuted", this.onTrackUnmuted.bind(this));
    this.livekitRoom.on("audioPlaybackChanged", this.onAudioPlaybackChangaed.bind(this));
    this.onConnectionStateChanged = onConnectionStateChanged;
    this.onMessagesChanged = onMessagesChanged;
    this.onMicrophoneChanged = onMicrophoneChanged;
    this.onAgentVolumeChanged = onAgentVolumeChanged;
    this.onUserVolumeChanged = onUserVolumeChanged;
    this.onAgentStateChanged = onAgentStateChanged;
    this.onRemainingSecondsChanged = onRemainingSecondsChanged;
    this.onAgentError = onAgentError;
    this.onCanPlayAudioChanged = onCanPlayAudioChanged;
    this.agentVolumeVisualizer = new _track_volume_visualizer.TrackVolumeVisualizer({
      onTick: this.onAgentVolumeChanged.bind(this),
      bands: 10
    });
    this.userVolumeVisualizer = new _track_volume_visualizer.TrackVolumeVisualizer({
      onTick: this.onUserVolumeChanged.bind(this),
      bands: 10
    });
  }
  async connect(opts) {
    let connectionDetails = undefined;
    if ('connection_details' in opts) {
      connectionDetails = opts.connection_details;
    } else if ('token' in opts && 'config' in opts) {
      const api = new _api.Api(opts.token);
      const res = await api.realtime.startRealtimeSession(opts);
      connectionDetails = {
        url: res.data.connection_details.url,
        token: res.data.connection_details.token
      };
    }
    if (!connectionDetails) {
      throw new Error("No connection details provided");
    }
    await this.livekitRoom.connect(connectionDetails.url, connectionDetails.token, {
      autoSubscribe: true
    });
    this.onCanPlayAudioChanged(this.livekitRoom.canPlaybackAudio);
  }
  async disconnect() {
    await this.livekitRoom.disconnect();
  }
  async startAudio() {
    try {
      await this.livekitRoom.startAudio();
    } catch (e) {
      console.error("Error starting audio");
    }
  }
  async setMicrophoneEnabled(enabled) {
    await this.livekitRoom.localParticipant.setMicrophoneEnabled(enabled);
  }
  async sendChatMessage({
    text
  }) {
    const te = new TextEncoder();
    const encoded = te.encode(JSON.stringify({
      text
    }));
    await this.livekitRoom.localParticipant.publishData(encoded, {
      topic: "chat_input"
    });
  }
  set agentState(value) {
    if (value === this._agentState) {
      return;
    }
    this._agentState = value;
    this.onAgentStateChanged(value);
  }
  set remainingSeconds(value) {
    if (value === this._remainingSeconds) {
      return;
    }
    this._remainingSeconds = value;
    this.onRemainingSecondsChanged(value);
  }
  destroy() {
    // TODO: audio?
    try {
      this.livekitRoom.removeAllListeners();
      this.livekitRoom.disconnect(true);
    } catch (e) {
      console.error("Error destroying session", e);
    }
  }
  set microphoneEnabledState(value) {
    if (this._microphoneEnabledState !== value) {
      this._microphoneEnabledState = value;
      this.onMicrophoneChanged(value);
    }
  }
  resolveMicrophoneState() {
    if (!this.livekitRoom.localParticipant) {
      this.microphoneEnabledState = false;
    }
    this.microphoneEnabledState = this.livekitRoom.localParticipant.isMicrophoneEnabled;
  }
  onTrackUnmuted(publication, participant) {
    console.log("Local track unmuted", publication, participant);
    if (!participant.isLocal) {
      return;
    }
    if (publication.kind === _livekitClient.Track.Kind.Audio) {
      this.resolveMicrophoneState();
    }
  }
  onTrackMuted(publication, participant) {
    console.log("Local track muted", publication, participant);
    if (!participant.isLocal) {
      return;
    }
    if (publication.kind === _livekitClient.Track.Kind.Audio) {
      this.resolveMicrophoneState();
    }
  }
  onLocalTrackPublished(publication, participant) {
    console.log("Local track published", publication, participant);
    if (publication.kind === _livekitClient.Track.Kind.Audio) {
      this.userVolumeVisualizer.setTrack(publication.audioTrack);
      this.resolveMicrophoneState();
    }
  }
  onLocalTrackUnpublished(publication, participant) {
    console.log("Local track unpublished", publication, participant);
    if (publication.kind === _livekitClient.Track.Kind.Audio) {
      this.resolveMicrophoneState();
    }
  }
  onAudioPlaybackChangaed(_) {
    this.onCanPlayAudioChanged(this.livekitRoom.canPlaybackAudio);
  }
  onRoomConnected() {
    console.log("Room connected");
    this.resolveMicrophoneState();

    // Kind of a hack because session id isn't available through the connection details flow
    const metadataString = this.livekitRoom.metadata || "{}";
    this.id = JSON.parse(metadataString)["session"] || null;
    this.onConnectionStateChanged("waiting_for_agent");
  }
  onRoomDisconnected() {
    console.log("Room disconnected");
    this.id = null;
    this.resolveMicrophoneState();
    this.onConnectionStateChanged("not_connected");
  }
  onTrackSubscribed(track, pub, participant) {
    console.log("Track subscribed", track, pub, participant);
    if (track.kind !== "audio") {
      return;
    }
    if (this.agentParticipant) {
      console.error("Already subscribed to an agent");
      return;
    }
    // TODO: audio
    this.agentParticipant = participant;
    this.agentTrack = track;
    this.agentVolumeVisualizer.setTrack(track);
    this.onConnectionStateChanged("connected");
  }
  onTrackUnsubscribed(track, pub, participant) {
    console.log("Track unsubscribed", track, pub, participant);
    if (track.kind !== "audio") {
      return;
    }
    track.attachedElements.forEach(el => {
      el.remove();
    });
    if (track !== this.agentTrack) {
      console.error("Unsubscribed from unknown track");
      return;
    }
    this.agentParticipant = null;
    this.agentTrack = null;
    if (this.livekitRoom.state === "connected") {
      this.onConnectionStateChanged("waiting_for_agent");
    }
  }
  onDataReceived(data, participant, _, topic) {
    if (participant !== this.agentParticipant) {
      return;
    }
    const decoded = new TextDecoder().decode(data);
    console.log("Data received", decoded, participant, topic);
    if (topic === "message") {
      const message = JSON.parse(decoded);
      for (let i = 0; i < this.transcriptions.length; i++) {
        if (this.transcriptions[i].id === message.id && this.transcriptions[i].agent === message.agent) {
          this.transcriptions[i] = message;
          this.onMessagesChanged(this.transcriptions);
          return;
        }
      }
      this.transcriptions.push(message);
      this.onMessagesChanged(this.transcriptions);
    } else if (topic === "error") {
      const payload = JSON.parse(decoded);
      this.onAgentError(payload.message);
    }
  }
  onParticipantMetadataChanged(_, participant) {
    if (!participant.metadata || !participant.isAgent) {
      return;
    }
    try {
      const md = JSON.parse(participant.metadata);
      if (md.remaining_seconds) {
        this.remainingSeconds = md.remaining_seconds;
      }
      const {
        agent_state
      } = md;
      if (agent_state !== "speaking" && agent_state !== "listening" && agent_state !== "thinking" && agent_state !== "warmup" && agent_state !== "time_limit_exceeded" && agent_state !== "usage_limit_exceeded") {
        console.error("Unrecognized agent_state", agent_state);
        return;
      }
      this.agentState = agent_state;
    } catch (e) {
      console.error("Error on participant metadata cb", e);
    }
  }
}
exports.RealtimeSessionEngine = RealtimeSessionEngine;
//# sourceMappingURL=session.js.map