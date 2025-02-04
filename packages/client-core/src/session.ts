import { RealtimeSessionConnectionDetails, SDKAgentState, SDKConnectionState, SDKConnectOptions, SDKSendChatMessageParams, SDKSessionTranscription } from "./generated";
import {
  Room,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
  RemoteAudioTrack,
  DataPacket_Kind,
  TrackPublication,
  Track,
  LocalTrackPublication,
  LocalParticipant,
  Participant,
  LocalAudioTrack,
} from "livekit-client";
import { TrackVolumeVisualizer } from "./TrackVolumeVisualizer";
import { Api } from "./api";

export class RealtimeSessionEngine {
  private livekitRoom: Room;
  private agentParticipant: RemoteParticipant | null = null;
  private agentTrack: RemoteAudioTrack | null = null;
  private _microphoneEnabledState: boolean = false;
  private transcriptions: SDKSessionTranscription[] = [];
  private agentVolumeVisualizer: TrackVolumeVisualizer;
  private userVolumeVisualizer: TrackVolumeVisualizer;
  private onConnectionStateChanged: ConnectionStateChangedCallback;
  private onMessagesChanged: OnTranscriptionsChangedCallback;
  private onMicrophoneChanged: OnMicrophoneCallback;
  private onAgentVolumeChanged: OnVolumeCallback;
  private onUserVolumeChanged: OnVolumeCallback;
  private onAgentStateChanged: OnAgentStateChanged;
  private onRemainingSecondsChanged: OnRemainingSecondsChanged;
  private onAgentError: OnAgentErrorCallback;
  private onCanPlayAudioChanged: OnCanPlayAudioChanged;
  private _agentState: SDKAgentState = "warmup";
  private _remainingSeconds: number | null = null;
  private divElement: HTMLDivElement;
  public id: string | null = null;

  constructor({
    onConnectionStateChanged: onConnectionStateChanged,
    onMessagesChanged,
    onMicrophoneChanged,
    onAgentVolumeChanged,
    onUserVolumeChanged,
    onAgentStateChanged,
    onRemainingSecondsChanged: onRemainingSecondsChanged,
    onAgentError,
    onCanPlayAudioChanged,
  }: SessionEngineParams) {
    this.livekitRoom = new Room();
    this.livekitRoom.on("connected", this.onRoomConnected.bind(this));
    this.livekitRoom.on("disconnected", this.onRoomDisconnected.bind(this));
    this.livekitRoom.on("trackSubscribed", this.onTrackSubscribed.bind(this));
    this.livekitRoom.on(
      "trackUnsubscribed",
      this.onTrackUnsubscribed.bind(this)
    );
    this.livekitRoom.on("dataReceived", this.onDataReceived.bind(this));
    this.livekitRoom.on(
      "participantMetadataChanged",
      this.onParticipantMetadataChanged.bind(this)
    );
    this.livekitRoom.on(
      "localTrackPublished",
      this.onLocalTrackPublished.bind(this)
    );
    this.livekitRoom.on(
      "localTrackUnpublished",
      this.onLocalTrackUnpublished.bind(this)
    );
    this.livekitRoom.on("trackMuted", this.onTrackMuted.bind(this));
    this.livekitRoom.on("trackUnmuted", this.onTrackUnmuted.bind(this));
    this.livekitRoom.on(
      "audioPlaybackChanged",
      this.onAudioPlaybackChangaed.bind(this)
    );

    this.divElement = document.createElement("div");
    document.body.appendChild(this.divElement);
    this.onConnectionStateChanged = onConnectionStateChanged;
    this.onMessagesChanged = onMessagesChanged;
    this.onMicrophoneChanged = onMicrophoneChanged;
    this.onAgentVolumeChanged = onAgentVolumeChanged;
    this.onUserVolumeChanged = onUserVolumeChanged;
    this.onAgentStateChanged = onAgentStateChanged;
    this.onRemainingSecondsChanged = onRemainingSecondsChanged;
    this.onAgentError = onAgentError;
    this.onCanPlayAudioChanged = onCanPlayAudioChanged;

    this.agentVolumeVisualizer = new TrackVolumeVisualizer({
      onTick: this.onAgentVolumeChanged.bind(this),
      bands: 10,
    });

    this.userVolumeVisualizer = new TrackVolumeVisualizer({
      onTick: this.onUserVolumeChanged.bind(this),
      bands: 10,
    });
  }

  async connect(opts: SDKConnectOptions) {
    let connectionDetails: RealtimeSessionConnectionDetails | undefined = undefined;
    if ('connection_details' in opts) {
      connectionDetails = opts.connection_details;
    } else if ('token' in opts && 'config' in opts) {
      const api = new Api(opts.token);
      const res = await api.realtime.startRealtimeSession(opts);
      connectionDetails = {
        url: res.data.connection_details.url!,
        token: res.data.connection_details.token!,
      };
    }
    if (!connectionDetails) {
      throw new Error("No connection details provided");
    }
    await this.livekitRoom.connect(
      connectionDetails.url,
      connectionDetails.token,
      {
        autoSubscribe: true,
      }
    );


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

  async setMicrophoneEnabled(enabled: boolean) {
    await this.livekitRoom.localParticipant.setMicrophoneEnabled(enabled);
  }

  async sendChatMessage({ text }: SDKSendChatMessageParams) {
    const te = new TextEncoder();
    const encoded = te.encode(JSON.stringify({ text }));
    await this.livekitRoom.localParticipant.publishData(encoded, {
      topic: "chat_input",
    });
  }

  private set agentState(value: SDKAgentState) {
    if (value == this._agentState) {
      return;
    }
    this._agentState = value;
    this.onAgentStateChanged(value);
  }

  private set remainingSeconds(value: number) {
    if (value === this._remainingSeconds) {
      return;
    }

    this._remainingSeconds = value;
    this.onRemainingSecondsChanged(value);
  }

  destroy() {
    document.body.removeChild(this.divElement);
    try {
      this.livekitRoom.removeAllListeners();
      this.livekitRoom.disconnect(true);
    } catch (e) {
      console.error("Error destroying session", e);
    }
  }

  private set microphoneEnabledState(value: boolean) {
    if (this._microphoneEnabledState !== value) {
      this._microphoneEnabledState = value;
      this.onMicrophoneChanged(value);
    }
  }

  private resolveMicrophoneState() {
    if (!this.livekitRoom.localParticipant) {
      this.microphoneEnabledState = false;
    }
    this.microphoneEnabledState =
      this.livekitRoom.localParticipant.isMicrophoneEnabled;
  }

  private onTrackUnmuted(
    publication: TrackPublication,
    participant: Participant
  ) {
    console.log("Local track unmuted", publication, participant);
    if (!participant.isLocal) {
      return;
    }
    if (publication.kind === Track.Kind.Audio) {
      this.resolveMicrophoneState();
    }
  }

  private onTrackMuted(
    publication: TrackPublication,
    participant: Participant
  ) {
    console.log("Local track muted", publication, participant);
    if (!participant.isLocal) {
      return;
    }
    if (publication.kind === Track.Kind.Audio) {
      this.resolveMicrophoneState();
    }
  }

  private onLocalTrackPublished(
    publication: LocalTrackPublication,
    participant: LocalParticipant
  ) {
    console.log("Local track published", publication, participant);
    if (publication.kind === Track.Kind.Audio) {
      this.userVolumeVisualizer.setTrack(
        publication.audioTrack as LocalAudioTrack
      );
      this.resolveMicrophoneState();
    }
  }

  private onLocalTrackUnpublished(
    publication: LocalTrackPublication,
    participant: LocalParticipant
  ) {
    console.log("Local track unpublished", publication, participant);
    if (publication.kind === Track.Kind.Audio) {
      this.resolveMicrophoneState();
    }
  }

  private onAudioPlaybackChangaed(_: boolean) {
    this.onCanPlayAudioChanged(this.livekitRoom.canPlaybackAudio);
  }

  private onRoomConnected() {
    console.log("Room connected");
    this.resolveMicrophoneState();

    // Kind of a hack because session id isn't available through the connection details flow
    const metadataString = this.livekitRoom.metadata || "{}";
    this.id = (JSON.parse(metadataString))["session"] || null;

    this.onConnectionStateChanged("waiting_for_agent");
  }

  private onRoomDisconnected() {
    console.log("Room disconnected");
    this.id = null;
    this.resolveMicrophoneState();
    this.onConnectionStateChanged("not_connected");
  }

  private onTrackSubscribed(
    track: RemoteTrack,
    pub: RemoteTrackPublication,
    participant: RemoteParticipant
  ) {
    console.log("Track subscribed", track, pub, participant);
    if (track.kind !== "audio") {
      return;
    }
    if (this.agentParticipant) {
      console.error("Already subscribed to an agent");
      return;
    }
    this.divElement.appendChild(track.attach());
    this.agentParticipant = participant;
    this.agentTrack = track as RemoteAudioTrack;
    this.agentVolumeVisualizer.setTrack(track as RemoteAudioTrack);
    this.onConnectionStateChanged("connected");
  }

  private onTrackUnsubscribed(
    track: RemoteTrack,
    pub: RemoteTrackPublication,
    participant: RemoteParticipant
  ) {
    console.log("Track unsubscribed", track, pub, participant);
    if (track.kind !== "audio") {
      return;
    }
    track.attachedElements.forEach((el) => {
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

  private onDataReceived(
    data: Uint8Array,
    participant: RemoteParticipant | undefined,
    _: DataPacket_Kind | undefined,
    topic: string | undefined
  ) {
    if (participant !== this.agentParticipant) {
      return;
    }

    const decoded = new TextDecoder().decode(data);
    console.log("Data received", decoded, participant, topic);
    if (topic === "message") {
      const message = JSON.parse(decoded) as SDKSessionTranscription;
      for (let i = 0; i < this.transcriptions.length; i++) {
        if (this.transcriptions[i].id === message.id && this.transcriptions[i].agent == message.agent) {
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

  private onParticipantMetadataChanged(
    _: string | undefined,
    participant: RemoteParticipant | LocalParticipant
  ) {
    if (!participant.metadata || !participant.isAgent) {
      return;
    }
    try {
      const md = JSON.parse(participant.metadata);
      if (md.remaining_seconds) {
        this.remainingSeconds = md.remaining_seconds;
      }
      const { agent_state } = md;
      if (
        agent_state != "speaking" &&
        agent_state != "listening" &&
        agent_state != "thinking" &&
        agent_state != "warmup" &&
        agent_state != "time_limit_exceeded" &&
        agent_state != "usage_limit_exceeded"
      ) {
        console.error("Unrecognized agent_state", agent_state);
        return;
      }
      this.agentState = agent_state;
    } catch (e) {
      console.error("Error on participant metadata cb", e);
    }
  }
}

type ConnectionStateChangedCallback = (state: SDKConnectionState) => void;
type OnTranscriptionsChangedCallback = (transcriptions: SDKSessionTranscription[]) => void;
type OnMicrophoneCallback = (enabled: boolean) => void;
type OnVolumeCallback = (values: number[], volume: number) => void;
type OnAgentStateChanged = (state: SDKAgentState) => void;
type OnRemainingSecondsChanged = (seconds: number) => void;
type OnAgentErrorCallback = (msg: string) => void;
type OnCanPlayAudioChanged = (allowed: boolean) => void;

export type SessionEngineParams = {
  onConnectionStateChanged: ConnectionStateChangedCallback;
  onMessagesChanged: OnTranscriptionsChangedCallback;
  onMicrophoneChanged: OnMicrophoneCallback;
  onAgentStateChanged: OnAgentStateChanged;
  onRemainingSecondsChanged: OnRemainingSecondsChanged;
  onAgentVolumeChanged: OnVolumeCallback;
  onUserVolumeChanged: OnVolumeCallback;
  onAgentError: OnAgentErrorCallback;
  onCanPlayAudioChanged: OnCanPlayAudioChanged;
};