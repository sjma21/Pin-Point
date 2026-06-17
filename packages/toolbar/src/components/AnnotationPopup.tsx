import { useState, useMemo, useEffect, useRef } from 'react';
import type { Annotation } from '@pinpoint/shared';
import { AnnotationIntent, AnnotationSeverity, now } from '@pinpoint/shared';
import { C, Z, FONT, INTENT_META, SEVERITY_META } from '../theme.js';
import { toolbarStore, type PopupConfig } from '../state/toolbarState.js';
import { buildAnnotation } from '../core/annotationBuilder.js';
import { generateSelector } from '../core/selectorGenerator.js';
import { traverseFiber } from '../core/fiberTraverser.js';
import { detectSourceFile } from '../core/sourceFileDetector.js';
import { ThreadViewer } from './ThreadViewer.js';

interface Props {
  config: PopupConfig;
  onAnnotationAdd?: (ann: Annotation) => void;
  sessionId: string;
  annotationCount: number;
}

function calcPosition(el: Element, popH: number, popW: number) {
  const r = el.getBoundingClientRect();
  const spaceBelow = window.innerHeight - r.bottom;
  const showAbove = spaceBelow < popH + 16 && r.top > popH + 16;
  let top = showAbove ? r.top - popH - 10 : r.bottom + 10;
  let left = r.left;
  top  = Math.max(8, Math.min(top,  window.innerHeight - popH - 8));
  left = Math.max(8, Math.min(left, window.innerWidth  - popW - 8));
  return { top, left };
}

export function AnnotationPopup({ config, onAnnotationAdd, sessionId, annotationCount }: Props) {
  const isEdit = Boolean(config.editAnnotationId);
  const existingAnn = isEdit
    ? toolbarStore.get().annotations.find(a => a.id === config.editAnnotationId)
    : undefined;

  const [comment, setComment] = useState(existingAnn?.comment ?? '');
  const [intent, setIntent] = useState<AnnotationIntent>(
    existingAnn?.intent ?? toolbarStore.get().settings.defaultIntent,
  );
  const [severity, setSeverity] = useState<AnnotationSeverity>(
    existingAnn?.severity ?? toolbarStore.get().settings.defaultSeverity,
  );
  const [stylesOpen, setStylesOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  const elementInfo = useMemo(() => {
    const { selector } = generateSelector(config.element);
    const fiber = traverseFiber(config.element, 'filtered');
    const source = detectSourceFile(config.element);
    const tag = config.element.tagName.toLowerCase();
    const cls = Array.from(config.element.classList).slice(0, 4).join(' ');
    const cs = window.getComputedStyle(config.element);
    const styles: Record<string, string> = {};
    for (const k of ['color','background','fontSize','padding','borderRadius','display','position','width','height']) {
      const v = cs.getPropertyValue(k === 'fontSize' ? 'font-size' : k === 'borderRadius' ? 'border-radius' : k);
      if (v) styles[k] = v;
    }
    return { selector, fiber, source, tag, cls, styles };
  }, [config.element]);

  const POP_H = 540;
  const POP_W = 370;
  const { top, left } = useMemo(
    () => calcPosition(config.element, POP_H, POP_W),
    [config.element],
  );

  function handleSubmit() {
    if (!comment.trim()) return;
    if (isEdit && existingAnn) {
      const updated: Annotation = { ...existingAnn, comment: comment.trim(), intent, severity, updatedAt: now() };
      toolbarStore.updateAnnotation(updated);
    } else {
      const ann = buildAnnotation({
        element: config.element,
        options: {
          sessionId,
          comment: comment.trim(),
          intent,
          severity,
          index: annotationCount + 1,
        },
      });
      toolbarStore.addAnnotation(ann);
      onAnnotationAdd?.(ann);
    }
    toolbarStore.set({ popupConfig: null });
  }

  function handleDelete() {
    if (existingAnn) toolbarStore.deleteAnnotation(existingAnn.id);
    toolbarStore.set({ popupConfig: null });
  }

  const row: React.CSSProperties = { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 };
  const chip = (active: boolean, activeColor: string, activeFaint: string): React.CSSProperties => ({
    padding: '4px 10px', fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: 'pointer',
    fontFamily: FONT, border: 'none',
    background: active ? activeFaint : C.surface,
    color: active ? activeColor : C.textMuted,
    outline: active ? `1.5px solid ${activeColor}55` : `1px solid ${C.border}`,
    transition: 'all 0.12s',
  });

  return (
    <div
      data-pinpoint="popup"
      style={{
        position: 'fixed',
        top,
        left,
        width: POP_W,
        maxHeight: POP_H,
        zIndex: Z.popup,
        background: C.bg,
        border: `1px solid ${C.borderLight}`,
        borderRadius: 12,
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{
        padding: '12px 14px 10px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
          {isEdit ? '✏️ Edit annotation' : '📍 New annotation'}
        </span>
        <button
          onClick={() => toolbarStore.set({ popupConfig: null })}
          style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 16, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Element info */}
        <div style={{
          background: C.surface, borderRadius: 8, padding: '8px 10px', marginBottom: 12,
          border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 3 }}>
            {'<'}{elementInfo.tag}{'>'}{elementInfo.cls ? ` .${elementInfo.cls.replace(/\s+/g, ' .')}` : ''}
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: elementInfo.fiber.found || elementInfo.source ? 4 : 0 }}>
            {elementInfo.selector}
          </div>
          {elementInfo.fiber.found && toolbarStore.get().settings.showReactComponents && (
            <div style={{ fontSize: 11, color: C.info, marginTop: 3 }}>
              ⚛ {elementInfo.fiber.componentHierarchy}
            </div>
          )}
          {elementInfo.source && (
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
              📁 {elementInfo.source.formatted}
            </div>
          )}
          <button
            onClick={() => setStylesOpen(v => !v)}
            style={{ background: 'none', border: 'none', color: C.textDim, fontSize: 11, cursor: 'pointer', padding: '4px 0 0', fontFamily: FONT }}
          >
            {stylesOpen ? '▾' : '▸'} Computed styles
          </button>
          {stylesOpen && (
            <div style={{ marginTop: 4 }}>
              {Object.entries(elementInfo.styles).map(([k, v]) => (
                <div key={k} style={{ fontSize: 10, color: C.textDim, fontFamily: 'monospace' }}>
                  {k}: {v}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Intent */}
        <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Intent
        </div>
        <div style={row}>
          {Object.values(AnnotationIntent).map(v => {
            const m = INTENT_META[v];
            if (!m) return null;
            return (
              <button key={v} onClick={() => setIntent(v)} style={chip(intent === v, m.color, m.faint)}>
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Severity */}
        <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 5, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Severity
        </div>
        <div style={row}>
          {Object.values(AnnotationSeverity).map(v => {
            const m = SEVERITY_META[v];
            if (!m) return null;
            return (
              <button key={v} onClick={() => setSeverity(v)} style={chip(severity === v, m.color, m.faint)}>
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Comment */}
        <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 5, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Comment
        </div>
        <textarea
          ref={textareaRef}
          value={comment}
          onChange={e => {
            setComment(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          placeholder="Describe the issue or feedback…"
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box', resize: 'none', overflow: 'hidden',
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7,
            color: C.text, fontSize: 13, fontFamily: FONT, padding: '8px 10px',
            lineHeight: 1.55, outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => (e.target.style.borderColor = C.primary)}
          onBlur={e => (e.target.style.borderColor = C.border)}
        />

        {/* Thread viewer for edit mode */}
        {isEdit && existingAnn && <ThreadViewer annotation={existingAnn} />}
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 14px',
        borderTop: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
      }}>
        <div>
          {isEdit && (
            <button
              onClick={handleDelete}
              style={{
                background: C.dangerFaint, border: `1px solid ${C.danger}44`, color: C.danger,
                borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
              }}
            >
              Delete
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => toolbarStore.set({ popupConfig: null })}
            style={{
              background: 'none', border: `1px solid ${C.border}`, color: C.textMuted,
              borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!comment.trim()}
            style={{
              background: comment.trim() ? C.primary : C.surface,
              border: 'none', color: comment.trim() ? '#fff' : C.textDim,
              borderRadius: 6, padding: '6px 16px', fontSize: 12, fontWeight: 700,
              cursor: comment.trim() ? 'pointer' : 'not-allowed', fontFamily: FONT,
              transition: 'background 0.15s',
            }}
          >
            {isEdit ? '✓ Update' : '✓ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
