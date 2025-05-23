import {
  Configuration,
  RealtimeApi,
  PersonaApi,
  VoiceApi,
  ScenarioApi,
  LLMApi,
  UsageApi,
} from "../generated";

export * from "../generated/model";

export class Api {
  public realtime: RealtimeApi;
  public persona: PersonaApi;
  public voice: VoiceApi;
  public scenario: ScenarioApi;
  public llm: LLMApi;
  public usage: UsageApi;

  constructor(token: string) {
    const config = new Configuration({ accessToken: token });
    this.realtime = new RealtimeApi(config);
    this.persona = new PersonaApi(config);
    this.voice = new VoiceApi(config);
    this.scenario = new ScenarioApi(config);
    this.llm = new LLMApi(config);
    this.usage = new UsageApi(config);
  }
}
