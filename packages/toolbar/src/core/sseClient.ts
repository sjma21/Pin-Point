import type { Annotation } from '@pinpoint/shared';
import { toolbarStore } from '../state/toolbarState.js';
import { isTerminalStatus } from './annotationStatus.js';

interface SSEEvent {
  type: string;
  annotation?: Annotation;
  annotations?: Annotation[];
  annotationId?: string;
  mode?: string;
}

// Delay before removing a resolved/dismissed marker (allows exit animation to play)
const RESOLVE_ANIM_MS = 1200;

class SSEClient {
  private es: EventSource | null = null;
  private _endpoint = '';
  private _sessionId = '';
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _alive = false;
  onSessionNotFound: (() => void) | null = null;

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
        if (this._alive) {
          void this._checkSessionAndRecover();
        }
      };
    } catch { /* EventSource unavailable */ }
  }

  private async _checkSessionAndRecover(): Promise<void> {
    try {
      const res = await fetch(`${this._endpoint}/sessions/${this._sessionId}`, { method: 'GET' });
      if (res.status === 404) {
        this.onSessionNotFound?.();
        return;
      }
    } catch { /* network hiccup; reconnect */ }
    this._scheduleReconnect();
  }

  private _handleEvent(event: SSEEvent): void {
    switch (event.type) {
      case 'annotation.updated': {
        if (!event.annotation) break;
        const ann = event.annotation;
        if (isTerminalStatus(ann.status)) {
          // Count resolved annotations toward the watch processed count
          if (toolbarStore.get().agentMode === 'watching') {
            const stats = toolbarStore.get().agentStats;
            toolbarStore.set({ agentStats: { ...stats, watchProcessedCount: stats.watchProcessedCount + 1 } });
          }
          // Upsert first so the resolved state is visible, then delete after animation
          toolbarStore.upsertAnnotation(ann);
          const id = ann.id;
          setTimeout(() => toolbarStore.deleteAnnotation(id), RESOLVE_ANIM_MS);
        } else {
          toolbarStore.upsertAnnotation(ann);
        }
        break;
      }

      case 'thread.message': {
        if (!event.annotation) break;
        const ann = event.annotation;
        if (isTerminalStatus(ann.status)) {
          toolbarStore.upsertAnnotation(ann);
          const id = ann.id;
          setTimeout(() => toolbarStore.deleteAnnotation(id), RESOLVE_ANIM_MS);
        } else {
          toolbarStore.upsertAnnotation(ann);
          // Auto-open thread viewer when agent replies
          const meta = (ann.metadata ?? {}) as Record<string, unknown>;
          const thread = meta['thread'] as Array<{ role: string }> | undefined;
          const lastMsg = thread?.[thread.length - 1];
          if (lastMsg?.role === 'agent' && !toolbarStore.get().popupConfig) {
            const bb = ann.target.boundingBox;
            const selector = ann.target.selector;
            const element = (selector ? document.querySelector(selector) : null) ?? document.body;
            toolbarStore.set({
              popupConfig: {
                element,
                clientX: bb ? bb.x + bb.width / 2 : window.innerWidth / 2,
                clientY: bb ? bb.y + 30 : window.innerHeight / 2,
                editAnnotationId: ann.id,
              },
            });
          }
        }
        break;
      }

      case 'annotation.created':
        if (event.annotation) toolbarStore.upsertAnnotation(event.annotation);
        break;

      case 'annotation.deleted':
        if (event.annotationId) toolbarStore.deleteAnnotation(event.annotationId);
        else if (event.annotation) toolbarStore.deleteAnnotation(event.annotation.id);
        break;

      case 'agent.watching.started':
        toolbarStore.set({ agentMode: 'watching' });
        break;

      case 'agent.watching.stopped':
        toolbarStore.set({ agentMode: 'idle' });
        break;

      case 'agent.mode': {
        const mode = event.mode;
        if (mode === 'watching' || mode === 'critiquing' || mode === 'self-driving' || mode === 'idle') {
          toolbarStore.set({ agentMode: mode });
        }
        break;
      }

      case 'connected':
        // Drop resolved annotations that may still be in local storage.
        for (const ann of toolbarStore.get().annotations) {
          if (isTerminalStatus(ann.status)) toolbarStore.deleteAnnotation(ann.id);
        }
        break;

      default:
        break;
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
