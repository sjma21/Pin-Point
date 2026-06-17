import { useState, useEffect, useReducer } from 'react';
import type { Annotation, AnnotationStatus } from '@pinpoint/shared';
import { C, Z, FONT } from '../theme.js';
import { toolbarStore } from '../state/toolbarState.js';
import { INTENT_META } from '../theme.js';

// ─── Layout annotation markers ────────────────────────────────────────────────

function PlacementMarker({ annotation, index }: { annotation: Annotation; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [, tick] = useReducer(n => n + 1, 0);

  useEffect(() => {
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick, { passive: true });
    return () => { window.removeEventListener('scroll', tick); window.removeEventListener('resize', tick); };
  }, []);

  const bb = annotation.target.boundingBox;
  if (!bb) return null;

  const meta = (annotation.metadata ?? {}) as Record<string, unknown>;
  const isFixed = meta.isFixed === true;
  const viewX = isFixed ? bb.x : bb.x - window.scrollX;
  const viewY = isFixed ? bb.y : bb.y - window.scrollY;
  const componentType = typeof meta.componentType === 'string' ? meta.componentType : 'Component';

  if (viewX < -40 || viewY < -40 || viewX > window.innerWidth + 40 || viewY > window.innerHeight + 40) {
    return null;
  }

  return (
    <div
      data-pinpoint="marker"
      data-kind="placement"
      style={{
        position: 'fixed',
        left: viewX + bb.width / 2 - 16,
        top: viewY - 16,
        zIndex: Z.markers,
        pointerEvents: 'auto',
        cursor: 'pointer',
      }}
      onClick={e => { e.stopPropagation(); toolbarStore.deleteAnnotation(annotation.id); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Diamond shape */}
      <div style={{
        width: 26, height: 26,
        background: C.success,
        border: '2px solid rgba(255,255,255,0.9)',
        boxShadow: `0 0 0 2px ${C.successFaint}, 0 2px 8px rgba(0,0,0,0.4)`,
        transform: hovered ? 'rotate(45deg) scale(1.2)' : 'rotate(45deg)',
        transition: 'transform 0.15s, box-shadow 0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ transform: 'rotate(-45deg)', fontSize: 10, fontWeight: 800, color: '#fff', fontFamily: FONT }}>
          {index}
        </span>
      </div>

      {hovered && (
        <div
          data-pinpoint="marker-tooltip"
          style={{
            position: 'absolute', bottom: '100%', left: '50%',
            transform: 'translateX(-50%)', marginBottom: 8,
            background: C.bg, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: '8px 12px', width: 200,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            zIndex: Z.markerTooltip, pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 11, color: C.success, fontWeight: 700, fontFamily: FONT, marginBottom: 4 }}>
            ⬜ Placement #{index}
          </div>
          <div style={{ fontSize: 12, color: C.text, fontFamily: FONT }}>{componentType}</div>
          <div style={{ fontSize: 10, color: C.textDim, fontFamily: FONT, marginTop: 6 }}>Click to remove</div>
        </div>
      )}
    </div>
  );
}

function RearrangeMarker({ annotation, index }: { annotation: Annotation; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [, tick] = useReducer(n => n + 1, 0);

  useEffect(() => {
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick, { passive: true });
    return () => { window.removeEventListener('scroll', tick); window.removeEventListener('resize', tick); };
  }, []);

  const bb = annotation.target.boundingBox;
  if (!bb) return null;

  const meta = (annotation.metadata ?? {}) as Record<string, unknown>;
  const isFixed = meta.isFixed === true;
  const viewX = isFixed ? bb.x : bb.x - window.scrollX;
  const viewY = isFixed ? bb.y : bb.y - window.scrollY;

  if (viewX < -40 || viewY < -40 || viewX > window.innerWidth + 40 || viewY > window.innerHeight + 40) {
    return null;
  }

  return (
    <div
      data-pinpoint="marker"
      data-kind="rearrange"
      style={{
        position: 'fixed',
        left: viewX + bb.width / 2 - 16,
        top: viewY - 16,
        zIndex: Z.markers,
        pointerEvents: 'auto',
        cursor: 'pointer',
      }}
      onClick={e => { e.stopPropagation(); toolbarStore.deleteAnnotation(annotation.id); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Arrow/move badge */}
      <div style={{
        width: 28, height: 28,
        background: C.primary,
        border: '2px solid rgba(255,255,255,0.9)',
        boxShadow: `0 0 0 2px ${C.primaryFaint}, 0 2px 8px rgba(0,0,0,0.4)`,
        borderRadius: 6,
        transform: hovered ? 'scale(1.2)' : 'scale(1)',
        transition: 'transform 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 13, color: '#fff', lineHeight: 1 }}>⇅</span>
      </div>

      {hovered && (
        <div
          data-pinpoint="marker-tooltip"
          style={{
            position: 'absolute', bottom: '100%', left: '50%',
            transform: 'translateX(-50%)', marginBottom: 8,
            background: C.bg, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: '8px 12px', width: 220,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            zIndex: Z.markerTooltip, pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 11, color: C.primaryBright, fontWeight: 700, fontFamily: FONT, marginBottom: 4 }}>
            ⇅ Rearrange #{index}
          </div>
          <div style={{ fontSize: 12, color: C.text, fontFamily: FONT, lineHeight: 1.5 }}>
            {annotation.comment}
          </div>
          <div style={{ fontSize: 10, color: C.textDim, fontFamily: FONT, marginTop: 6 }}>Click to remove</div>
        </div>
      )}
    </div>
  );
}

interface Props {
  annotation: Annotation;
  index: number;
  color: string;
}

const STATUS_STYLE: Record<string, { pinColor: string; label: string; opacity: number }> = {
  open:        { pinColor: '', label: 'Open', opacity: 1 },
  in_progress: { pinColor: C.warning, label: 'In Progress', opacity: 1 },
  resolved:    { pinColor: C.success, label: 'Resolved', opacity: 0.85 },
  dismissed:   { pinColor: C.textDim, label: 'Dismissed', opacity: 0.5 },
  wont_fix:    { pinColor: C.textDim, label: "Won't Fix", opacity: 0.5 },
};

export function MarkerPin({ annotation, index, color }: Props) {
  const kind = annotation.kind as string;
  if (kind === 'placement') return <PlacementMarker annotation={annotation} index={index} />;
  if (kind === 'rearrange') return <RearrangeMarker annotation={annotation} index={index} />;

  const [hovered, setHovered] = useState(false);
  const [, tick] = useReducer(n => n + 1, 0);

  useEffect(() => {
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick, { passive: true });
    return () => {
      window.removeEventListener('scroll', tick);
      window.removeEventListener('resize', tick);
    };
  }, []);

  const bb = annotation.target.boundingBox;
  if (!bb) return null;

  const meta = annotation.metadata as Record<string, unknown> | undefined;
  const isFixed = meta?.isFixed === true;

  const viewX = isFixed ? bb.x : bb.x - window.scrollX;
  const viewY = isFixed ? bb.y : bb.y - window.scrollY;

  if (viewX < -20 || viewY < -20 || viewX > window.innerWidth + 20 || viewY > window.innerHeight + 20) {
    return null;
  }

  const intentInfo = INTENT_META[annotation.intent] ?? INTENT_META['note'];
  const meta2 = (annotation.metadata ?? {}) as Record<string, unknown>;
  const hasThread = Array.isArray(meta2['thread']) && (meta2['thread'] as unknown[]).length > 0;
  const status = annotation.status as AnnotationStatus;
  const statusStyle = STATUS_STYLE[status] ?? STATUS_STYLE['open'];
  const pinColor = statusStyle.pinColor || color;
  const isResolved = status === 'resolved';
  const resolutionSummary = typeof meta2['resolutionSummary'] === 'string'
    ? meta2['resolutionSummary']
    : '';

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    toolbarStore.deleteAnnotation(annotation.id);
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const halfW = bb!.width / 2;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const halfH = bb!.height / 2;
    toolbarStore.set({
      popupConfig: {
        element: document.elementFromPoint(viewX + halfW, viewY + halfH) ?? document.body,
        clientX: viewX,
        clientY: viewY,
        editAnnotationId: annotation.id,
      },
    });
  }

  return (
    <div
      data-pinpoint="marker"
      data-status={status}
      style={{
        position: 'fixed',
        left: viewX + bb.width / 2 - 14,
        top: viewY - 14,
        zIndex: Z.markers,
        pointerEvents: 'auto',
        cursor: 'pointer',
        opacity: statusStyle.opacity,
        transition: 'opacity 0.25s ease',
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: 28,
        height: 28,
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)',
        background: pinColor,
        border: `2px solid ${isResolved ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.9)'}`,
        boxShadow: isResolved
          ? `0 0 0 2px ${C.successFaint}, 0 2px 8px rgba(0,0,0,0.4)`
          : '0 2px 8px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.15s, box-shadow 0.25s, background 0.25s',
        ...(hovered ? { transform: 'rotate(-45deg) scale(1.2)', boxShadow: '0 4px 14px rgba(0,0,0,0.5)' } : {}),
      }}>
        <span style={{
          transform: 'rotate(45deg)',
          fontSize: isResolved ? 13 : 11,
          fontWeight: 800,
          color: '#fff',
          fontFamily: FONT,
          lineHeight: 1,
        }}>
          {isResolved ? '✓' : index}
        </span>
      </div>

      {hasThread && (
        <div style={{
          position: 'absolute',
          top: -4,
          right: -4,
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: C.success,
          border: '1.5px solid #fff',
        }} />
      )}

      {hovered && (
        <div
          data-pinpoint="marker-tooltip"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 8,
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '8px 12px',
            width: 220,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            zIndex: Z.markerTooltip,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 11, color: intentInfo.color, fontWeight: 700, fontFamily: FONT, marginBottom: 4 }}>
            {intentInfo.label}
            <span style={{ color: statusStyle.pinColor || C.textMuted, marginLeft: 6 }}>
              · {statusStyle.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: C.text, fontFamily: FONT, lineHeight: 1.5 }}>
            {annotation.comment.slice(0, 100)}{annotation.comment.length > 100 ? '…' : ''}
          </div>
          {isResolved && resolutionSummary && (
            <div style={{ fontSize: 11, color: C.success, fontFamily: FONT, marginTop: 6, lineHeight: 1.4 }}>
              {resolutionSummary}
            </div>
          )}
          <div style={{ fontSize: 10, color: C.textDim, fontFamily: FONT, marginTop: 6 }}>
            Click to remove · Right-click to edit
          </div>
        </div>
      )}
    </div>
  );
}
