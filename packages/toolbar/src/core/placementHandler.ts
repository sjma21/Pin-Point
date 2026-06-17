import type { Annotation } from '@pinpoint/shared';
import { AnnotationIntent, AnnotationKind, AnnotationSeverity, AnnotationStatus, generateId, now } from '@pinpoint/shared';
import { toolbarStore } from '../state/toolbarState.js';
import { httpClient } from './httpClient.js';

class PlacementHandler {
  private _draggingType: string | null = null;
  private _ghostEl: HTMLDivElement | null = null;
  private _lastDropW = 300;
  private _lastDropH = 80;

  get draggingType(): string | null { return this._draggingType; }

  startDrag(componentType: string): void {
    this._draggingType = componentType;
    this._ensureGhost();
  }

  private _ensureGhost(): void {
    if (this._ghostEl) return;
    const el = document.createElement('div');
    el.setAttribute('data-pinpoint', 'placement-ghost');
    Object.assign(el.style, {
      position: 'fixed',
      pointerEvents: 'none',
      border: '2px dashed #22c55e',
      background: 'rgba(34,197,94,0.08)',
      borderRadius: '6px',
      zIndex: '2147483632',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: '700',
      color: '#22c55e',
      fontFamily: 'system-ui',
      letterSpacing: '0.02em',
      transition: 'top 0.05s, left 0.05s',
    });
    document.body.appendChild(el);
    this._ghostEl = el;
  }

  handleDragOver(e: DragEvent): void {
    if (!this._draggingType || !this._ghostEl) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';

    const w = Math.min(window.innerWidth * 0.55, 420);
    const h = 72;
    this._lastDropW = w;
    this._lastDropH = h;

    const x = e.clientX - w / 2;
    const y = e.clientY - h / 2;

    Object.assign(this._ghostEl.style, {
      display: 'flex',
      left: `${x}px`,
      top: `${y}px`,
      width: `${w}px`,
      height: `${h}px`,
    });
    this._ghostEl.textContent = `+ ${this._draggingType}`;
  }

  handleDragLeave(e: DragEvent): void {
    // Only hide if we've truly left the page area (not just moved to palette)
    const related = e.relatedTarget as Element | null;
    if (related?.closest('[data-pinpoint="layout-palette"]')) return;
    if (this._ghostEl) this._ghostEl.style.display = 'none';
  }

  handleDrop(e: DragEvent, purpose: string): Annotation | null {
    if (!this._draggingType) return null;
    e.preventDefault();
    if (this._ghostEl) this._ghostEl.style.display = 'none';

    const componentType = this._draggingType;
    this._draggingType = null;

    const state = toolbarStore.get();
    const xPct = Math.round((e.clientX / window.innerWidth) * 100);
    const yPct = Math.round((e.clientY / window.innerHeight) * 100);
    const dropW = Math.round(this._lastDropW);
    const dropH = Math.round(this._lastDropH);

    const placementIndex = state.annotations.filter(
      a => (a.kind as string) === 'placement',
    ).length + 1;

    const ann: Annotation = {
      id: generateId('ann'),
      sessionId: state.sessionId,
      createdAt: now(),
      kind: AnnotationKind.Placement,
      intent: AnnotationIntent.Task,
      severity: AnnotationSeverity.Info,
      status: AnnotationStatus.Open,
      target: {
        boundingBox: {
          x: Math.round(e.clientX - dropW / 2),
          y: Math.round(e.clientY - dropH / 2),
          width: dropW,
          height: dropH,
        },
        url: window.location.href,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        devicePixelRatio: window.devicePixelRatio,
      },
      comment: `Place ${componentType} component at ${xPct}%, ${yPct}% of viewport`,
      metadata: {
        componentType,
        xPercent: xPct,
        yPercent: yPct,
        scrollY: window.scrollY,
        dropWidth: dropW,
        dropHeight: dropH,
        wireframePurpose: purpose || undefined,
        isFixed: false,
      },
      index: placementIndex,
    };

    toolbarStore.addAnnotation(ann);
    if (httpClient.isConfigured()) {
      httpClient.postAnnotation(ann).catch(() => { /* silent */ });
    }
    return ann;
  }

  endDrag(): void {
    this._draggingType = null;
    if (this._ghostEl) this._ghostEl.style.display = 'none';
  }

  destroy(): void {
    this._draggingType = null;
    if (this._ghostEl) {
      this._ghostEl.remove();
      this._ghostEl = null;
    }
  }
}

export const placementHandler = new PlacementHandler();
