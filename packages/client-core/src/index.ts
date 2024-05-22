import {
  Room,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
  RemoteAudioTrack,
  DataPacket_Kind,
  TrackPublication,
  Track,
  LocalTrackPublication
} from "livekit-client";

export namespace Gabber {
  export class Session {
    private url: string;
    private token: string;
    private livekitRoom: Room;
    private agentParticipant: RemoteParticipant | null = null;
    private agentTrack: RemoteAudioTrack | null = null;
    private _microphoneEnabledState: boolean;
    private messages: SessionMessage[] = [];
    private onSessionStateChanged: SessionStateChangedCallback;
    private onMessagesChanged: OnMessagesChangedCallback;
    private onMicrophoneChanged: OnMicrophoneCallback;
    private divElement: HTMLDivElement;

    constructor({ url, token, onSessionStateChanged, onMessagesChanged, onMicrophoneChanged }: SessionParams) {
      this.url = url;
      this.token = token;
      this.livekitRoom = new Room();
      this.livekitRoom.on("connected", this.onRoomConnected);
      this.livekitRoom.on("disconnected", this.onRoomDisconnected);
      this.livekitRoom.on("trackSubscribed", this.onTrackSubscribed);
      this.livekitRoom.on("trackUnsubscribed", this.onTrackUnsubscribed);
      this.livekitRoom.on("dataReceived", this.onDataReceived);
      this.divElement = document.createElement("div");
      document.body.appendChild(this.divElement);
      this.onSessionStateChanged = onSessionStateChanged;
      this.onMessagesChanged = onMessagesChanged;
      this.onMicrophoneChanged = onMicrophoneChanged;
    }

    async connect() {
      await this.livekitRoom.connect(this.url, this.token, {
        autoSubscribe: true,
      });
      this.livekitRoom.localParticipant.on("trackPublished", this.localOnTrackPublished)
      this.livekitRoom.localParticipant.on("trackUnpublished", this.localOnTrackUnpublished)
      this.livekitRoom.localParticipant.on("trackMuted", this.localOnTrackMuted)
      this.livekitRoom.localParticipant.on("trackUnmuted", this.localOnTrackUnMuted)
    }

    async disconnect() {
      await this.livekitRoom.disconnect();
    }

    async setMicrophoneEnabled(enabled: boolean) {
      await this.livekitRoom.localParticipant.setMicrophoneEnabled(enabled)
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

    private get microphoneEnabledState() {
      return this._microphoneEnabledState;
    }

    private set microphoneEnabledState(value: boolean) {
      if(this._microphoneEnabledState !== value) {
        this._microphoneEnabledState = value;
        this.onMicrophoneChanged(value);
      }
    }

    private resolveMicrophoneState() {
      if(!this.livekitRoom.localParticipant) {
        this.setMicrophoneEnabled(false);
      }
      let pub: LocalTrackPublication | null = null;
      for(const key in this.livekitRoom.localParticipant.audioTrackPublications) {
        pub = this.livekitRoom.localParticipant.audioTrackPublications[key]
        break
      }

      let enabled = false;
      if(pub.audioTrack && !pub.audioTrack.isMuted) {
        enabled = true;
      }

      this.setMicrophoneEnabled(enabled);
    }

    private localOnTrackUnMuted(publication: TrackPublication) {
      if(publication.kind === Track.Kind.Audio) {
        this.resolveMicrophoneState();
      }
    }

    private localOnTrackMuted(publication: TrackPublication) {
      if (publication.kind === Track.Kind.Audio) {
        this.resolveMicrophoneState();
      }
    }

    private localOnTrackPublished(publication: RemoteTrackPublication) {
      if (publication.kind === Track.Kind.Audio) {
        this.resolveMicrophoneState();
      }
    }

    private localOnTrackUnpublished(publication: RemoteTrackPublication) {
      if (publication.kind === Track.Kind.Audio) {
        this.resolveMicrophoneState();
      }
    }

    private onRoomConnected() {
      this.resolveMicrophoneState();
      this.onSessionStateChanged("waiting_for_agent");
    }

    private onRoomDisconnected() {
      this.resolveMicrophoneState();
      this.onSessionStateChanged("not_connected");
    }

    private onTrackSubscribed(
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) {
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
      this.onSessionStateChanged("connected");
    }

    private onTrackUnsubscribed(
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) {
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
        this.onSessionStateChanged("waiting_for_agent");
      }
    }

    private onDataReceived(
      data: Uint8Array,
      participant: RemoteParticipant,
      kind: DataPacket_Kind,
      topic: string
    ) {
      if (participant !== this.agentParticipant) {
        return;
      }

      if (topic === "message") {
        const messageJson = new TextDecoder().decode(data);
        const message = JSON.parse(messageJson) as SessionMessage;
        for(let i = 0; i < this.messages.length; i++) {
          if (this.messages[i].id === message.id) {
            this.messages[i] = message;
            this.onMessagesChanged(this.messages);
            return;
          }
        }

        this.messages.push(message);
        this.onMessagesChanged(this.messages);
      }
    }
  }

  export type SessionState =
    | "not_connected"
    | "connecting"
    | "waiting_for_agent"
    | "connected";

  type SessionStateChangedCallback = (state: SessionState) => void;
  type OnMessagesChangedCallback = (messages: SessionMessage[]) => void;
  type OnMicrophoneCallback = (enabled: boolean) => void;

  type SessionParams = {
    url: string;
    token: string;
    onSessionStateChanged: SessionStateChangedCallback;
    onMessagesChanged: OnMessagesChangedCallback;
    onMicrophoneChanged: OnMicrophoneCallback;
  };

  export type SessionMessage = {
    id: string;
    agent: boolean;
    created_at: Date;
    speaking_ended_at: Date;
    deleted_at?: Date;
    session: string;
    text: string;
  };
}
