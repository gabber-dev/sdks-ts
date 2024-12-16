import {
  Configuration,
  RealtimeApi,
  PersonaApi,
  SessionApi,
  VoiceApi,
  ScenarioApi,
  LLMApi,
  UsageApi
} from "./generated";

export * from "./generated/model";

export class Api {

  public realtime: RealtimeApi;
  public persona: PersonaApi;
  public session: SessionApi;
  public voice: VoiceApi;
  public scenario: ScenarioApi;
  public llm: LLMApi;
  public usage: UsageApi;

  constructor(token: string) {
    const config = new Configuration({ accessToken: token });
    this.realtime = new RealtimeApi(config);
    this.persona = new PersonaApi(config);
    this.session = new SessionApi(config);
    this.voice = new VoiceApi(config);
    this.scenario = new ScenarioApi(config);
    this.llm = new LLMApi(config);
    this.usage = new UsageApi(config);
  }
}
