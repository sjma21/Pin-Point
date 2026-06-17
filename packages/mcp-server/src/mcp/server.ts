import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { Annotation } from '@pinpoint/shared';
import { AnnotationStatus } from '@pinpoint/shared';
import { annotationStore } from '../store/annotationStore.js';
import { sseManager } from '../http/sseManager.js';

function text(data: unknown): { content: [{ type: 'text'; text: string }] } {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function enrichAnnotation(ann: Annotation): Record<string, unknown> {
  const base = ann as unknown as Record<string, unknown>;
  const kind = ann.kind as string;
  const meta = (ann.metadata ?? {}) as Record<string, unknown>;

  if (kind === 'placement') {
    return {
      ...base,
      layoutContext: {
        componentType: meta['componentType'],
        xPercent: meta['xPercent'],
        yPercent: meta['yPercent'],
        dropWidth: meta['dropWidth'],
        dropHeight: meta['dropHeight'],
        scrollY: meta['scrollY'],
        wireframePurpose: meta['wireframePurpose'] ?? null,
      },
    };
  }

  if (kind === 'rearrange') {
    return {
      ...base,
      layoutContext: {
        sectionLabel: meta['sectionLabel'],
        sectionSelector: meta['sectionSelector'],
        originalIndex: meta['originalIndex'],
        newIndex: meta['newIndex'],
        targetLabel: meta['targetLabel'],
        targetSelector: meta['targetSelector'],
        originalRect: meta['originalRect'],
        currentRect: meta['currentRect'],
      },
    };
  }

  return base;
}

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: 'pinpoint', version: '0.4.0' });

  // 1 ── list all sessions
  server.tool(
    'pinpoint_list_sessions',
    'List all active annotation sessions. Use this to discover which pages have feedback waiting.',
    {},
    async () => {
      const sessions = annotationStore.getAllSessions().map(s => ({
        id: s.id,
        url: s.url,
        status: s.status,
        annotationCount: s.annotations.length,
        pendingCount: annotationStore.getPendingForSession(s.id).length,
        createdAt: s.createdAt,
      }));
      return text(sessions);
    },
  );

  // 2 ── get one session
  server.tool(
    'pinpoint_get_session',
    'Get a session with all its annotations.',
    { sessionId: z.string().describe('Session ID') },
    async ({ sessionId }) => {
      const session = annotationStore.getSession(sessionId);
      if (!session) return text({ error: 'Session not found' });
      return text(session);
    },
  );

  // 3 ── pending for one session
  server.tool(
    'pinpoint_get_pending',
    'Get pending annotations for a session. Includes feedback, placement (new components to add), and rearrange (sections to reorder) annotations. Each annotation has a kind field and a layoutContext field for placement/rearrange kinds.',
    { sessionId: z.string().describe('Session ID') },
    async ({ sessionId }) => {
      const annotations = annotationStore.getPendingForSession(sessionId);
      const enriched = annotations.map(enrichAnnotation);
      const byKind = {
        feedback: enriched.filter(a => a['kind'] !== 'placement' && a['kind'] !== 'rearrange').length,
        placement: enriched.filter(a => a['kind'] === 'placement').length,
        rearrange: enriched.filter(a => a['kind'] === 'rearrange').length,
      };
      return text({ count: enriched.length, byKind, annotations: enriched });
    },
  );

  // 4 ── all pending across all sessions
  server.tool(
    'pinpoint_get_all_pending',
    'Get all pending annotations across all pages. Includes feedback, placement (new components to add), and rearrange (sections to reorder) annotations. Each annotation has a kind field and a layoutContext field for placement/rearrange kinds.',
    {},
    async () => {
      const annotations = annotationStore.getAllPending();
      const enriched = annotations.map(enrichAnnotation);
      const byKind = {
        feedback: enriched.filter(a => a['kind'] !== 'placement' && a['kind'] !== 'rearrange').length,
        placement: enriched.filter(a => a['kind'] === 'placement').length,
        rearrange: enriched.filter(a => a['kind'] === 'rearrange').length,
      };
      return text({ count: enriched.length, byKind, annotations: enriched });
    },
  );

  // 5 ── acknowledge
  server.tool(
    'pinpoint_acknowledge',
    'Mark an annotation as acknowledged so the human knows you have seen their feedback.',
    { annotationId: z.string().describe('Annotation ID') },
    async ({ annotationId }) => {
      const ann = annotationStore.updateAnnotationStatus(annotationId, AnnotationStatus.InProgress);
      if (!ann) return text({ error: 'Annotation not found' });
      sseManager.broadcastToSession(ann.sessionId, 'annotation.updated', { annotation: ann });
      return text({ success: true, annotation: ann });
    },
  );

  // 6 ── resolve
  server.tool(
    'pinpoint_resolve',
    'Mark an annotation as resolved after you have fixed the issue. Include a summary of what you changed.',
    {
      annotationId: z.string().describe('Annotation ID'),
      summary: z.string().optional().describe('Summary of what was changed to resolve the issue'),
    },
    async ({ annotationId, summary }) => {
      const ann = annotationStore.updateAnnotationStatus(annotationId, AnnotationStatus.Resolved, { summary });
      if (!ann) return text({ error: 'Annotation not found' });
      sseManager.broadcastToSession(ann.sessionId, 'annotation.updated', { annotation: ann });
      return text({ success: true, annotation: ann });
    },
  );

  // 7 ── dismiss
  server.tool(
    'pinpoint_dismiss',
    'Dismiss an annotation you will not be addressing, with a reason why.',
    {
      annotationId: z.string().describe('Annotation ID'),
      reason: z.string().describe('Reason for dismissing the annotation'),
    },
    async ({ annotationId, reason }) => {
      const ann = annotationStore.updateAnnotationStatus(annotationId, AnnotationStatus.Dismissed, { reason });
      if (!ann) return text({ error: 'Annotation not found' });
      sseManager.broadcastToSession(ann.sessionId, 'annotation.updated', { annotation: ann });
      return text({ success: true, annotation: ann });
    },
  );

  // 8 ── reply
  server.tool(
    'pinpoint_reply',
    'Reply to an annotation to ask a clarifying question or give the human an update.',
    {
      annotationId: z.string().describe('Annotation ID'),
      message: z.string().describe('Message to add to the annotation thread'),
    },
    async ({ annotationId, message }) => {
      const ann = annotationStore.addThreadMessage(annotationId, message, 'agent');
      if (!ann) return text({ error: 'Annotation not found' });
      sseManager.broadcastToSession(ann.sessionId, 'thread.message', { annotation: ann });
      return text({ success: true, annotation: ann });
    },
  );

  // 9 ── watch (blocking)
  server.tool(
    'pinpoint_watch_annotations',
    'Block until new annotations appear, then return them as a batch. Use this in a loop for hands-free feedback processing.',
    {
      sessionId: z.string().optional().describe('Session ID to watch (omit to watch all sessions)'),
      batchWindowSeconds: z
        .number()
        .min(1)
        .max(60)
        .optional()
        .describe('Seconds to collect more annotations after the first arrives (default: 10)'),
      timeoutSeconds: z
        .number()
        .min(1)
        .max(300)
        .optional()
        .describe('Seconds to wait before returning empty result (default: 120)'),
    },
    async ({ sessionId, batchWindowSeconds = 10, timeoutSeconds = 120 }) => {
      const annotations = await waitForAnnotations(
        sessionId,
        timeoutSeconds * 1000,
        batchWindowSeconds * 1000,
      );
      return text({ count: annotations.length, timedOut: annotations.length === 0, annotations });
    },
  );

  return server;
}

async function waitForAnnotations(
  sessionId: string | undefined,
  timeoutMs: number,
  batchWindowMs: number,
): Promise<Annotation[]> {
  const initialIds = new Set<string>(
    (sessionId
      ? annotationStore.getPendingForSession(sessionId)
      : annotationStore.getAllPending()
    ).map(a => a.id),
  );

  return new Promise<Annotation[]>((resolve) => {
    const batch: Annotation[] = [];
    let batchTimer: ReturnType<typeof setTimeout> | null = null;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      if (batchTimer) clearTimeout(batchTimer);
      clearTimeout(timeoutTimer);
      unsubscribe();
      resolve(batch);
    };

    const unsubscribe = annotationStore.subscribe(() => {
      if (done) return;
      const current = sessionId
        ? annotationStore.getPendingForSession(sessionId)
        : annotationStore.getAllPending();

      for (const ann of current) {
        if (!initialIds.has(ann.id)) {
          initialIds.add(ann.id);
          batch.push(ann);
        }
      }

      if (batch.length > 0 && !batchTimer) {
        batchTimer = setTimeout(finish, batchWindowMs);
      }
    });

    const timeoutTimer = setTimeout(finish, timeoutMs);
  });
}
