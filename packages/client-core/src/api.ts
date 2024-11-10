import {
    ApiV1SessionStartPost200ResponsePersona,
    ApiV1SessionStartPost200ResponseScenario,
    Configuration,
    PersonaApi,
    ScenarioApi,
    UsageApi,
    VoiceApi,
    ApiV1UsageTokenPutRequestLimitsInner,
    ApiV1UsageTokenPutRequestLimitsInnerTypeEnum
  } from "./generated";

export class Api {
    private personaApi: PersonaApi;
    private voiceApi: VoiceApi;
    private scenarioApi: ScenarioApi;
    private usageApi: UsageApi;

    constructor(token: string) {
      const config = new Configuration({ accessToken: token });
      this.personaApi = new PersonaApi(config);
      this.voiceApi = new VoiceApi(config);
      this.scenarioApi = new ScenarioApi(config);
      this.usageApi = new UsageApi(config);
    }

    async getPersonas() {
      const response = await this.personaApi.apiV1PersonaListGet();
      const data = response.data;
      const values = data.values as Persona[];
      return {
        values,
        next_page: data.next_page,
        total_count: data.total_count,
      };
    }

    async getScenarios() {
      const response = await this.scenarioApi.apiV1ScenarioListGet();
      const data = response.data;
      const values = data.values as Scenario[];
      return {
        values,
        next_page: data.next_page,
        total_count: data.total_count,
      };
    }

    async getVoices() {
      const response = await this.voiceApi.apiV1VoiceListGet();
      const data = response.data;
      const values = data.values;
      const voices: Voice[] = values.map((v) => {
        return {
          id: v.id,
          name: v.name,
          language: v.language,
        };
      });
      return {
        values: voices,
        next_page: data.next_page,
        total_count: data.total_count,
      };
    }

    async generateVoice(req: { text: string; voice_id: string }) {
      const response = await this.voiceApi.apiV1VoiceGeneratePost(req);
      return response;
    }

    async getUsageLimits() {
      const response = await this.usageApi.apiV1UsageLimitsGet();
      return response.data as UsageLimit[];
    }
  }

  export type Persona = ApiV1SessionStartPost200ResponsePersona;
  export type Scenario = ApiV1SessionStartPost200ResponseScenario;
  export type Voice = { id: string; name: string; language: string };
  export type UsageLimit = ApiV1UsageTokenPutRequestLimitsInner
  export type UsageType = ApiV1UsageTokenPutRequestLimitsInnerTypeEnum; 