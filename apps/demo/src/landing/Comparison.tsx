import { useEffect, useRef, RefObject } from 'react';

function useInView(ref: RefObject<Element>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fadeEls = entry.target.querySelectorAll<HTMLElement>('.fade-up');
            fadeEls.forEach((fadeEl) => fadeEl.classList.add('is-visible'));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}

export default function Comparison() {
  const sectionRef = useRef<HTMLElement>(null);
  useInView(sectionRef as RefObject<Element>);

  return (
    <section id="comparison" className="comparison-section" ref={sectionRef}>
      <div className="container">
        {/* Header */}
        <div className="comparison-header fade-up">
          <span className="section-label">CONTEXT IS EVERYTHING</span>
          <h2 className="section-heading">Why not just describe it in chat?</h2>
        </div>

        {/* Comparison columns */}
        <div className="comparison-grid">
          {/* Without Pinpoint */}
          <div className="fade-up delay-1">
            <div className="comparison-col-label danger">
              ✗ Without Pinpoint
            </div>
            <div className="comparison-without">
              <div className="comparison-chat-bubble">
                "Please fix the blue button in the sidebar — I think it's in
                the nav component somewhere. It looks misaligned on mobile,
                maybe padding issue? Not sure which file. Could be the one in
                layouts or maybe components, I can't remember where we put it."
              </div>

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                  <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }}>✗</span>
                  <span>Agent has to guess which component</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                  <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }}>✗</span>
                  <span>No exact selector or file path</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                  <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }}>✗</span>
                  <span>Multiple back-and-forth messages to clarify</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                  <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }}>✗</span>
                  <span>High chance of fixing the wrong thing</span>
                </div>
              </div>
            </div>
          </div>

          {/* With Pinpoint */}
          <div className="fade-up delay-2">
            <div className="comparison-col-label success">
              ✓ With Pinpoint
            </div>
            <div className="comparison-with">
              <div className="comparison-code">
                <div>
                  <span className="code-key">intent</span>
                  {': '}
                  <span className="code-val">bug</span>
                  {'  '}
                  <span className="code-key">severity</span>
                  {': '}
                  <span className="code-val">high</span>
                </div>
                <div style={{ height: '8px' }} />
                <div>
                  <span className="code-key">selector</span>
                  {': '}
                  <span className="code-str">"nav.sidebar {'>'} button.nav-item"</span>
                </div>
                <div>
                  <span className="code-key">component</span>
                  {': '}
                  <span className="code-str">"App {'>'} Layout {'>'} Sidebar {'>'} NavItem"</span>
                </div>
                <div>
                  <span className="code-key">file</span>
                  {': '}
                  <span className="code-str">"src/components/Sidebar.tsx:42"</span>
                </div>
                <div style={{ height: '8px' }} />
                <div>
                  <span className="code-key">comment</span>
                  {': '}
                  <span className="code-str">
                    "Button padding collapses on mobile
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;below 768px. Should be
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;padding: 8px 12px at all breakpoints."
                  </span>
                </div>
                <div style={{ height: '8px' }} />
                <div>
                  <span className="code-key">boundingBox</span>
                  {': '}
                  <span className="code-comment">{'{ x: 0, y: 140, w: 200, h: 40 }'}</span>
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#374151' }}>
                  <span style={{ color: '#10b981', flexShrink: 0, marginTop: '1px' }}>✓</span>
                  <span>Exact file path + line number</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#374151' }}>
                  <span style={{ color: '#10b981', flexShrink: 0, marginTop: '1px' }}>✓</span>
                  <span>Full React component hierarchy</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#374151' }}>
                  <span style={{ color: '#10b981', flexShrink: 0, marginTop: '1px' }}>✓</span>
                  <span>Precise CSS selector for targeting</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#374151' }}>
                  <span style={{ color: '#10b981', flexShrink: 0, marginTop: '1px' }}>✓</span>
                  <span>Agent fixes on first try, every time</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="comparison-tagline fade-up delay-3">
          Pinpoint gives your agent <strong>everything it needs</strong>. No guessing,
          no back-and-forth, no wasted tokens.
        </p>
      </div>
    </section>
  );
}
