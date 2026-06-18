import { useState } from 'react';
// In your app: import { Pinpoint } from '@sajalmishra/markpin'
// In this demo: using local workspace build via Vite alias
import { Pinpoint } from '@sajalmishra/markpin';
import './demo.css';
import PinpointLogo from '../components/PinpointLogo';

// ─── Top Nav ────────────────────────────────────────────────────────────────

function AppNav() {
  const [active, setActive] = useState('Dashboard');
  const links = ['Dashboard', 'Projects', 'Team', 'Settings'];
  return (
    <header className="app-nav">
      <div className="app-nav-inner">
        <div className="app-logo">
          <span className="app-logo-mark">▲</span>
          <span className="app-logo-name">Acme</span>
        </div>
        <nav className="app-links">
          {links.map((l) => (
            <button
              key={l}
              className={`app-link${active === l ? ' active' : ''}`}
              onClick={() => setActive(l)}
            >
              {l}
            </button>
          ))}
        </nav>
        <div className="app-nav-right">
          <button className="app-notif" aria-label="Notifications">
            🔔
            <span className="app-notif-dot" />
          </button>
          <div className="app-avatar">JD</div>
        </div>
      </div>
    </header>
  );
}

// ─── Stats ───────────────────────────────────────────────────────────────────

const stats = [
  { label: 'Total Revenue', value: '$48,250', delta: '+12.5%', up: true },
  { label: 'Active Users', value: '2,840', delta: '+8.3%', up: true },
  { label: 'Open Tasks', value: '124', delta: '↓ 3 this week', up: false },
  { label: 'Uptime', value: '99.9%', delta: 'All systems up', up: true },
];

function StatsRow() {
  return (
    <div className="stats-grid">
      {stats.map((s) => (
        <div key={s.label} className="stat-card">
          <div className="stat-label">{s.label}</div>
          <div className="stat-value">{s.value}</div>
          <div className={`stat-delta ${s.up ? 'up' : 'down'}`}>{s.delta}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Projects ─────────────────────────────────────────────────────────────

const projects = [
  { name: 'Q3 Redesign', team: 'Design', progress: 68, status: 'In Progress', due: 'Jul 15' },
  { name: 'API v2 Migration', team: 'Backend', progress: 45, status: 'In Progress', due: 'Aug 1' },
  { name: 'Mobile App Beta', team: 'Mobile', progress: 82, status: 'Review', due: 'Jun 30' },
  { name: 'Analytics Dashboard', team: 'Data', progress: 100, status: 'Done', due: 'Jun 10' },
];

const statusColor: Record<string, string> = {
  'In Progress': 'blue',
  Review: 'yellow',
  Done: 'green',
  Blocked: 'red',
};

function ProjectsSection() {
  return (
    <section className="app-section">
      <div className="section-row">
        <h2 className="section-title">Projects</h2>
        <button className="btn-primary">+ New project</button>
      </div>
      <div className="projects-list">
        {projects.map((p) => (
          <div key={p.name} className="project-row">
            <div className="project-info">
              <span className="project-name">{p.name}</span>
              <span className="project-team">{p.team}</span>
            </div>
            <div className="project-progress">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${p.progress}%` }} />
              </div>
              <span className="progress-num">{p.progress}%</span>
            </div>
            <span className={`status-badge ${statusColor[p.status]}`}>{p.status}</span>
            <span className="project-due">Due {p.due}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Team ─────────────────────────────────────────────────────────────────

const team = [
  { initials: 'JD', name: 'Jane Doe', role: 'Product', online: true, color: '#6366f1' },
  { initials: 'SL', name: 'Sam Lee', role: 'Design', online: true, color: '#22c55e' },
  { initials: 'MK', name: 'Mike Kim', role: 'Frontend', online: false, color: '#f59e0b' },
  { initials: 'RC', name: 'Rachel Chen', role: 'Backend', online: true, color: '#38bdf8' },
  { initials: 'TN', name: 'Tom Nguyen', role: 'QA', online: false, color: '#a855f7' },
];

function TeamSection() {
  return (
    <section className="app-section">
      <div className="section-row">
        <h2 className="section-title">Team</h2>
        <button className="btn-ghost">Invite member</button>
      </div>
      <div className="team-list">
        {team.map((m) => (
          <div key={m.name} className="team-member">
            <div className="team-avatar" style={{ background: m.color }}>
              {m.initials}
              <span className={`online-dot ${m.online ? 'on' : 'off'}`} />
            </div>
            <div className="team-info">
              <div className="team-name">{m.name}</div>
              <div className="team-role">{m.role}</div>
            </div>
            <button className="btn-ghost btn-sm">Message</button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Activity ─────────────────────────────────────────────────────────────

const activity = [
  { icon: '✅', text: 'Jane completed "Fix mobile nav button alignment"', time: '2m ago' },
  { icon: '🚀', text: 'Sam deployed Q3 Redesign to staging', time: '34m ago' },
  { icon: '💬', text: 'Mike left a comment on API v2 Migration', time: '1h ago' },
  { icon: '📁', text: 'Rachel created a new project: Analytics Dashboard', time: '3h ago' },
];

function ActivitySection() {
  return (
    <section className="app-section">
      <h2 className="section-title" style={{ marginBottom: 16 }}>Recent Activity</h2>
      <div className="activity-list">
        {activity.map((a, i) => (
          <div key={i} className="activity-item">
            <span className="activity-icon">{a.icon}</span>
            <span className="activity-text">{a.text}</span>
            <span className="activity-time">{a.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Hint bar ─────────────────────────────────────────────────────────────

function HintBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="hint-bar">
      <span className="hint-dot" />
      <PinpointLogo size={16} />
      <span>Pinpoint is active — click any element on this page to annotate it</span>
      <button className="hint-close" onClick={() => setVisible(false)}>×</button>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────

export default function DemoApp() {
  return (
    <div className="demo-root">
      <HintBar />
      <AppNav />
      <main className="demo-body">
        <div className="demo-content">
          {/* Page header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Dashboard</h1>
              <p className="page-sub">Welcome back, Jane. Here's what's happening.</p>
            </div>
            <button className="btn-primary btn-lg">+ New project</button>
          </div>

          <StatsRow />
          <ProjectsSection />

          <div className="two-col">
            <TeamSection />
            <ActivitySection />
          </div>
        </div>
      </main>

      <a href="/" className="back-link">← Back to site</a>

      <Pinpoint
        endpoint="http://localhost:4747"
        onSessionCreated={(id) => console.log('[Pinpoint] session:', id)}
      />
    </div>
  );
}
