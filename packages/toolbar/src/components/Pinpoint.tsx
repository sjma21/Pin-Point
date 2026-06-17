import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Annotation } from '@pinpoint/shared';
import { FONT, Z } from '../theme.js';
import { toolbarStore } from '../state/toolbarState.js';
import { useToolbarState } from '../state/useToolbarState.js';
import { serializeAnnotations } from '../core/markdownSerializer.js';
import { pauseAnimations, resumeAnimations } from '../core/animationController.js';
import { Toolbar } from './Toolbar.js';
import { AnnotationPopup } from './AnnotationPopup.js';
import { MarkerPin } from './MarkerPin.js';
import { HighlightOverlay } from './HighlightOverlay.js';
import { AreaSelectionOverlay } from './AreaSelectionOverlay.js';
import { SettingsPanel } from './SettingsPanel.js';

export interface PinpointProps {
  endpoint?: string;
  sessionId?: string;
  onAnnotationAdd?: (annotation: Annotation) => void;
  onAnnotationDelete?: (annotation: Annotation) => void;
  onAnnotationsClear?: () => void;
  onCopy?: (markdown: string) => void;
  onSessionCreated?: (sessionId: string) => void;
}

function isTyping(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === 'input' || tag === 'textarea' || tag === 'select' ||
    (el as HTMLElement).isContentEditable
  );
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  } catch { /* ignore */ }
}

export function Pinpoint({
  endpoint,
  sessionId: externalSessionId,
  onAnnotationAdd,
  onAnnotationDelete,
  onAnnotationsClear,
  onCopy,
  onSessionCreated,
}: PinpointProps) {
  const state = useToolbarState();
  const stateRef = useRef(state);
  const captureOverlayRef = useRef<HTMLDivElement>(null);
  const hoveredElRef = useRef<Element | null>(null);

  // Keep stateRef current for keyboard handler (avoids stale closures)
  useEffect(() => { stateRef.current = state; }, [state]);

  // Sync external sessionId / endpoint into store
  useEffect(() => {
    if (externalSessionId) toolbarStore.set({ sessionId: externalSessionId });
  }, [externalSessionId]);

  useEffect(() => {
    if (endpoint) toolbarStore.updateSettings({ serverUrl: endpoint });
  }, [endpoint]);

  // Emit sessionCreated on mount
  useEffect(() => {
    const { sessionId } = toolbarStore.get();
    onSessionCreated?.(sessionId);
  }, [onSessionCreated]);

  // Wire deletion & clear callbacks to store changes
  useEffect(() => {
    if (!onAnnotationDelete && !onAnnotationsClear) return;
    return toolbarStore.subscribe((s) => {
      void s; // handler is on event bus, not here — included for completeness
    });
  }, [onAnnotationDelete, onAnnotationsClear]);

  // Layout mode — inject / remove CSS outline overlay
  useEffect(() => {
    if (!state.layoutMode) return;
    const style = document.createElement('style');
    style.id = '__pp_layout';
    style.textContent = `
      *:not([data-pinpoint] *):not([data-pinpoint]) {
        outline: 1px solid rgba(99,102,241,0.18) !important;
      }
      div:not([data-pinpoint] *), section:not([data-pinpoint] *), main:not([data-pinpoint] *),
      article:not([data-pinpoint] *), aside:not([data-pinpoint] *), header:not([data-pinpoint] *),
      footer:not([data-pinpoint] *), nav:not([data-pinpoint] *) {
        outline: 1px solid rgba(99,102,241,0.32) !important;
      }
    `;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, [state.layoutMode]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTyping()) return;
      const s = stateRef.current;
      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        toolbarStore.set({ mode: s.mode === 'idle' ? 'capturing' : 'idle', popupConfig: null });
        return;
      }

      if (e.key === 'Escape') {
        if (s.popupConfig) toolbarStore.set({ popupConfig: null });
        else if (s.settingsOpen) toolbarStore.set({ settingsOpen: false });
        else if (s.mode !== 'idle') toolbarStore.set({ mode: 'idle' });
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'p':
          if (s.animationsPaused) { resumeAnimations(); toolbarStore.set({ animationsPaused: false }); }
          else { pauseAnimations(); toolbarStore.set({ animationsPaused: true }); }
          break;
        case 'h':
          toolbarStore.set({ markersVisible: !s.markersVisible });
          break;
        case 'c': {
          if (s.annotations.length === 0) return;
          const md = serializeAnnotations(s.annotations, s.settings.detailLevel);
          copyToClipboard(md).then(() => {
            onCopy?.(md);
            if (s.settings.clearOnCopy) toolbarStore.clearAnnotations();
          });
          break;
        }
        case 'x':
          toolbarStore.clearAnnotations();
          onAnnotationsClear?.();
          break;
        case 'l':
          toolbarStore.set({ layoutMode: !s.layoutMode });
          break;
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCopy, onAnnotationsClear]);

  // Capture overlay click — find underlying element + open popup
  const handleCaptureClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const el = hoveredElRef.current;
    if (!el) return;
    toolbarStore.set({
      popupConfig: { element: el, clientX: e.clientX, clientY: e.clientY },
    });
  }, []);

  // Track hovered element under the capture overlay
  const handleCaptureMouseMove = useCallback((e: React.MouseEvent) => {
    const all = document.elementsFromPoint(e.clientX, e.clientY);
    const target = all.find(
      el => el !== captureOverlayRef.current && !el.closest('[data-pinpoint]'),
    );
    hoveredElRef.current = target ?? null;
  }, []);

  // Area selection callback
  const handleAreaSelection = useCallback(() => {
    toolbarStore.set({ mode: 'idle' });
  }, []);

  // Portal root — created once via useState (stable ref across StrictMode remounts),
  // mounted/unmounted via useEffect so it survives the StrictMode unmount→remount cycle.
  const [portalRoot] = useState(() => {
    const div = document.createElement('div');
    div.id = '__pinpoint_portal';
    div.setAttribute('data-pinpoint', 'root');
    div.style.cssText = [
      'position:fixed', 'top:0', 'left:0',
      'width:0', 'height:0', 'overflow:visible',
      `font-family:${FONT}`, 'font-size:14px',
      'line-height:1.5', 'box-sizing:border-box',
      'pointer-events:none',
      'z-index:2147483000', // creates stacking context above host app; child z-indices are relative to this
    ].join(';');
    return div;
  });

  const [portalMounted, setPortalMounted] = useState(false);
  useEffect(() => {
    document.body.appendChild(portalRoot);
    setPortalMounted(true);
    return () => {
      portalRoot.remove();
      setPortalMounted(false);
    };
  }, [portalRoot]);

  if (!portalMounted) return null;

  return createPortal(
    <>
      {/* Block host-app interactions while capturing (respects user setting) */}
      {state.mode === 'capturing' && state.settings.blockInteractions && !state.popupConfig && (
        <div
          data-pinpoint="block-overlay"
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            zIndex: Z.blockInteractions, pointerEvents: 'auto', cursor: 'crosshair',
            opacity: 0,
          }}
        />
      )}

      {/* Highlight — always on when capturing */}
      <HighlightOverlay active={state.mode === 'capturing' && !state.popupConfig} />

      {/* Transparent capture overlay — handles element picking */}
      {state.mode === 'capturing' && !state.popupConfig && (
        <div
          data-pinpoint="capture-overlay"
          ref={captureOverlayRef}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            zIndex: Z.capture, cursor: 'crosshair', opacity: 0,
            pointerEvents: 'auto',
          }}
          onMouseMove={handleCaptureMouseMove}
          onClick={handleCaptureClick}
        />
      )}

      {/* Area selection */}
      {state.mode === 'area-select' && (
        <AreaSelectionOverlay onComplete={handleAreaSelection} />
      )}

      {/* Marker pins */}
      {state.markersVisible && state.annotations.map((ann, i) => (
        <MarkerPin
          key={ann.id}
          annotation={ann}
          index={i + 1}
          color={state.settings.markerColor}
        />
      ))}

      {/* Popup */}
      {state.popupConfig && (
        <AnnotationPopup
          config={state.popupConfig}
          sessionId={state.sessionId}
          annotationCount={state.annotations.length}
          onAnnotationAdd={onAnnotationAdd}
        />
      )}

      {/* Toolbar — always visible */}
      <Toolbar onCopy={onCopy} />

      {/* Settings panel */}
      {state.settingsOpen && <SettingsPanel />}
    </>,
    portalRoot,
  );
}
