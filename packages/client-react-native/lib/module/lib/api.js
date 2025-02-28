"use strict";

import { Configuration, RealtimeApi, PersonaApi, VoiceApi, ScenarioApi, LLMApi, UsageApi } from "../generated/index.js";
export * from "../generated/model/index.js";
export class Api {
  constructor(token) {
    const config = new Configuration({
      accessToken: token
    });
    this.realtime = new RealtimeApi(config);
    this.persona = new PersonaApi(config);
    this.voice = new VoiceApi(config);
    this.scenario = new ScenarioApi(config);
    this.llm = new LLMApi(config);
    this.usage = new UsageApi(config);
  }
}
//# sourceMappingURL=api.js.map