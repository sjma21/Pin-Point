import { useState, useCallback, useRef } from 'react';
import {
  // Element detection
  startDetection,
  stopDetection,
  isDetectionActive,
  type DetectedElement,
  // Annotation builder
  buildAnnotation,
  // Selectors
  generateSelector,
  // Fiber traversal
  traverseFiber,
  // Source files
  detectSourceFile,
  // Text selection
  getTextSelection,
  startSelectionDetection,
  stopSelectionDetection,
  // Area selection
  activateAreaSelection,
  deactivateAreaSelection,
  isAreaSelectionActive,
  // Animations
  pauseAnimations,
  resumeAnimations,
  areAnimationsPaused,
  // Storage
  saveAnnotations,
  loadAnnotations,
  clearAnnotations,
  // Serializer
  serializeAnnotations,
  type DetailLevel,
  // Event bus
  subscribe,
  emit,
} from '@pinpoint/toolbar';
import { AnnotationIntent, AnnotationSeverity, generateId } from '@pinpoint/shared';
import type { Annotation } from '@pinpoint/shared';

const SESSION_ID = generateId('sess');

// ─── Small UI helpers ─────────────────────────────────────────────────────────

function Chip({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.6rem',
        borderRadius: 999,
        fontSize: '0.75rem',
        fontWeight: 700,
        background: active ? '#dcfce7' : '#f1f5f9',
        color: active ? '#15803d' : '#475569',
        border: `1px solid ${active ? '#bbf7d0' : '#e2e8f0'}`,
      }}
    >
      {label}
    </span>
  );
}

function Pre({ content }: { content: string }) {
  return (
    <pre
      style={{
        background: '#0f172a',
        color: '#e2e8f0',
        padding: '1rem',
        borderRadius: 8,
        fontSize: '0.75rem',
        overflowX: 'auto',
        maxHeight: 320,
        overflowY: 'auto',
        marginTop: '0.5rem',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
      }}
    >
      {content}
    </pre>
  );
}

// ─── CoreTest component ───────────────────────────────────────────────────────

export default function CoreTest() {
  const [detecting, setDetecting] = useState(false);
  const [lastDetected, setLastDetected] = useState<DetectedElement | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [serialized, setSerialized] = useState('');
  const [detailLevel, setDetailLevel] = useState<DetailLevel>('standard');
  const [log, setLog] = useState<string[]>([]);
  const [animPaused, setAnimPaused] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const annotationTarget = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 29)]);
  }, []);

  // ── Element detection ──────────────────────────────────────────────────────

  function toggleDetection() {
    if (isDetectionActive()) {
      stopDetection();
      setDetecting(false);
      addLog('Element detection stopped.');
    } else {
      startDetection((info) => {
        setLastDetected(info);
      });
      setDetecting(true);
      addLog('Element detection started — hover over elements below.');
    }
  }

  // ── Build annotation ───────────────────────────────────────────────────────

  function buildTestAnnotation() {
    const target = annotationTarget.current;
    if (!target) return;

    const ann = buildAnnotation({
      element: target,
      options: {
        sessionId: SESSION_ID,
        comment: 'This is a test annotation built by the CoreTest component.',
        intent: AnnotationIntent.Note,
        severity: AnnotationSeverity.Info,
        tags: ['demo', 'phase-2'],
        index: annotations.length + 1,
      },
    });

    const next = [...annotations, ann];
    setAnnotations(next);
    addLog(`Built annotation: ${ann.id}`);
    console.group('[Pinpoint] New Annotation');
    console.log(ann);
    console.groupEnd();

    emit('annotationAdded', ann);
  }

  // ── Selector + Fiber + Source ──────────────────────────────────────────────

  function inspectTarget() {
    const target = annotationTarget.current;
    if (!target) return;

    const sel = generateSelector(target);
    const fiber = traverseFiber(target, 'filtered');
    const source = detectSourceFile(target);

    addLog(`selector: ${sel.selector}`);
    addLog(`fiber: ${fiber.componentHierarchy || '(no React fiber)'}`);
    addLog(`source: ${source?.formatted ?? '(dev source not available)'}`);

    console.group('[Pinpoint] Target Inspection');
    console.log('Selector:', sel);
    console.log('Fiber:', fiber);
    console.log('Source:', source);
    console.groupEnd();
  }

  // ── Text selection ─────────────────────────────────────────────────────────

  function testTextSelection() {
    const info = getTextSelection();
    if (!info) {
      addLog('No text selected — select some text on the page first.');
      return;
    }
    addLog(`Selected: "${info.selectedText.slice(0, 60)}…"`);
    console.log('[Pinpoint] Text selection:', info);
  }

  function toggleSelectionDetection() {
    // Simple toggle — start, log one event, stop
    startSelectionDetection((info) => {
      addLog(`Selection changed: "${info.selectedText.slice(0, 40)}"`);
    });
    addLog('Selection detector active — select text anywhere on the page.');
    setTimeout(() => {
      stopSelectionDetection();
      addLog('Selection detector stopped (auto-stopped after 10 s).');
    }, 10_000);
  }

  // ── Area selection ─────────────────────────────────────────────────────────

  function toggleAreaSelection() {
    if (isAreaSelectionActive()) {
      deactivateAreaSelection();
      addLog('Area selection deactivated.');
    } else {
      activateAreaSelection((sel) => {
        addLog(
          `Area selected: ${sel.bounds.width}×${sel.bounds.height}px — ${sel.elements.length} elements inside.`,
        );
        deactivateAreaSelection();
      });
      addLog('Area selection active — drag a rectangle on the page.');
    }
  }

  // ── Animations ────────────────────────────────────────────────────────────

  function toggleAnims() {
    if (areAnimationsPaused()) {
      resumeAnimations();
      setAnimPaused(false);
      addLog('Animations resumed.');
    } else {
      pauseAnimations();
      setAnimPaused(true);
      addLog('Animations paused.');
    }
  }

  // ── Storage ───────────────────────────────────────────────────────────────

  function testStorage() {
    if (annotations.length === 0) {
      addLog('Build at least one annotation first.');
      return;
    }
    const ok = saveAnnotations(annotations);
    addLog(ok ? `Saved ${annotations.length} annotation(s) to localStorage.` : 'Save failed!');

    const loaded = loadAnnotations();
    setSavedCount(loaded.length);
    addLog(`Loaded back ${loaded.length} annotation(s) from localStorage.`);
    console.log('[Pinpoint] Loaded from storage:', loaded);
  }

  function clearStorage() {
    clearAnnotations();
    setSavedCount(0);
    addLog('Cleared annotations from localStorage.');
  }

  // ── Serialize ─────────────────────────────────────────────────────────────

  function serialize() {
    if (annotations.length === 0) {
      addLog('Build at least one annotation first.');
      return;
    }
    const md = serializeAnnotations(annotations, detailLevel);
    setSerialized(md);
    addLog(`Serialized ${annotations.length} annotation(s) at detail="${detailLevel}".`);
    console.log(`[Pinpoint] Markdown (${detailLevel}):\n`, md);
  }

  function serializeAll() {
    if (annotations.length === 0) {
      addLog('Build at least one annotation first.');
      return;
    }
    const levels: DetailLevel[] = ['compact', 'standard', 'detailed', 'forensic'];
    for (const lvl of levels) {
      const md = serializeAnnotations(annotations, lvl);
      console.group(`[Pinpoint] Markdown — ${lvl}`);
      console.log(md);
      console.groupEnd();
    }
    addLog('All 4 detail levels logged to console.');
  }

  // ── Event bus ─────────────────────────────────────────────────────────────

  function testEventBus() {
    subscribe<Annotation>('annotationAdded', (ann) => {
      addLog(`[eventBus] annotationAdded: ${ann.id}`);
    });
    emit('settingsChanged', { theme: 'dark' });
    addLog('[eventBus] emitted settingsChanged, subscribed to annotationAdded.');
  }

  // ─────────────────────────────────────────────────────────────────────────

  const btnStyle = {
    base: {
      padding: '0.45rem 0.9rem',
      fontSize: '0.82rem',
      fontWeight: 600,
      borderRadius: 6,
      background: '#6366f1',
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
    } as React.CSSProperties,
    danger: {
      background: '#ef4444',
    } as React.CSSProperties,
    neutral: {
      background: '#f1f5f9',
      color: '#374151',
      border: '1px solid #e2e8f0',
    } as React.CSSProperties,
  };

  return (
    <section
      style={{
        background: '#fff',
        border: '2px dashed #6366f1',
        borderRadius: 12,
        padding: '2rem',
        maxWidth: 900,
        margin: '2rem auto',
        fontFamily: 'monospace',
      }}
    >
      <h2
        style={{ fontFamily: 'sans-serif', fontWeight: 800, marginBottom: '0.25rem' }}
      >
        🔬 Phase 2 — Core Engine Test
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Open DevTools console for full output. All modules imported from{' '}
        <code>@pinpoint/toolbar</code>.
      </p>

      {/* Status chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <Chip active={detecting} label={detecting ? 'Detecting ✓' : 'Detection off'} />
        <Chip active={animPaused} label={animPaused ? 'Anims paused ✓' : 'Anims running'} />
        <Chip active={annotations.length > 0} label={`${annotations.length} annotation(s)`} />
        <Chip active={savedCount > 0} label={`${savedCount} stored`} />
      </div>

      {/* Annotation target */}
      <div
        ref={annotationTarget}
        data-testid="annotation-target"
        style={{
          background: 'linear-gradient(135deg,#eef2ff,#f8fafc)',
          border: '1px solid #c7d2fe',
          borderRadius: 8,
          padding: '1rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: '#4338ca',
          fontFamily: 'sans-serif',
        }}
      >
        📍 <strong>Annotation target</strong> — annotationBuilder, generateSelector,
        traverseFiber, and detectSourceFile all target this element when you click{' '}
        <em>Build Annotation</em> or <em>Inspect Target</em>.
      </div>

      {/* Button grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '0.6rem',
          marginBottom: '1.5rem',
        }}
      >
        <button
          style={{ ...btnStyle.base, background: detecting ? '#ef4444' : '#6366f1' }}
          onClick={toggleDetection}
        >
          {detecting ? 'Stop Detection' : 'Start Detection'}
        </button>

        <button style={btnStyle.base} onClick={inspectTarget}>
          Inspect Target
        </button>

        <button style={btnStyle.base} onClick={buildTestAnnotation}>
          Build Annotation
        </button>

        <button style={btnStyle.base} onClick={testTextSelection}>
          Check Selection
        </button>

        <button style={btnStyle.base} onClick={toggleSelectionDetection}>
          Watch Selection
        </button>

        <button
          style={{
            ...btnStyle.base,
            background: isAreaSelectionActive() ? '#ef4444' : '#6366f1',
          }}
          onClick={toggleAreaSelection}
        >
          {isAreaSelectionActive() ? 'Cancel Area Sel.' : 'Area Selection'}
        </button>

        <button
          style={{
            ...btnStyle.base,
            background: animPaused ? '#22c55e' : '#f59e0b',
            color: '#fff',
          }}
          onClick={toggleAnims}
        >
          {animPaused ? 'Resume Animations' : 'Pause Animations'}
        </button>

        <button style={btnStyle.base} onClick={testStorage}>
          Save / Load Storage
        </button>

        <button style={{ ...btnStyle.base, ...btnStyle.danger }} onClick={clearStorage}>
          Clear Storage
        </button>

        <button style={btnStyle.base} onClick={serialize}>
          Serialize MD
        </button>

        <button style={btnStyle.base} onClick={serializeAll}>
          Serialize All Levels
        </button>

        <button style={btnStyle.base} onClick={testEventBus}>
          Test Event Bus
        </button>
      </div>

      {/* Detail level selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Detail level:</span>
        {(['compact', 'standard', 'detailed', 'forensic'] as DetailLevel[]).map(lvl => (
          <button
            key={lvl}
            onClick={() => setDetailLevel(lvl)}
            style={{
              ...btnStyle.base,
              padding: '0.25rem 0.6rem',
              fontSize: '0.75rem',
              background: detailLevel === lvl ? '#6366f1' : '#f1f5f9',
              color: detailLevel === lvl ? '#fff' : '#374151',
              border: '1px solid #e2e8f0',
            }}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Last detected element */}
      {lastDetected && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.25rem' }}>
            Last detected element:
          </div>
          <Pre
            content={JSON.stringify(
              {
                tagName: lastDetected.tagName,
                id: lastDetected.id,
                classList: lastDetected.classList,
                boundingBox: lastDetected.boundingBox,
                ariaLabel: lastDetected.ariaLabel,
                ariaRole: lastDetected.ariaRole,
                nearbyText: lastDetected.nearbyText.slice(0, 80),
                computedStyles: lastDetected.computedStyles,
              },
              null,
              2,
            )}
          />
        </div>
      )}

      {/* Serialized markdown output */}
      {serialized && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.25rem' }}>
            Serialized markdown ({detailLevel}):
          </div>
          <Pre content={serialized} />
        </div>
      )}

      {/* Activity log */}
      <div>
        <div
          style={{
            fontSize: '0.78rem',
            color: '#64748b',
            marginBottom: '0.25rem',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Activity log</span>
          <button
            style={{ ...btnStyle.base, ...btnStyle.neutral, padding: '0.1rem 0.5rem', fontSize: '0.7rem' }}
            onClick={() => setLog([])}
          >
            clear
          </button>
        </div>
        <div
          style={{
            background: '#0f172a',
            borderRadius: 8,
            padding: '0.75rem',
            maxHeight: 200,
            overflowY: 'auto',
            fontSize: '0.72rem',
            color: '#94a3b8',
            fontFamily: 'monospace',
          }}
        >
          {log.length === 0 ? (
            <span style={{ color: '#475569' }}>No activity yet.</span>
          ) : (
            log.map((line, i) => (
              <div key={i} style={{ marginBottom: '0.15rem' }}>
                {line}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
