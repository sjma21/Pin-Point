import type { Annotation, AnnotationStatus } from '@sajalmishra/markpin-shared';
import { C, FONT } from '../theme.js';

interface ThreadMessage {
  id: string;
  role: 'human' | 'agent';
  content: string;
  createdAt: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  open:        { label: 'Open',       color: C.textMuted },
  in_progress: { label: 'In Progress',color: C.warning },
  resolved:    { label: 'Resolved',   color: C.success },
  dismissed:   { label: 'Dismissed',  color: C.textDim },
  wont_fix:    { label: "Won't Fix",  color: C.textDim },
};

interface Props {
  annotation: Annotation;
}

export function ThreadViewer({ annotation }: Props) {
  const meta = (annotation.metadata ?? {}) as Record<string, unknown>;
  const messages = (meta?.thread as ThreadMessage[] | undefined) ?? [];
  const status = annotation.status as AnnotationStatus;
  const statusInfo = STATUS_LABEL[status] ?? STATUS_LABEL['open'];

  if (messages.length === 0) return null;

  return (
    <div style={{ marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 10, fontFamily: FONT,
      }}>
        <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Thread
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '1px 7px',
          borderRadius: 999, background: `${statusInfo.color}22`, color: statusInfo.color,
        }}>
          {statusInfo.label}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'human' ? 'flex-start' : 'flex-end',
          }}>
            <div style={{
              maxWidth: '85%',
              background: msg.role === 'human' ? C.surface : C.primaryFaint,
              border: `1px solid ${msg.role === 'human' ? C.border : C.primary + '55'}`,
              borderRadius: msg.role === 'human' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
              padding: '6px 10px',
              fontSize: 12,
              color: C.text,
              fontFamily: FONT,
              lineHeight: 1.55,
            }}>
              {msg.content}
            </div>
            <span style={{ fontSize: 10, color: C.textDim, marginTop: 2, fontFamily: FONT }}>
              {msg.role === 'agent' ? '🤖 Agent' : '👤 You'} · {new Date(msg.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      {status === 'resolved' && Boolean(meta['resolutionSummary']) && (
        <div style={{
          marginTop: 10, padding: '8px 10px',
          background: C.successFaint, border: `1px solid ${C.success}44`,
          borderRadius: 6, fontSize: 12, color: C.success, fontFamily: FONT,
        }}>
          ✓ {String(meta['resolutionSummary'])}
        </div>
      )}

      {status === 'dismissed' && Boolean(meta['dismissReason']) && (
        <div style={{
          marginTop: 10, padding: '8px 10px',
          background: C.dangerFaint, border: `1px solid ${C.danger}44`,
          borderRadius: 6, fontSize: 12, color: C.textMuted, fontFamily: FONT,
        }}>
          Dismissed: {String(meta['dismissReason'])}
        </div>
      )}
    </div>
  );
}
