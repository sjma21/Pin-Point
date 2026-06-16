export interface AreaBounds {
  /** Viewport-relative x */
  x: number;
  /** Viewport-relative y */
  y: number;
  width: number;
  height: number;
  /** Page-relative top (y + scrollY) */
  pageTop: number;
  /** Page-relative left (x + scrollX) */
  pageLeft: number;
}

export interface AreaSelection {
  bounds: AreaBounds;
  elements: Element[];
}

type AreaSelectionHandler = (selection: AreaSelection) => void;

let _active = false;
let _startX = 0;
let _startY = 0;
let _dragging = false;
let _overlay: HTMLDivElement | null = null;
let _handler: AreaSelectionHandler | null = null;

function createOverlay(): HTMLDivElement {
  const div = document.createElement('div');
  div.setAttribute('data-pinpoint-overlay', 'area');
  div.style.cssText = [
    'position:fixed',
    'pointer-events:none',
    'z-index:2147483646',
    'border:2px solid #6366f1',
    'background:rgba(99,102,241,0.08)',
    'border-radius:3px',
    'box-sizing:border-box',
    'display:none',
  ].join(';');
  document.body.appendChild(div);
  return div;
}

function updateOverlay(x: number, y: number, w: number, h: number): void {
  if (!_overlay) return;
  Object.assign(_overlay.style, {
    left: `${x}px`,
    top: `${y}px`,
    width: `${w}px`,
    height: `${h}px`,
    display: 'block',
  });
}

function elementsInArea(bounds: AreaBounds): Element[] {
  const result: Element[] = [];
  for (const el of document.querySelectorAll('*')) {
    if (el === _overlay || el.hasAttribute('data-pinpoint-overlay')) continue;
    const r = el.getBoundingClientRect();
    if (
      r.right > bounds.x &&
      r.left < bounds.x + bounds.width &&
      r.bottom > bounds.y &&
      r.top < bounds.y + bounds.height
    ) {
      result.push(el);
    }
  }
  return result;
}

function onMousedown(e: MouseEvent): void {
  if (e.button !== 0) return;
  _startX = e.clientX;
  _startY = e.clientY;
  _dragging = true;
  if (_overlay) updateOverlay(_startX, _startY, 0, 0);
}

function onMousemove(e: MouseEvent): void {
  if (!_dragging || !_overlay || !(e.buttons & 1)) return;
  const x = Math.min(e.clientX, _startX);
  const y = Math.min(e.clientY, _startY);
  const w = Math.abs(e.clientX - _startX);
  const h = Math.abs(e.clientY - _startY);
  updateOverlay(x, y, w, h);
}

function onMouseup(e: MouseEvent): void {
  if (!_dragging) return;
  _dragging = false;
  if (!_overlay || !_handler) return;
  _overlay.style.display = 'none';

  const x = Math.min(e.clientX, _startX);
  const y = Math.min(e.clientY, _startY);
  const w = Math.abs(e.clientX - _startX);
  const h = Math.abs(e.clientY - _startY);

  if (w < 5 || h < 5) return; // ignore accidental micro-drags

  const bounds: AreaBounds = {
    x, y, width: w, height: h,
    pageTop: y + window.scrollY,
    pageLeft: x + window.scrollX,
  };

  _handler({ bounds, elements: elementsInArea(bounds) });
}

export function activateAreaSelection(handler: AreaSelectionHandler): void {
  if (_active) deactivateAreaSelection();
  _handler = handler;
  _overlay = createOverlay();
  _active = true;
  document.addEventListener('mousedown', onMousedown);
  document.addEventListener('mousemove', onMousemove);
  document.addEventListener('mouseup', onMouseup);
  document.body.style.userSelect = 'none';
}

export function deactivateAreaSelection(): void {
  document.removeEventListener('mousedown', onMousedown);
  document.removeEventListener('mousemove', onMousemove);
  document.removeEventListener('mouseup', onMouseup);
  _overlay?.remove();
  _overlay = null;
  document.body.style.userSelect = '';
  _handler = null;
  _active = false;
  _dragging = false;
}

export function isAreaSelectionActive(): boolean {
  return _active;
}
