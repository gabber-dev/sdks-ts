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
    private _microphoneEnabledState: boolean = false;
    private messages: SessionMessage[] = [];
    private onInProgressStateChanged: InProgressStateChangedCallback;
    private onMessagesChanged: OnMessagesChangedCallback;
    private onMicrophoneChanged: OnMicrophoneCallback;
    private divElement: HTMLDivElement;

    constructor({ url, token, onInProgressStateChanged, onMessagesChanged, onMicrophoneChanged }: SessionParams) {
      this.url = url;
      this.token = token;
      this.livekitRoom = new Room();
      this.livekitRoom.on("connected", this.onRoomConnected.bind(this));
      this.livekitRoom.on("disconnected", this.onRoomDisconnected.bind(this));
      this.livekitRoom.on("trackSubscribed", this.onTrackSubscribed.bind(this));
      this.livekitRoom.on("trackUnsubscribed", this.onTrackUnsubscribed.bind(this));
      this.livekitRoom.on("dataReceived", this.onDataReceived);
      this.divElement = document.createElement("div");
      document.body.appendChild(this.divElement);
      this.onInProgressStateChanged = onInProgressStateChanged;
      this.onMessagesChanged = onMessagesChanged;
      this.onMicrophoneChanged = onMicrophoneChanged;
    }

    async connect() {
      await this.livekitRoom.connect(this.url, this.token, {
        autoSubscribe: true,
      });
      this.livekitRoom.localParticipant.on("trackPublished", this.localOnTrackPublished.bind(this))
      this.livekitRoom.localParticipant.on("trackUnpublished", this.localOnTrackUnpublished.bind(this))
      this.livekitRoom.localParticipant.on("trackMuted", this.localOnTrackMuted.bind(this))
      this.livekitRoom.localParticipant.on("trackUnmuted", this.localOnTrackUnMuted.bind(this))
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

    private set microphoneEnabledState(value: boolean) {
      if(this._microphoneEnabledState !== value) {
        this._microphoneEnabledState = value;
        this.onMicrophoneChanged(value);
      }
    }

    private resolveMicrophoneState() {
      if(!this.livekitRoom.localParticipant) {
        this.microphoneEnabledState = false;
      }
      this.microphoneEnabledState = this.livekitRoom.localParticipant.isMicrophoneEnabled
    }

    private localOnTrackUnMuted(publication: TrackPublication) {
      console.log("Local track unmuted", publication)
      if(publication.kind === Track.Kind.Audio) {
        this.resolveMicrophoneState();
      }
    }

    private localOnTrackMuted(publication: TrackPublication) {
      console.log("Local track muted", publication)
      if (publication.kind === Track.Kind.Audio) {
        this.resolveMicrophoneState();
      }
    }

    private localOnTrackPublished(publication: RemoteTrackPublication) {
      console.log("Local track published", publication)
      if (publication.kind === Track.Kind.Audio) {
        this.resolveMicrophoneState();
      }
    }

    private localOnTrackUnpublished(publication: RemoteTrackPublication) {
      console.log("Local track unpublished", publication)
      if (publication.kind === Track.Kind.Audio) {
        this.resolveMicrophoneState();
      }
    }

    private onRoomConnected() {
      console.log("Room connected")
      this.resolveMicrophoneState();
      this.onInProgressStateChanged("waiting_for_agent");
    }

    private onRoomDisconnected() {
      console.log("Room disconnected")
      this.resolveMicrophoneState();
      this.onInProgressStateChanged("not_connected");
    }

    private onTrackSubscribed(
      track: RemoteTrack,
      pub: RemoteTrackPublication,
      participant: RemoteParticipant
    ) {
      console.log("Track subscribed", track, pub, participant)
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
      this.onInProgressStateChanged("connected");
    }

    private onTrackUnsubscribed(
      track: RemoteTrack,
      pub: RemoteTrackPublication,
      participant: RemoteParticipant
    ) {
      console.log("Track unsubscribed", track, pub, participant)
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
        this.onInProgressStateChanged("waiting_for_agent");
      }
    }

    private onDataReceived(
      data: Uint8Array,
      participant: RemoteParticipant | undefined,
      _: DataPacket_Kind | undefined,
      topic: string | undefined
    ) {
      console.log("Data received", data, participant, topic)
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

  export type InProgressState =
    | "not_connected"
    | "connecting"
    | "waiting_for_agent"
    | "connected";

  type InProgressStateChangedCallback = (state: InProgressState) => void;
  type OnMessagesChangedCallback = (messages: SessionMessage[]) => void;
  type OnMicrophoneCallback = (enabled: boolean) => void;

  type SessionParams = {
    url: string;
    token: string;
    onInProgressStateChanged: InProgressStateChangedCallback;
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
