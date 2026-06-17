import { useState, useEffect, useReducer } from 'react';
import type { Annotation } from '@pinpoint/shared';
import { C, Z, FONT } from '../theme.js';
import { toolbarStore } from '../state/toolbarState.js';
import { INTENT_META } from '../theme.js';

interface Props {
  annotation: Annotation;
  index: number;
  color: string;
}

export function MarkerPin({ annotation, index, color }: Props) {
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
      style={{
        position: 'fixed',
        left: viewX + bb.width / 2 - 14,
        top: viewY - 14,
        zIndex: Z.markers,
        pointerEvents: 'auto',
        cursor: 'pointer',
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
        background: color,
        border: '2px solid rgba(255,255,255,0.9)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.15s, box-shadow 0.15s',
        ...(hovered ? { transform: 'rotate(-45deg) scale(1.2)', boxShadow: '0 4px 14px rgba(0,0,0,0.5)' } : {}),
      }}>
        <span style={{
          transform: 'rotate(45deg)',
          fontSize: 11,
          fontWeight: 800,
          color: '#fff',
          fontFamily: FONT,
          lineHeight: 1,
        }}>
          {index}
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
          </div>
          <div style={{ fontSize: 12, color: C.text, fontFamily: FONT, lineHeight: 1.5 }}>
            {annotation.comment.slice(0, 100)}{annotation.comment.length > 100 ? '…' : ''}
          </div>
          <div style={{ fontSize: 10, color: C.textDim, fontFamily: FONT, marginTop: 6 }}>
            Click to remove · Right-click to edit
          </div>
        </div>
      )}
    </div>
  );
}
