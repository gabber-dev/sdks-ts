import { Gabber } from "gabber-client-core";

type Params = {
  onAgentStateChanged?: (state: Gabber.AgentState) => void;
  onRemainingSecondsChanged?: (seconds: number | null) => void;
  onConnectionStateChanged?: (state: Gabber.ConnectionState) => void;
};

export class InternalWidget {
  private onAgentStateChanged?: (state: Gabber.AgentState) => void;
  private onRemainingSecondsChanged?: (seconds: number | null) => void;
  private onConnectionStateChanged?: (state: Gabber.ConnectionState) => void;

  private _agentState: Gabber.AgentState = "warmup";
  private _remainingSeconds: number | null = null;
  private _connectionState: Gabber.ConnectionState = "not_connected";
  private _disconnectHandler: () => void = () => null;

  public set agentState(state: Gabber.AgentState) {
    if (state === this._agentState) {
      return;
    }
    if (this.onAgentStateChanged) {
      this.onAgentStateChanged(state);
    }
    this._agentState = state;
  }

  public set connectionState(state: Gabber.ConnectionState) {
    if (state === this._connectionState) {
      return;
    }
    if (this.onConnectionStateChanged) {
      this.onConnectionStateChanged(state);
    }
    this._connectionState = state;
  }

  public set remainingSeconds(seconds: number | null) {
    if (seconds === this._remainingSeconds) {
      return;
    }
    if (this.onRemainingSecondsChanged) {
      this.onRemainingSecondsChanged(seconds);
    }
    this._remainingSeconds = seconds;
  }

  public registerDisconnectHandler(h: () => void) {
    this._disconnectHandler = h;
  }

  public disconnect() {
    this._disconnectHandler();
  }

  public constructor({
    onConnectionStateChanged,
    onAgentStateChanged,
    onRemainingSecondsChanged,
  }: Params) {
    this.onAgentStateChanged = onAgentStateChanged;
    this.onConnectionStateChanged = onConnectionStateChanged;
    this.onRemainingSecondsChanged = onRemainingSecondsChanged;
  }
}