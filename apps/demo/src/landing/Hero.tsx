import { useEffect, useRef } from 'react';

interface StatCard {
  label: string;
  value: string;
  up: boolean;
}

function BrowserMockup() {
  const statCards: StatCard[] = [
    { label: 'Revenue', value: '$48.2k', up: true },
    { label: 'Users', value: '2,840', up: true },
    { label: 'Tasks', value: '124', up: false },
    { label: 'Uptime', value: '99.9%', up: true },
  ];

  const navItems = ['Dashboard', 'Projects', 'Team', 'Analytics', 'Settings'];

  return (
    <div className="browser-wrap">
      <div className="browser-mockup">
        {/* Chrome bar */}
        <div className="browser-chrome">
          <div className="browser-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <div className="browser-address">localhost:5173/dashboard</div>
        </div>

        {/* Content area — fake dashboard */}
        <div className="browser-content">
          {/* Sidebar */}
          <div className="fake-sidebar">
            <div className="fake-logo">🔷 Orbit</div>
            {navItems.map((item) => (
              <div
                key={item}
                className={`fake-nav-item${item === 'Dashboard' ? ' active' : ''}`}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="fake-main">
            <div className="fake-header">
              <span className="fake-title">Dashboard</span>
              <span className="fake-date">June 2025</span>
            </div>

            {/* Stat cards */}
            <div className="fake-stats">
              {statCards.map((s) => (
                <div key={s.label} className="fake-stat-card">
                  <span className="fake-stat-label">{s.label}</span>
                  <span className="fake-stat-value">{s.value}</span>
                  <span className={`fake-stat-delta ${s.up ? 'up' : 'down'}`}>
                    {s.up ? '↑ 12%' : '↓ 3%'}
                  </span>
                </div>
              ))}
            </div>

            {/* Table section with annotation highlight */}
            <div className="fake-table-section">
              <div className="fake-table-header">Recent Projects</div>

              <div className="fake-table-row highlighted">
                <span className="fake-row-name">Q2 Redesign</span>
                <span className="fake-row-status">In Progress</span>
                <span className="fake-row-btn">View →</span>
                <div className="fake-highlight-border" />
              </div>

              <div className="fake-table-row">
                <span className="fake-row-name">API Integration</span>
                <span className="fake-row-status">Done</span>
                <span className="fake-row-btn">View →</span>
              </div>

              <div className="fake-table-row">
                <span className="fake-row-name">Mobile App</span>
                <span className="fake-row-status">Pending</span>
                <span className="fake-row-btn">View →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Pinpoint toolbar */}
        <div className="fake-toolbar">
          <span className="fake-toolbar-logo">📍 Pinpoint</span>
          <span className="fake-toolbar-badge">2</span>
          <div className="fake-toolbar-btns">
            <span className="fake-toolbar-capture">Capturing</span>
          </div>
        </div>

        {/* Annotation popup */}
        <div className="fake-popup">
          <div className="fake-popup-header">Add Annotation</div>
          <div className="fake-popup-chips">
            <span className="fake-chip bug active">Bug</span>
            <span className="fake-chip">Improve</span>
            <span className="fake-chip">Question</span>
          </div>
          <div className="fake-popup-text">
            Button has no focus ring — keyboard users can't tell where focus is.
          </div>
          <div className="fake-popup-footer">
            <span className="fake-popup-btn-cancel">Cancel</span>
            <span className="fake-popup-btn-add">✓ Add</span>
          </div>
        </div>
      </div>

      {/* Glow underneath */}
      <div className="browser-glow" />
    </div>
  );
}

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger fade-up animations immediately since hero is above the fold
    const el = heroRef.current;
    if (!el) return;

    const fadeEls = el.querySelectorAll<HTMLElement>('.fade-up');
    const frame = requestAnimationFrame(() => {
      fadeEls.forEach((fadeEl) => {
        fadeEl.classList.add('is-visible');
      });
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-content">
        {/* Badge */}
        <div className="hero-badge fade-up">
          ✨ Now with MCP Support
        </div>

        {/* Headline */}
        <h1 className="hero-headline fade-up delay-1">
          Visual feedback for
          <br />
          <span className="accent">AI coding agents.</span>
        </h1>

        {/* Subheadline */}
        <p className="hero-subheadline fade-up delay-2">
          Click any element in your running app to leave structured annotations.
          Your AI agent reads the context and fixes the issue — without guessing.
        </p>

        {/* CTA buttons */}
        <div className="hero-cta fade-up delay-3">
          <a href="/demo" className="btn-primary btn-lg">
            Start annotating →
          </a>
          <a href="/demo" className="btn-outline btn-lg">
            Try Live Demo
          </a>
        </div>

        {/* Trust signals */}
        <div className="hero-trust fade-up delay-4">
          <span className="hero-trust-item">Free &amp; open source</span>
          <span className="hero-trust-dot">·</span>
          <span className="hero-trust-item">Works with Claude Code</span>
          <span className="hero-trust-dot">·</span>
          <span className="hero-trust-item">MIT license</span>
        </div>
      </div>

      {/* Browser Mockup — key hero visual */}
      <BrowserMockup />
    </section>
  );
}
