import { Gabber } from "gabber-client-core";

type Params = {
    onStateChanged?: (state: Gabber.AgentState) => void
}

export class InternalWidget {
  private onStateChanged?: (state: Gabber.AgentState) => void;
  private prevState: Gabber.AgentState | undefined = undefined

  public setState(state: Gabber.AgentState) {
    if(state === this.prevState) {
        return;
    }
    if (this.onStateChanged) {
      this.onStateChanged(state);
    }
    this.prevState = state;
  }

  public constructor({ onStateChanged }: Params) {
    this.onStateChanged = onStateChanged;
  }
}