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

export default function InstallSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useInView(sectionRef as RefObject<Element>);

  return (
    <section id="install" className="install-section" ref={sectionRef}>
      <div className="container">
        {/* Header */}
        <div className="install-header fade-up">
          <span className="section-label">QUICK START</span>
          <h2 className="section-heading">Get started in 30 seconds</h2>
        </div>

        {/* Steps */}
        <div className="install-steps">
          {/* Step 1 */}
          <div className="install-step fade-up delay-1">
            <div className="install-step-header">
              <div className="install-step-num">1</div>
              <div className="install-step-title">Add to your app</div>
            </div>
            <div className="install-code-block">
              <div>
                <span className="prompt">$ </span>
                <span>npm install </span>
                <span className="string">@sajalmishra/markpin</span>
              </div>
              <div style={{ height: '16px' }} />
              <div className="comment">{'// Import the component'}</div>
              <div>
                <span className="keyword">import</span>
                {' { '}
                <span className="fn">Pinpoint</span>
                {' } '}
                <span className="keyword">from</span>
                {' '}
                <span className="string">'@sajalmishra/markpin'</span>
                {';'}
              </div>
              <div style={{ height: '16px' }} />
              <div className="comment">{'// Add to your app (dev only):'}</div>
              <div>
                {'  {'}
                <span className="fn">import.meta.env</span>
                {'.DEV && ('}
              </div>
              <div>
                {'    <'}
                <span className="fn">Pinpoint</span>
              </div>
              <div>
                {'      '}
                <span className="keyword">endpoint</span>
                {'='}
                <span className="string">"http://localhost:4747"</span>
              </div>
              <div>
                {'    />'}
              </div>
              <div>{'  )}'}</div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="install-step fade-up delay-2">
            <div className="install-step-header">
              <div className="install-step-num">2</div>
              <div className="install-step-title">Start the MCP server</div>
            </div>
            <div className="install-code-block">
              <div>
                <span className="prompt">$ </span>
                <span>npx @sajalmishra/markpin-mcp server</span>
              </div>
              <div style={{ height: '16px' }} />
              <div>
                <span className="success">✓ </span>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Pinpoint MCP server running
                </span>
              </div>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {'  '}at{' '}
                </span>
                <span className="string">http://localhost:4747</span>
              </div>
              <div style={{ height: '16px' }} />
              <div>
                <span className="success">✓ </span>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                  SSE stream ready at
                </span>
              </div>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {'  '}
                </span>
                <span className="string">http://localhost:4747/events</span>
              </div>
              <div style={{ height: '16px' }} />
              <div>
                <span className="success">✓ </span>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                  MCP tools registered in Claude Code
                </span>
              </div>
              <div style={{ height: '16px' }} />
              <div className="comment">
                {'# Then tell Claude Code:'}
              </div>
              <div className="comment">
                {'# "watch mode" to start hands-free'}
              </div>
            </div>
          </div>
        </div>

        {/* Docs link */}
        <div className="install-link-row fade-up delay-3">
          <a href="/install" className="install-docs-link">
            Read the full docs →
          </a>
        </div>
      </div>
    </section>
  );
}
