import { RealtimeApi, PersonaApi, VoiceApi, ScenarioApi, LLMApi, UsageApi } from "../generated";
export * from "../generated/model";
export declare class Api {
    realtime: RealtimeApi;
    persona: PersonaApi;
    voice: VoiceApi;
    scenario: ScenarioApi;
    llm: LLMApi;
    usage: UsageApi;
    constructor(token: string);
}
//# sourceMappingURL=api.d.ts.map