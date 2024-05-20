const GABBER_API_URL = 'https://app.gabber.dev/api/v1';

export class GabberApi {
  private api_key: string;
  public constructor(api_key: string) {
    this.api_key = api_key;
  }

  public async startSession(params: StartSessionRequest): Promise<StartSessionResponse> {
    const res = await fetch(`${GABBER_API_URL}/session/start`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.api_key,
      },
      method: "POST",
      body: JSON.stringify(params),
    });
    const json = await res.json();
    return json;
  }
}

type StartSessionRequest = {
  persona: string;
  scenario: string;
}

type StartSessionResponse = {
  session: { id: string };
  persona: string;
  scenario: string;
  connection_details: { url: string; token: string };
};