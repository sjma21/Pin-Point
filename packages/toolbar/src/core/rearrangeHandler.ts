import type { Annotation } from '@sajalmishra/markpin-shared';
import { AnnotationIntent, AnnotationKind, AnnotationSeverity, AnnotationStatus, generateId, now } from '@sajalmishra/markpin-shared';
import { toolbarStore } from '../state/toolbarState.js';
import { httpClient } from './httpClient.js';
import type { PageSection } from './layoutController.js';

interface SectionEntry {
  section: PageSection;
  handle: HTMLElement;
  origNextSibling: Element | null;
}

interface DropZoneEl {
  el: HTMLElement;
  targetIdx: number;
}

const HANDLE_ATTR = 'data-pinpoint';
const HANDLE_VAL = 'drag-handle';

class RearrangeHandler {
  private _entries: SectionEntry[] = [];
  private _dropZones: DropZoneEl[] = [];
  private _draggingIdx = -1;
  private _hoverIdx = -1;

  activate(sections: PageSection[]): void {
    this.deactivate();
    sections.forEach((section, i) => {
      const handle = this._buildHandle(section.element, i);
      this._entries.push({
        section,
        handle,
        origNextSibling: section.element.nextElementSibling,
      });
    });
  }

  deactivate(): void {
    // Restore original DOM order
    for (let i = this._entries.length - 1; i >= 0; i--) {
      const entry = this._entries[i];
      const parent = entry.section.element.parentElement;
      if (parent && entry.origNextSibling) {
        parent.insertBefore(entry.section.element, entry.origNextSibling);
      } else if (parent) {
        parent.appendChild(entry.section.element);
      }
      entry.section.element.style.opacity = '';
      entry.section.element.style.transition = '';
      entry.handle.remove();
    }
    this._clearDropZones();
    this._entries = [];
    this._draggingIdx = -1;
    this._hoverIdx = -1;
  }

  private _buildHandle(el: HTMLElement, idx: number): HTMLElement {
    const handle = document.createElement('div');
    handle.setAttribute(HANDLE_ATTR, HANDLE_VAL);
    Object.assign(handle.style, {
      position: 'absolute',
      top: '0',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '52px',
      height: '18px',
      background: 'rgba(99,102,241,0.9)',
      borderRadius: '0 0 8px 8px',
      cursor: 'grab',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '2147483634',
      opacity: '0',
      transition: 'opacity 0.18s',
      pointerEvents: 'auto',
      userSelect: 'none',
    });
    handle.innerHTML = `<span style="color:#fff;font-size:9px;letter-spacing:3px">⣿⣿</span>`;

    // Ensure section has relative/absolute positioning for the handle to anchor to
    const pos = getComputedStyle(el).position;
    if (pos === 'static') el.style.position = 'relative';

    el.appendChild(handle);

    el.addEventListener('mouseenter', () => { handle.style.opacity = '1'; });
    el.addEventListener('mouseleave', () => { if (this._draggingIdx !== idx) handle.style.opacity = '0'; });

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._beginDrag(idx);
    });

    return handle;
  }

  private _beginDrag(idx: number): void {
    if (idx < 0 || idx >= this._entries.length) return;
    this._draggingIdx = idx;

    const dragEntry = this._entries[idx];
    dragEntry.section.element.style.opacity = '0.45';
    dragEntry.section.element.style.transition = 'opacity 0.15s';

    this._showDropZones(idx);

    const onMove = (e: MouseEvent) => this._onMouseMove(e);
    const onUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      this._commitDrop(e);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  private _onMouseMove(e: MouseEvent): void {
    const hit = this._sectionAtPoint(e.clientX, e.clientY);
    if (hit === this._hoverIdx) return;
    this._hoverIdx = hit;

    this._dropZones.forEach(({ el, targetIdx }) => {
      el.style.background = targetIdx === hit
        ? 'rgba(99,102,241,0.85)'
        : 'rgba(99,102,241,0.35)';
      el.style.height = targetIdx === hit ? '6px' : '3px';
    });
  }

  private _showDropZones(excludeIdx: number): void {
    this._clearDropZones();
    this._entries.forEach((entry, i) => {
      if (i === excludeIdx) return;
      const rect = entry.section.element.getBoundingClientRect();

      const dz = document.createElement('div');
      dz.setAttribute(HANDLE_ATTR, 'drop-zone');
      Object.assign(dz.style, {
        position: 'fixed',
        left: `${rect.left}px`,
        top: `${rect.top - 5}px`,
        width: `${rect.width}px`,
        height: '3px',
        background: 'rgba(99,102,241,0.35)',
        borderRadius: '2px',
        zIndex: '2147483634',
        pointerEvents: 'none',
        transition: 'background 0.1s, height 0.1s',
      });
      document.body.appendChild(dz);
      this._dropZones.push({ el: dz, targetIdx: i });
    });
  }

  private _clearDropZones(): void {
    this._dropZones.forEach(({ el }) => el.remove());
    this._dropZones = [];
  }

  private _sectionAtPoint(x: number, y: number): number {
    for (let i = 0; i < this._entries.length; i++) {
      if (i === this._draggingIdx) continue;
      const rect = this._entries[i].section.element.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return i;
      }
    }
    return -1;
  }

  private _commitDrop(e: MouseEvent): void {
    const fromIdx = this._draggingIdx;
    this._draggingIdx = -1;
    this._hoverIdx = -1;
    this._clearDropZones();

    if (fromIdx < 0) return;
    const fromEntry = this._entries[fromIdx];
    fromEntry.section.element.style.opacity = '';
    fromEntry.section.element.style.transition = '';
    fromEntry.handle.style.opacity = '0';

    const toIdx = this._sectionAtPoint(e.clientX, e.clientY);
    if (toIdx < 0 || toIdx === fromIdx) return;

    const toEntry = this._entries[toIdx];

    // Capture rects before DOM mutation
    const originalRect = fromEntry.section.originalRect;
    const currentRect = toEntry.section.element.getBoundingClientRect();

    // Visual reorder via DOM (not permanent — deactivate restores origNextSibling)
    const fromEl = fromEntry.section.element;
    const toEl = toEntry.section.element;
    const parent = fromEl.parentElement;
    if (parent) {
      // Move fromEl to just before toEl (or after, if toIdx > fromIdx)
      if (toIdx > fromIdx) {
        parent.insertBefore(fromEl, toEl.nextElementSibling);
      } else {
        parent.insertBefore(fromEl, toEl);
      }
    }

    this._createRearrangeAnnotation(fromEntry, toEntry, fromIdx, toIdx, originalRect, currentRect);
  }

  private _createRearrangeAnnotation(
    fromEntry: SectionEntry,
    toEntry: SectionEntry,
    fromIdx: number,
    toIdx: number,
    originalRect: DOMRect,
    currentRect: DOMRect,
  ): void {
    const state = toolbarStore.get();
    const rearrangeIndex = state.annotations.filter(
      a => (a.kind as string) === 'rearrange',
    ).length + 1;

    const ann: Annotation = {
      id: generateId('ann'),
      sessionId: state.sessionId,
      createdAt: now(),
      kind: AnnotationKind.Rearrange,
      intent: AnnotationIntent.Task,
      severity: AnnotationSeverity.Info,
      status: AnnotationStatus.Open,
      target: {
        selector: fromEntry.section.selector,
        boundingBox: {
          x: Math.round(originalRect.x),
          y: Math.round(originalRect.y),
          width: Math.round(originalRect.width),
          height: Math.round(originalRect.height),
        },
        url: window.location.href,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        devicePixelRatio: window.devicePixelRatio,
      },
      comment: `Move "${fromEntry.section.label}" to position of "${toEntry.section.label}"`,
      metadata: {
        sectionLabel: fromEntry.section.label,
        sectionSelector: fromEntry.section.selector,
        originalIndex: fromIdx,
        newIndex: toIdx,
        targetLabel: toEntry.section.label,
        targetSelector: toEntry.section.selector,
        originalRect: {
          x: Math.round(originalRect.x),
          y: Math.round(originalRect.y),
          width: Math.round(originalRect.width),
          height: Math.round(originalRect.height),
        },
        currentRect: {
          x: Math.round(currentRect.x),
          y: Math.round(currentRect.y),
          width: Math.round(currentRect.width),
          height: Math.round(currentRect.height),
        },
        isFixed: false,
      },
      index: rearrangeIndex,
    };

    toolbarStore.addAnnotation(ann);
    if (httpClient.isConfigured()) {
      httpClient.postAnnotation(ann).catch(() => { /* silent */ });
    }
  }
}

export const rearrangeHandler = new RearrangeHandler();
