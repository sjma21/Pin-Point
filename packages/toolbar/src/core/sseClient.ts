import type { Annotation } from '@pinpoint/shared';
import { toolbarStore } from '../state/toolbarState.js';

interface SSEEvent {
  type: string;
  annotation?: Annotation;
  annotations?: Annotation[];
}

class SSEClient {
  private es: EventSource | null = null;
  private _endpoint = '';
  private _sessionId = '';
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _alive = false;

  connect(endpoint: string, sessionId: string): void {
    this._endpoint = endpoint.replace(/\/$/, '');
    this._sessionId = sessionId;
    this._alive = true;
    this._connect();
  }

  private _connect(): void {
    if (!this._alive) return;
    if (this.es) { this.es.close(); this.es = null; }
    if (!this._endpoint || !this._sessionId) return;

    try {
      this.es = new EventSource(`${this._endpoint}/sessions/${this._sessionId}/events`);

      this.es.onmessage = (e: MessageEvent<string>) => {
        try {
          const event = JSON.parse(e.data) as SSEEvent;
          this._handleEvent(event);
        } catch { /* ignore malformed */ }
      };

      this.es.onerror = () => {
        this.es?.close();
        this.es = null;
        if (this._alive) this._scheduleReconnect();
      };
    } catch { /* EventSource unavailable */ }
  }

  private _handleEvent(event: SSEEvent): void {
    if (event.type === 'annotation.updated' || event.type === 'thread.message') {
      if (event.annotation) toolbarStore.updateAnnotation(event.annotation);
    }
  }

  private _scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this._connect();
    }, 3_000);
  }

  disconnect(): void {
    this._alive = false;
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    if (this.es) { this.es.close(); this.es = null; }
  }
}

export const sseClient = new SSEClient();
