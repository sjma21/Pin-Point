import { useEffect, useRef, RefObject } from 'react';
import PinpointLogo from '../components/PinpointLogo';

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

function DemoPreview() {
  return (
    <div className="demo-preview">
      {/* Mini browser chrome */}
      <div className="demo-preview-chrome">
        <div className="browser-dots">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </div>
        <div className="browser-address">localhost:5173/demo</div>
      </div>

      {/* Mini dashboard */}
      <div className="demo-preview-content">
        <div className="demo-mini-card">
          <div className="demo-mini-label">Revenue</div>
          <div className="demo-mini-value">$48.2k</div>
        </div>
        <div className="demo-mini-card">
          <div className="demo-mini-label">Active Users</div>
          <div className="demo-mini-value">2,840</div>
        </div>

        <div className="demo-mini-table">
          <div className="demo-mini-row demo-mini-row-header" style={{ background: '#f9fafb', fontWeight: 600, fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Project</span>
            <span>Status</span>
          </div>
          <div className="demo-mini-row pinpointed">
            <span style={{ fontWeight: 500, color: '#111' }}>Q2 Redesign</span>
            <span style={{ fontSize: '11px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>
              In Progress
            </span>
          </div>
          <div className="demo-mini-row">
            <span style={{ fontWeight: 500, color: '#374151' }}>API Integration</span>
            <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>
              Done
            </span>
          </div>
          <div className="demo-mini-row">
            <span style={{ fontWeight: 500, color: '#374151' }}>Mobile App</span>
            <span style={{ fontSize: '11px', background: '#fefce8', color: '#ca8a04', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>
              Pending
            </span>
          </div>
        </div>

        {/* Pinpoint toolbar overlay inside the preview */}
        <div style={{
          gridColumn: '1 / -1',
          display: 'flex',
          justifyContent: 'flex-end',
          paddingTop: '4px',
        }}>
          <div style={{
            background: '#6366f1',
            borderRadius: '10px',
            padding: '6px 12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#fff',
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          }}>
            <PinpointLogo size={16} /> Pinpoint
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 700,
            }}>
              1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoCta() {
  const sectionRef = useRef<HTMLElement>(null);
  useInView(sectionRef as RefObject<Element>);

  return (
    <section id="demo" className="demo-cta-section" ref={sectionRef}>
      <div className="container">
        <div className="demo-cta-content">
          <div className="fade-up">
            <span className="section-label" style={{ color: 'rgba(99,102,241,0.8)' }}>
              LIVE DEMO
            </span>
          </div>

          <h2 className="section-heading fade-up delay-1">See it in action</h2>

          <p className="demo-cta-sub fade-up delay-2">
            The demo below is a real app with Pinpoint installed. Click any element
            to annotate it and watch Claude Code respond.
          </p>

          <div className="fade-up delay-3">
            <a href="/demo" className="btn-primary btn-lg">
              Launch Interactive Demo →
            </a>
          </div>

          <div className="fade-up delay-4">
            <DemoPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
