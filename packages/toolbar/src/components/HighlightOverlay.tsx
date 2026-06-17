import { useEffect, useRef } from 'react';
import { C, Z, FONT } from '../theme.js';

interface Props {
  active: boolean;
}

export function HighlightOverlay({ active }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active) {
      if (boxRef.current) boxRef.current.style.opacity = '0';
      return;
    }

    function onMove(e: MouseEvent) {
      const all = document.elementsFromPoint(e.clientX, e.clientY);
      const target = all.find(el => !el.closest('[data-pinpoint]')) as HTMLElement | undefined;

      const box = boxRef.current;
      const label = labelRef.current;
      if (!box || !label) return;

      if (!target || target === document.documentElement || target === document.body) {
        box.style.opacity = '0';
        return;
      }

      const r = target.getBoundingClientRect();
      box.style.left   = `${r.left}px`;
      box.style.top    = `${r.top}px`;
      box.style.width  = `${r.width}px`;
      box.style.height = `${r.height}px`;
      box.style.opacity = '1';

      const tag = target.tagName.toLowerCase();
      const id = target.id ? `#${target.id}` : '';
      const cls = target.classList.length ? `.${Array.from(target.classList).slice(0,2).join('.')}` : '';
      label.textContent = `<${tag}${id}${cls}>`;
    }

    document.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      document.removeEventListener('mousemove', onMove);
      if (boxRef.current) boxRef.current.style.opacity = '0';
    };
  }, [active]);

  return (
    <div
      data-pinpoint="highlight"
      ref={boxRef}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: Z.highlight,
        opacity: 0,
        transition: 'opacity 0.08s, left 0.05s, top 0.05s, width 0.05s, height 0.05s',
        border: `2px solid ${C.primary}`,
        background: C.primaryFaint,
        borderRadius: 3,
        boxSizing: 'border-box',
      }}
    >
      <span
        ref={labelRef}
        style={{
          position: 'absolute',
          top: -22,
          left: -1,
          background: C.primary,
          color: '#fff',
          fontSize: 11,
          fontFamily: FONT,
          fontWeight: 600,
          padding: '2px 6px',
          borderRadius: '3px 3px 0 0',
          whiteSpace: 'nowrap',
          lineHeight: 1.6,
        }}
      />
    </div>
  );
}
