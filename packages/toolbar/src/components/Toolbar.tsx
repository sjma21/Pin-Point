import { useState, useRef, useEffect, useCallback } from 'react';
import { C, Z, FONT } from '../theme.js';
import { toolbarStore } from '../state/toolbarState.js';
import { useToolbarState } from '../state/useToolbarState.js';
import { serializeAnnotations } from '../core/markdownSerializer.js';
import { pauseAnimations, resumeAnimations } from '../core/animationController.js';
import { isPendingMarkerStatus } from '../core/annotationStatus.js';
import { LayoutToolbar } from './layout/LayoutToolbar.js';

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

interface Props {
  onCopy?: (md: string) => void;
}

export function Toolbar({ onCopy }: Props) {
  const state = useToolbarState();
  const [copied, setCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const dragRef = useRef({ dragging: false, startMouseX: 0, startMouseY: 0, startX: 0, startY: 0 });
  const [pos, setPos] = useState(() => toolbarStore.get().toolbarPosition);

  // Sync pos when store changes from outside
  useEffect(() => {
    setPos(state.toolbarPosition);
  }, [state.toolbarPosition]);

  // Drag
  const onDragMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragRef.current = { dragging: true, startMouseX: e.clientX, startMouseY: e.clientY, startX: pos.x, startY: pos.y };

    function onMove(ev: MouseEvent) {
      if (!dragRef.current.dragging) return;
      const nx = dragRef.current.startX + ev.clientX - dragRef.current.startMouseX;
      const ny = dragRef.current.startY + ev.clientY - dragRef.current.startMouseY;
      const clampedX = Math.max(0, Math.min(nx, window.innerWidth - 344));
      const clampedY = Math.max(0, Math.min(ny, window.innerHeight - 100));
      setPos({ x: clampedX, y: clampedY });
    }

    function onUp() {
      dragRef.current.dragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      setPos(p => { toolbarStore.saveToolbarPosition(p); return p; });
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [pos]);

  function toggleCapture() {
    const next = state.mode === 'idle' ? 'capturing' : 'idle';
    toolbarStore.set({ mode: next, popupConfig: null });
  }

  function toggleAnimations() {
    if (state.animationsPaused) {
      resumeAnimations();
      toolbarStore.set({ animationsPaused: false });
    } else {
      pauseAnimations();
      toolbarStore.set({ animationsPaused: true });
    }
  }

  async function handleCopy() {
    if (pending.length === 0) return;
    const md = serializeAnnotations(pending, state.settings.detailLevel);
    const ok = await copyToClipboard(md);
    if (ok) {
      setCopied(true);
      onCopy?.(md);
      setTimeout(() => setCopied(false), 2000);
      if (state.settings.clearOnCopy) toolbarStore.clearAnnotations();
    }
  }

  function handleClear() {
    if (!confirmClear) { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000); return; }
    toolbarStore.clearAnnotations();
    setConfirmClear(false);
  }

  const pending = state.annotations.filter(a => isPendingMarkerStatus(a.status));
  const count = pending.length;
  const isCapturing = state.mode === 'capturing';
  const placementCount = state.annotations.filter(a => (a.kind as string) === 'placement').length;
  const rearrangeCount = state.annotations.filter(a => (a.kind as string) === 'rearrange').length;

  const btn = (active: boolean, hue: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
    padding: '5px 10px', borderRadius: 6, cursor: 'pointer', border: 'none',
    fontSize: 12, fontWeight: 600, fontFamily: FONT, whiteSpace: 'nowrap',
    transition: 'all 0.15s',
    background: active ? `${hue}22` : 'transparent',
    color: active ? hue : C.textMuted,
    outline: active ? `1px solid ${hue}55` : 'none',
  });

  return (
    <div
      data-pinpoint="toolbar"
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: Z.toolbar,
        width: 344,
        background: C.bg,
        border: `1px solid ${C.borderLight}`,
        borderRadius: 12,
        boxShadow: '0 4px 32px rgba(0,0,0,0.6)',
        fontFamily: FONT,
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px 6px', borderBottom: `1px solid ${C.border}`,
          cursor: 'grab',
        }}
        onMouseDown={onDragMouseDown}
      >
        <span style={{ color: C.textDim, fontSize: 13, letterSpacing: 3, flexShrink: 0 }}>⣿</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: C.text, letterSpacing: '-0.01em' }}>
          📍 Pinpoint
        </span>
        {count > 0 && (
          <span style={{
            background: C.primary, color: '#fff', fontSize: 10, fontWeight: 800,
            borderRadius: 999, padding: '1px 7px', marginLeft: 2,
          }}>
            {count}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={e => { e.stopPropagation(); toolbarStore.set({ settingsOpen: true }); }}
          style={{ ...btn(state.settingsOpen, C.primary), padding: '3px 8px', fontSize: 14 }}
          title="Settings"
        >
          ⚙
        </button>
      </div>

      {/* Actions row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2,
        padding: '6px 8px',
        flexWrap: 'wrap',
      }}>
        {/* Capture toggle — main action */}
        <button
          onClick={toggleCapture}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 7, cursor: 'pointer', border: 'none',
            fontSize: 12, fontWeight: 700, fontFamily: FONT,
            background: isCapturing ? C.primary : C.surface,
            color: isCapturing ? '#fff' : C.textMuted,
            boxShadow: isCapturing ? `0 0 12px ${C.primary}55` : 'none',
            transition: 'all 0.15s',
            marginRight: 4,
          }}
          title="Toggle capture mode (Cmd+Shift+F)"
        >
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: isCapturing ? '#fff' : C.textDim,
            display: 'inline-block', flexShrink: 0,
            ...(isCapturing ? { boxShadow: '0 0 6px #fff' } : {}),
          }} />
          {isCapturing ? 'Capturing' : 'Capture'}
        </button>

        <button onClick={toggleAnimations} style={btn(state.animationsPaused, C.warning)} title="Pause/resume animations (P)">
          {state.animationsPaused ? '▶' : '⏸'}
        </button>

        <button
          onClick={() => toolbarStore.set({ markersVisible: !state.markersVisible })}
          style={btn(state.markersVisible, C.info)}
          title="Toggle markers (H)"
        >
          {state.markersVisible ? '👁' : '🙈'}
        </button>

        <button
          onClick={handleCopy}
          disabled={count === 0}
          style={{ ...btn(!copied && count > 0, C.success), opacity: count === 0 ? 0.4 : 1 }}
          title="Copy markdown (C)"
        >
          {copied ? '✓ Copied!' : '⧉ Copy'}
        </button>

        <button
          onClick={handleClear}
          disabled={count === 0}
          style={{ ...btn(confirmClear, C.danger), opacity: count === 0 ? 0.4 : 1 }}
          title={confirmClear ? 'Click again to confirm' : 'Clear annotations (X)'}
        >
          {confirmClear ? '⚠ Confirm' : '✕ Clear'}
        </button>

        <button
          onClick={() => toolbarStore.set({ layoutMode: !state.layoutMode })}
          style={btn(state.layoutMode, C.primaryBright)}
          title="Toggle layout mode (L)"
        >
          {state.layoutMode ? '⊠ Layout' : '⬜ Layout'}
        </button>
      </div>

      {/* Layout mode expanded controls */}
      {state.layoutMode && (
        <LayoutToolbar
          placementCount={placementCount}
          rearrangeCount={rearrangeCount}
          wireframeMode={state.wireframeMode}
          wireframeOpacity={state.wireframeOpacity}
          wireframePurpose={state.wireframePurpose}
        />
      )}
    </div>
  );
}
