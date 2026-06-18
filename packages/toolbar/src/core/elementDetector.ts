import type { BoundingBox } from '@sajalmishra/markpin-shared';

export interface ComputedStyles {
  color: string;
  background: string;
  fontSize: string;
  padding: string;
  margin: string;
  borderRadius: string;
  display: string;
  position: string;
  width: string;
  height: string;
}

export interface DetectedElement {
  element: Element;
  tagName: string;
  id: string;
  classList: string[];
  boundingBox: BoundingBox;
  nearbyText: string;
  ariaLabel: string | null;
  ariaRole: string | null;
  ariaDescribedBy: string | null;
  computedStyles: ComputedStyles;
}

type DetectionHandler = (info: DetectedElement) => void;

let _handler: DetectionHandler | null = null;
let _active = false;
let _lastEl: Element | null = null;

function extractNearbyText(el: Element): string {
  const own = el.textContent?.trim().slice(0, 200) ?? '';
  if (own) return own;
  return el.parentElement?.textContent?.trim().slice(0, 200) ?? '';
}

function extractComputedStyles(el: Element): ComputedStyles {
  const s = window.getComputedStyle(el);
  return {
    color: s.color,
    background: s.background,
    fontSize: s.fontSize,
    padding: s.padding,
    margin: s.margin,
    borderRadius: s.borderRadius,
    display: s.display,
    position: s.position,
    width: s.width,
    height: s.height,
  };
}

function onMouseover(e: MouseEvent): void {
  const el = e.target;
  if (!(el instanceof Element) || el === _lastEl || !_handler) return;
  _lastEl = el;

  const rect = el.getBoundingClientRect();
  const info: DetectedElement = {
    element: el,
    tagName: el.tagName.toLowerCase(),
    id: el.id,
    classList: Array.from(el.classList),
    boundingBox: {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
    nearbyText: extractNearbyText(el),
    ariaLabel: el.getAttribute('aria-label'),
    ariaRole: el.getAttribute('role'),
    ariaDescribedBy: el.getAttribute('aria-describedby'),
    computedStyles: extractComputedStyles(el),
  };

  _handler(info);
}

export function startDetection(handler: DetectionHandler): void {
  if (_active) stopDetection();
  _handler = handler;
  _active = true;
  _lastEl = null;
  document.addEventListener('mouseover', onMouseover, { passive: true });
}

export function stopDetection(): void {
  document.removeEventListener('mouseover', onMouseover);
  _handler = null;
  _active = false;
  _lastEl = null;
}

export function isDetectionActive(): boolean {
  return _active;
}
