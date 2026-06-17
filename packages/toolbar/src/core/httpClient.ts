import type { Annotation } from '@pinpoint/shared';

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await fetch(url, init);
    } catch { /* retry */ }
  }
  return null;
}

class HttpClient {
  private _endpoint = '';
  private _sessionId = '';

  get sessionId(): string { return this._sessionId; }

  isConfigured(): boolean { return Boolean(this._endpoint && this._sessionId); }

  setSession(endpoint: string, sessionId: string): void {
    this._endpoint = endpoint.replace(/\/$/, '');
    this._sessionId = sessionId;
  }

  async init(endpoint: string): Promise<string | null> {
    this._endpoint = endpoint.replace(/\/$/, '');
    return this.createSession(window.location.href);
  }

  async createSession(url: string): Promise<string | null> {
    const res = await fetchWithRetry(`${this._endpoint}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res?.ok) return null;
    try {
      const data = await res.json() as { id?: string };
      if (typeof data.id !== 'string') return null;
      this._sessionId = data.id;
      return data.id;
    } catch { return null; }
  }

  async postAnnotation(annotation: Annotation): Promise<void> {
    if (!this.isConfigured()) return;
    await fetchWithRetry(
      `${this._endpoint}/sessions/${this._sessionId}/annotations`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annotation),
      },
    );
  }
}

export const httpClient = new HttpClient();
