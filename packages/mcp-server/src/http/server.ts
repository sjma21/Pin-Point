import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { stream } from 'hono/streaming';
import type { Annotation } from '@pinpoint/shared';
import { AnnotationStatus } from '@pinpoint/shared';
import { annotationStore } from '../store/annotationStore.js';
import { sseManager } from './sseManager.js';

export function createHttpServer(): Hono {
  const app = new Hono();

  app.use('*', cors());

  // ─── Health ───────────────────────────────────────────────────────────────────

  app.get('/health', (c) => {
    return c.json({
      status: 'ok',
      version: '0.4.0',
      sessions: annotationStore.getAllSessions().length,
      annotations: annotationStore.getTotalAnnotationCount(),
    });
  });

  // ─── Sessions ─────────────────────────────────────────────────────────────────

  app.post('/sessions', async (c) => {
    const body = await c.req.json<{ url?: string }>();
    if (!body.url) return c.json({ error: 'url is required' }, 400);
    const session = annotationStore.createSession(body.url);
    return c.json(session, 201);
  });

  app.get('/sessions', (c) => {
    return c.json(annotationStore.getAllSessions());
  });

  app.get('/sessions/:id', (c) => {
    const session = annotationStore.getSession(c.req.param('id'));
    if (!session) return c.json({ error: 'Session not found' }, 404);
    return c.json(session);
  });

  app.get('/sessions/:id/pending', (c) => {
    const sessionId = c.req.param('id');
    if (!annotationStore.getSession(sessionId)) return c.json({ error: 'Session not found' }, 404);
    const annotations = annotationStore.getPendingForSession(sessionId);
    return c.json({ count: annotations.length, annotations });
  });

  // ─── Annotations CRUD ─────────────────────────────────────────────────────────

  app.post('/sessions/:id/annotations', async (c) => {
    const sessionId = c.req.param('id');
    if (!annotationStore.getSession(sessionId)) return c.json({ error: 'Session not found' }, 404);

    const body = await c.req.json<Annotation>();
    const saved = annotationStore.addAnnotation(sessionId, body);
    if (!saved) return c.json({ error: 'Failed to save annotation' }, 500);

    sseManager.broadcastToSession(sessionId, 'annotation.created', { annotation: saved });
    return c.json(saved, 201);
  });

  app.patch('/annotations/:id', async (c) => {
    const body = await c.req.json<{ status: string; summary?: string; reason?: string }>();
    const statusMap: Record<string, AnnotationStatus> = {
      open: AnnotationStatus.Open,
      in_progress: AnnotationStatus.InProgress,
      resolved: AnnotationStatus.Resolved,
      dismissed: AnnotationStatus.Dismissed,
      wont_fix: AnnotationStatus.WontFix,
    };
    const status = statusMap[body.status];
    if (!status) return c.json({ error: 'Invalid status' }, 400);

    const updated = annotationStore.updateAnnotationStatus(c.req.param('id'), status, {
      summary: body.summary,
      reason: body.reason,
    });
    if (!updated) return c.json({ error: 'Annotation not found' }, 404);

    sseManager.broadcastToSession(updated.sessionId, 'annotation.updated', { annotation: updated });
    return c.json(updated);
  });

  app.post('/annotations/:id/reply', async (c) => {
    const body = await c.req.json<{ message: string; role?: 'agent' | 'human' }>();
    if (!body.message) return c.json({ error: 'message is required' }, 400);

    const updated = annotationStore.addThreadMessage(
      c.req.param('id'),
      body.message,
      body.role ?? 'agent',
    );
    if (!updated) return c.json({ error: 'Annotation not found' }, 404);

    sseManager.broadcastToSession(updated.sessionId, 'thread.message', { annotation: updated });
    return c.json(updated);
  });

  app.delete('/annotations/:id', (c) => {
    const result = annotationStore.deleteAnnotation(c.req.param('id'));
    if (!result) return c.json({ error: 'Annotation not found' }, 404);

    sseManager.broadcastToSession(result.sessionId, 'annotation.deleted', {
      annotationId: c.req.param('id'),
      sessionId: result.sessionId,
    });
    return c.json({ success: true });
  });

  // ─── SSE stream ───────────────────────────────────────────────────────────────

  app.get('/sessions/:id/events', (c) => {
    const sessionId = c.req.param('id');
    if (!annotationStore.getSession(sessionId)) {
      return c.json({ error: 'Session not found' }, 404);
    }

    c.header('Content-Type', 'text/event-stream');
    c.header('Cache-Control', 'no-cache');
    c.header('X-Accel-Buffering', 'no');

    return stream(c, async (s) => {
      const pending: string[] = [];
      let wakeUp: (() => void) | null = null;

      const enqueue = (data: string): void => {
        if (s.closed || s.aborted) return;
        pending.push(data);
        wakeUp?.();
      };

      const connId = sseManager.register(sessionId, enqueue);

      // Keepalive ping every 30 s
      const pingTimer = setInterval(() => enqueue(': ping\n\n'), 30_000);

      s.onAbort(() => {
        clearInterval(pingTimer);
        sseManager.remove(connId);
        wakeUp?.(); // wake the loop so it can exit
      });

      // Send initial state
      const sess = annotationStore.getSession(sessionId);
      enqueue(
        `data: ${JSON.stringify({ type: 'connected', sessionId, annotations: sess?.annotations ?? [] })}\n\n`,
      );

      // Drain loop — exits when stream is aborted or closed
      while (!s.closed && !s.aborted) {
        if (pending.length > 0) {
          await s.write(pending.shift()!);
        } else {
          await new Promise<void>(r => { wakeUp = r; });
          wakeUp = null;
        }
      }

      clearInterval(pingTimer);
      sseManager.remove(connId);
    });
  });

  return app;
}
