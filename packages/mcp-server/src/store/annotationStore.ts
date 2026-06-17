import type { Session, Annotation } from '@pinpoint/shared';
import { AnnotationStatus, SessionStatus } from '@pinpoint/shared';
import { generateId, now } from '@pinpoint/shared';

export type StoreListener = () => void;

interface ThreadMessage {
  id: string;
  role: 'agent' | 'human';
  content: string;
  createdAt: string;
}

class AnnotationStore {
  private sessions = new Map<string, Session>();
  private listeners = new Set<StoreListener>();
  private _sequence = 0;

  get sequence(): number { return this._sequence; }

  private notify(): void {
    this._sequence++;
    for (const fn of this.listeners) fn();
  }

  subscribe(fn: StoreListener): () => void {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  // ─── Session operations ───────────────────────────────────────────────────────

  createSession(url: string): Session {
    const id = generateId('sess');
    const ts = now();
    const session: Session = {
      id,
      createdAt: ts,
      updatedAt: ts,
      status: SessionStatus.Active,
      url,
      annotations: [],
    };
    this.sessions.set(id, session);
    this.notify();
    return session;
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  getAllSessions(): Session[] {
    return [...this.sessions.values()];
  }

  updateSessionStatus(id: string, status: SessionStatus): Session | undefined {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    session.status = status;
    session.updatedAt = now();
    this.notify();
    return session;
  }

  // ─── Annotation operations ────────────────────────────────────────────────────

  addAnnotation(sessionId: string, annotation: Annotation): Annotation | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    const ann: Annotation = { ...annotation, sessionId };
    session.annotations.push(ann);
    session.updatedAt = now();
    this.notify();
    return ann;
  }

  private findAnnotation(annotationId: string): { ann: Annotation; session: Session } | undefined {
    for (const session of this.sessions.values()) {
      const ann = session.annotations.find(a => a.id === annotationId);
      if (ann) return { ann, session };
    }
    return undefined;
  }

  getAnnotation(annotationId: string): Annotation | undefined {
    return this.findAnnotation(annotationId)?.ann;
  }

  getAnnotationsForSession(sessionId: string): Annotation[] {
    return this.sessions.get(sessionId)?.annotations ?? [];
  }

  getPendingForSession(sessionId: string): Annotation[] {
    return (this.sessions.get(sessionId)?.annotations ?? []).filter(
      a => a.status === AnnotationStatus.Open || a.status === AnnotationStatus.InProgress,
    );
  }

  getAllPending(): Annotation[] {
    const result: Annotation[] = [];
    for (const session of this.sessions.values()) {
      for (const ann of session.annotations) {
        if (ann.status === AnnotationStatus.Open || ann.status === AnnotationStatus.InProgress) {
          result.push(ann);
        }
      }
    }
    return result;
  }

  updateAnnotationStatus(
    annotationId: string,
    status: AnnotationStatus,
    extra?: { summary?: string; reason?: string },
  ): Annotation | undefined {
    const found = this.findAnnotation(annotationId);
    if (!found) return undefined;
    const { ann } = found;
    ann.status = status;
    ann.updatedAt = now();
    if (status === AnnotationStatus.Resolved) {
      ann.resolvedAt = now();
      if (extra?.summary) {
        ann.metadata = { ...ann.metadata, resolutionSummary: extra.summary };
      }
    }
    if (status === AnnotationStatus.Dismissed && extra?.reason) {
      ann.metadata = { ...ann.metadata, dismissReason: extra.reason };
    }
    this.notify();
    return ann;
  }

  addThreadMessage(
    annotationId: string,
    message: string,
    role: 'agent' | 'human',
  ): Annotation | undefined {
    const found = this.findAnnotation(annotationId);
    if (!found) return undefined;
    const { ann } = found;
    const msg: ThreadMessage = {
      id: generateId('msg'),
      role,
      content: message,
      createdAt: now(),
    };
    const existing = (ann.metadata?.thread as ThreadMessage[] | undefined) ?? [];
    ann.metadata = { ...ann.metadata, thread: [...existing, msg] };
    ann.updatedAt = now();
    this.notify();
    return ann;
  }

  deleteAnnotation(annotationId: string): { sessionId: string } | undefined {
    for (const session of this.sessions.values()) {
      const idx = session.annotations.findIndex(a => a.id === annotationId);
      if (idx !== -1) {
        session.annotations.splice(idx, 1);
        session.updatedAt = now();
        this.notify();
        return { sessionId: session.id };
      }
    }
    return undefined;
  }

  getTotalAnnotationCount(): number {
    let count = 0;
    for (const session of this.sessions.values()) count += session.annotations.length;
    return count;
  }
}

export const annotationStore = new AnnotationStore();
