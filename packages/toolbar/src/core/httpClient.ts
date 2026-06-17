import type { Annotation } from '@pinpoint/shared';

const SESSION_KEY = 'pp_server_session';

function loadStoredSession(endpoint: string): string | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { endpoint: ep, sessionId } = JSON.parse(raw) as { endpoint?: string; sessionId?: string };
    if (ep === endpoint.replace(/\/$/, '') && typeof sessionId === 'string') return sessionId;
  } catch { /* ignore */ }
  return null;
}

function storeSession(endpoint: string, sessionId: string): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ endpoint: endpoint.replace(/\/$/, ''), sessionId }));
  } catch { /* ignore */ }
}

function clearStoredSession(): void {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

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
  private _initPromise: Promise<string | null> | null = null;

  get sessionId(): string { return this._sessionId; }

  isConfigured(): boolean { return Boolean(this._endpoint && this._sessionId); }

  setSession(endpoint: string, sessionId: string): void {
    this._endpoint = endpoint.replace(/\/$/, '');
    this._sessionId = sessionId;
    storeSession(this._endpoint, sessionId);
  }

  clearSession(): void {
    this._sessionId = '';
    clearStoredSession();
  }

  async verifySession(sessionId = this._sessionId): Promise<boolean> {
    if (!this._endpoint || !sessionId) return false;
    const res = await fetchWithRetry(`${this._endpoint}/sessions/${sessionId}`, { method: 'GET' });
    if (!res?.ok) {
      if (sessionId === this._sessionId) this.clearSession();
      return false;
    }
    return true;
  }

  async init(endpoint: string): Promise<string | null> {
    this._endpoint = endpoint.replace(/\/$/, '');
    if (this._sessionId) return this._sessionId;

    const stored = loadStoredSession(this._endpoint);
    if (stored) {
      this._sessionId = stored;
      const ok = await this.verifySession(stored);
      if (ok) return stored;
    }

    if (this._initPromise) return this._initPromise;

    this._initPromise = this.createSession(window.location.href)
      .finally(() => { this._initPromise = null; });
    return this._initPromise;
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
      storeSession(this._endpoint, data.id);
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
