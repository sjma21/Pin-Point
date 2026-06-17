import { useState } from 'react';
import { Pinpoint } from '@pinpoint/toolbar';
import './demo.css';

// ── Data ─────────────────────────────────────────────────────────────────────

const navItems = [
  { icon: '⊞', label: 'Dashboard' },
  { icon: '📁', label: 'Projects' },
  { icon: '👥', label: 'Team' },
  { icon: '📊', label: 'Analytics' },
  { icon: '⚙️', label: 'Settings' },
];

const chartData = [
  { month: 'Jan', value: 32, max: 60 },
  { month: 'Feb', value: 45, max: 60 },
  { month: 'Mar', value: 38, max: 60 },
  { month: 'Apr', value: 52, max: 60 },
  { month: 'May', value: 48, max: 60 },
  { month: 'Jun', value: 58, max: 60 },
];

const projects = [
  { id: 1, name: 'Q2 Product Redesign', team: 'Design', status: 'Active', progress: 68, due: 'Jun 30', priority: 'High' },
  { id: 2, name: 'API Rate Limiting', team: 'Backend', status: 'Active', progress: 45, due: 'Jul 15', priority: 'Critical' },
  { id: 3, name: 'Mobile App v2', team: 'Mobile', status: 'Active', progress: 82, due: 'Jul 1', priority: 'High' },
  { id: 4, name: 'Customer Portal', team: 'Frontend', status: 'Completed', progress: 100, due: 'Jun 10', priority: 'Medium' },
  { id: 5, name: 'Analytics Dashboard', team: 'Data', status: 'Completed', progress: 100, due: 'May 28', priority: 'Medium' },
  { id: 6, name: 'Auth Refactor', team: 'Backend', status: 'Archived', progress: 35, due: 'Jun 5', priority: 'Low' },
  { id: 7, name: 'Design System 3.0', team: 'Design', status: 'Active', progress: 20, due: 'Aug 1', priority: 'High' },
  { id: 8, name: 'Payment Integration', team: 'Backend', status: 'Active', progress: 55, due: 'Jul 20', priority: 'Critical' },
  { id: 9, name: 'Onboarding Flow', team: 'Frontend', status: 'Completed', progress: 100, due: 'Jun 15', priority: 'High' },
  { id: 10, name: 'Performance Audit', team: 'DevOps', status: 'Active', progress: 30, due: 'Jul 10', priority: 'Medium' },
];

const kanbanData: Record<string, { id: string; title: string; assignee: string; tag: string }[]> = {
  'Todo': [
    { id: 'k1', title: 'Design new onboarding screens', assignee: 'JD', tag: 'Design' },
    { id: 'k2', title: 'Write API documentation', assignee: 'MK', tag: 'Docs' },
    { id: 'k3', title: 'Set up staging environment', assignee: 'TW', tag: 'DevOps' },
  ],
  'In Progress': [
    { id: 'k4', title: 'Implement search functionality', assignee: 'AC', tag: 'Backend' },
    { id: 'k5', title: 'Fix mobile navigation bug', assignee: 'JD', tag: 'Frontend' },
  ],
  'Review': [
    { id: 'k6', title: 'Code review: auth module', assignee: 'MK', tag: 'Backend' },
    { id: 'k7', title: 'QA: payment flow', assignee: 'TW', tag: 'QA' },
  ],
};

const team = [
  { name: 'Jane Doe', role: 'Product Manager', initials: 'JD', color: '#6366f1', tasks: 12, status: 'online' as const },
  { name: 'Alex Chen', role: 'Lead Engineer', initials: 'AC', color: '#22c55e', tasks: 8, status: 'online' as const },
  { name: 'Maya Kim', role: 'Designer', initials: 'MK', color: '#f59e0b', tasks: 6, status: 'away' as const },
  { name: 'Tom Wilson', role: 'DevOps', initials: 'TW', color: '#38bdf8', tasks: 4, status: 'offline' as const },
];

const activities = [
  { id: 1, user: 'Jane', action: 'completed task', target: 'Design new onboarding screens', time: '2m ago', icon: '✅' },
  { id: 2, user: 'Alex', action: 'pushed to', target: 'feature/auth-refactor', time: '15m ago', icon: '🔀' },
  { id: 3, user: 'Maya', action: 'commented on', target: 'Q2 Product Redesign', time: '1h ago', icon: '💬' },
  { id: 4, user: 'Tom', action: 'deployed', target: 'staging environment', time: '2h ago', icon: '🚀' },
  { id: 5, user: 'Jane', action: 'created project', target: 'Design System 3.0', time: '3h ago', icon: '📁' },
  { id: 6, user: 'Alex', action: 'resolved issue', target: 'API rate limiting bug', time: '5h ago', icon: '🐛' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

interface SidebarProps {
  activeSection: string;
  onNav: (s: string) => void;
}

function DemoSidebar({ activeSection, onNav }: SidebarProps) {
  return (
    <aside className="demo-sidebar">
      <div className="demo-logo">
        <span className="demo-logo-icon">🔷</span>
        <span className="demo-logo-text">Orbit</span>
      </div>
      <nav className="demo-nav">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`demo-nav-item${activeSection === item.label ? ' active' : ''}`}
            onClick={() => onNav(item.label)}
          >
            <span className="demo-nav-icon">{item.icon}</span>
            <span className="demo-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="demo-sidebar-spacer" />
      <div className="demo-upgrade-box">
        <div className="demo-upgrade-title">Upgrade to Pro</div>
        <div className="demo-upgrade-desc">Unlock advanced analytics and unlimited projects.</div>
        <button className="demo-upgrade-btn">Upgrade Now</button>
      </div>
      <div className="demo-user-profile">
        <div className="demo-avatar">JD</div>
        <div className="demo-user-info">
          <div className="demo-user-name">Jane Doe</div>
          <div className="demo-user-role">Product Manager</div>
        </div>
        <span className="demo-user-menu">⋯</span>
      </div>
    </aside>
  );
}

function DemoHeader() {
  return (
    <header className="demo-header">
      <div className="demo-breadcrumb">
        <span className="demo-breadcrumb-root">Orbit</span>
        <span className="demo-breadcrumb-sep">/</span>
        <span className="demo-breadcrumb-current">Dashboard</span>
      </div>
      <div className="demo-header-actions">
        <div className="demo-search-bar">
          <span className="demo-search-icon">🔍</span>
          <input
            type="text"
            className="demo-search-input"
            placeholder="Search projects, tasks..."
            readOnly
          />
          <kbd className="demo-search-shortcut">⌘K</kbd>
        </div>
        <button className="demo-notification-btn">
          🔔
          <span className="demo-notification-badge">3</span>
        </button>
        <div className="demo-header-avatar">JD</div>
      </div>
    </header>
  );
}

function StatsRow() {
  const stats = [
    { icon: '💰', label: 'Revenue', value: '$48,250', delta: '+12.5%', deltaType: 'up', sub: 'from last month' },
    { icon: '👤', label: 'Active Users', value: '2,840', delta: '+8.3%', deltaType: 'up', sub: 'from last week' },
    { icon: '✅', label: 'Open Tasks', value: '124', delta: '+3', deltaType: 'down', sub: 'new today' },
    { icon: '🟢', label: 'System Uptime', value: '99.9%', delta: '+0.1%', deltaType: 'up', sub: 'from last week' },
  ];
  return (
    <div className="demo-stats-grid">
      {stats.map((s) => (
        <div className="demo-stat-card" key={s.label}>
          <div className="demo-stat-top">
            <div className="demo-stat-icon">{s.icon}</div>
            <span className={`demo-stat-delta demo-delta-${s.deltaType}`}>
              {s.deltaType === 'up' ? '↑' : '↓'} {s.delta}
            </span>
          </div>
          <div className="demo-stat-value">{s.value}</div>
          <div className="demo-stat-label">{s.label}</div>
          <div className="demo-stat-sub">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

function ChartSection() {
  return (
    <div className="demo-section">
      <div className="demo-section-header">
        <h2 className="demo-section-title">Revenue by Month</h2>
        <div className="demo-section-actions">
          <button className="demo-action-btn demo-action-btn-active">6M</button>
          <button className="demo-action-btn">1Y</button>
          <button className="demo-action-btn">All</button>
        </div>
      </div>
      <div className="demo-chart-card">
        <div className="demo-chart-bars">
          {chartData.map((d) => (
            <div className="demo-bar-row" key={d.month}>
              <span className="demo-bar-label">{d.month}</span>
              <div className="demo-bar-track">
                <div
                  className="demo-bar-fill"
                  style={{ width: `${(d.value / d.max) * 100}%` }}
                />
              </div>
              <span className="demo-bar-value">${d.value}k</span>
            </div>
          ))}
        </div>
        <div className="demo-chart-legend">
          <span className="demo-legend-dot" />
          <span className="demo-legend-label">Monthly Revenue (USD)</span>
        </div>
      </div>
    </div>
  );
}

type FilterType = 'All' | 'Active' | 'Completed' | 'Archived';

function ProjectsTable() {
  const [filter, setFilter] = useState<FilterType>('All');
  const filters: FilterType[] = ['All', 'Active', 'Completed', 'Archived'];

  const filtered = filter === 'All' ? projects : projects.filter((p) => p.status === filter);

  return (
    <div className="demo-section">
      <div className="demo-section-header">
        <h2 className="demo-section-title">Projects</h2>
        <button className="demo-btn-primary">+ New Project</button>
      </div>
      <div className="demo-table-card">
        <div className="demo-table-filters">
          {filters.map((f) => (
            <button
              key={f}
              className={`demo-filter-btn${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
              <span className="demo-filter-count">
                {f === 'All' ? projects.length : projects.filter((p) => p.status === f).length}
              </span>
            </button>
          ))}
        </div>
        <table className="demo-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Team</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="demo-table-name">{p.name}</td>
                <td><span className="demo-team-chip">{p.team}</span></td>
                <td>
                  <div className="demo-progress-wrap">
                    <div className="demo-progress-bar">
                      <div
                        className="demo-progress-fill"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <span className="demo-progress-label">{p.progress}%</span>
                  </div>
                </td>
                <td>
                  <span className={`demo-badge demo-badge-${p.status.toLowerCase()}`}>
                    {p.status}
                  </span>
                </td>
                <td className="demo-table-due">{p.due}</td>
                <td>
                  <span className={`demo-badge demo-badge-${p.priority.toLowerCase()}`}>
                    {p.priority}
                  </span>
                </td>
                <td>
                  <button className="demo-view-btn">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KanbanBoard() {
  const columns = ['Todo', 'In Progress', 'Review'];
  return (
    <div className="demo-section demo-section-kanban">
      <div className="demo-section-header">
        <h2 className="demo-section-title">Sprint Board</h2>
        <button className="demo-action-btn">+ Add Task</button>
      </div>
      <div className="demo-kanban-board">
        {columns.map((col) => (
          <div className="demo-kanban-col" key={col}>
            <div className="demo-kanban-header">
              <span className="demo-kanban-title">{col}</span>
              <span className="demo-kanban-count">{kanbanData[col].length}</span>
            </div>
            <div className="demo-kanban-cards">
              {kanbanData[col].map((card) => (
                <div className="demo-kanban-card" key={card.id}>
                  <div className="demo-card-title">{card.title}</div>
                  <div className="demo-card-footer">
                    <span className="demo-card-tag">{card.tag}</span>
                    <div className="demo-card-assignee">{card.assignee}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamSection() {
  return (
    <div className="demo-section demo-section-team">
      <div className="demo-section-header">
        <h2 className="demo-section-title">Team</h2>
        <button className="demo-action-btn">Manage</button>
      </div>
      <div className="demo-team-grid">
        {team.map((member) => (
          <div className="demo-team-member" key={member.name}>
            <div className="demo-member-top">
              <div
                className="demo-member-avatar"
                style={{ background: member.color }}
              >
                {member.initials}
                <span className={`demo-status-dot demo-status-${member.status}`} />
              </div>
              <div className="demo-member-info">
                <div className="demo-member-name">{member.name}</div>
                <div className="demo-member-role">{member.role}</div>
              </div>
            </div>
            <div className="demo-member-tasks">
              <span className="demo-tasks-label">Tasks</span>
              <span className="demo-tasks-count">{member.tasks}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityFeed() {
  return (
    <div className="demo-section">
      <div className="demo-section-header">
        <h2 className="demo-section-title">Recent Activity</h2>
        <button className="demo-action-btn">View All</button>
      </div>
      <div className="demo-activity-card">
        <ul className="demo-activity-list">
          {activities.map((a) => (
            <li className="demo-activity-item" key={a.id}>
              <div className="demo-activity-icon">{a.icon}</div>
              <div className="demo-activity-body">
                <span className="demo-activity-user">{a.user}</span>
                {' '}<span className="demo-activity-action">{a.action}</span>
                {' '}<span className="demo-activity-target">{a.target}</span>
              </div>
              <span className="demo-activity-time">{a.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function DemoApp() {
  const [activeSection, setActiveSection] = useState('Dashboard');

  return (
    <>
      <div className="demo-announce-bar">
        <span className="demo-announce-icon">📍</span>
        <span>This is a live demo — the Pinpoint toolbar is active.</span>
        <strong> Click any element to annotate it.</strong>
        <span className="demo-announce-shortcut">Press <kbd>Cmd+Shift+F</kbd> to toggle</span>
        <a href="/" className="demo-announce-back">← Back to site</a>
      </div>
      <div className="demo-app">
        <DemoSidebar activeSection={activeSection} onNav={setActiveSection} />
        <main className="demo-main">
          <DemoHeader />
          <div className="demo-content">
            <StatsRow />
            <ChartSection />
            <ProjectsTable />
            <div className="demo-two-col">
              <KanbanBoard />
              <TeamSection />
            </div>
            <ActivityFeed />
          </div>
        </main>
      </div>
      <Pinpoint
        endpoint="http://localhost:4747"
        onSessionCreated={(id: string) => console.log('[Pinpoint] session:', id)}
      />
    </>
  );
}
