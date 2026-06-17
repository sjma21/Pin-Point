import { useState } from 'react';
import { AnnotationIntent, AnnotationSeverity, generateId, truncate } from '@pinpoint/shared';
import { Pinpoint } from '@pinpoint/toolbar';
import CoreTest from './CoreTest';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feature {
  icon: string;
  title: string;
  description: string;
  badge?: string;
}

interface Order {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES: Feature[] = [
  {
    icon: '📍',
    title: 'Precise Targeting',
    description: 'Click any element on the page to attach feedback directly to it. No more "top-left corner" descriptions.',
    badge: 'Core',
  },
  {
    icon: '🤖',
    title: 'Agent-Native',
    description: 'Built on the Annotation Format Schema (AFS). Structured data that coding agents can parse and act on.',
    badge: 'New',
  },
  {
    icon: '📸',
    title: 'Auto Screenshots',
    description: 'Every annotation is accompanied by a full-page screenshot so there\'s never ambiguity about context.',
  },
  {
    icon: '🔗',
    title: 'MCP Integration',
    description: 'Exposes annotations as MCP tools and resources. Drop it into any Claude Code workflow.',
    badge: 'Beta',
  },
  {
    icon: '⚡',
    title: 'Real-time Sync',
    description: 'Annotations sync across browser sessions via Server-Sent Events. Your team sees changes live.',
  },
  {
    icon: '🎨',
    title: 'Visual Overlays',
    description: 'Highlighted bounding boxes show exactly what was annotated. Toggle them on or off at any time.',
  },
];

const ORDERS: Order[] = [
  { id: generateId('ord'), customer: 'Alice Kim',    product: 'Pro Plan',       amount: '$49/mo',  status: 'completed', date: '2026-06-15' },
  { id: generateId('ord'), customer: 'Bob Tran',     product: 'Starter Plan',   amount: '$12/mo',  status: 'completed', date: '2026-06-14' },
  { id: generateId('ord'), customer: 'Carol Hassan', product: 'Enterprise',     amount: '$299/mo', status: 'pending',   date: '2026-06-14' },
  { id: generateId('ord'), customer: 'Dave Osei',    product: 'Pro Plan',       amount: '$49/mo',  status: 'failed',    date: '2026-06-13' },
  { id: generateId('ord'), customer: 'Eva Müller',   product: 'Starter Plan',   amount: '$12/mo',  status: 'completed', date: '2026-06-12' },
];

// ─── Small components ─────────────────────────────────────────────────────────

function Badge({ label, color = 'primary' }: { label: string; color?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' }) {
  const colors: Record<string, string> = {
    primary: 'background:#eef2ff;color:#4f46e5',
    success: 'background:#dcfce7;color:#15803d',
    warning: 'background:#fef9c3;color:#92400e',
    danger:  'background:#fee2e2;color:#b91c1c',
    neutral: 'background:#f1f5f9;color:#475569',
  };
  return (
    <span style={{ ...parseStyle(colors[color]), padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.03em' }}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const map = { completed: 'success', pending: 'warning', failed: 'danger' } as const;
  return <Badge label={status} color={map[status]} />;
}

function parseStyle(s: string): Record<string, string> {
  return Object.fromEntries(
    s.split(';').filter(Boolean).map(pair => {
      const [k, v] = pair.split(':');
      const camel = k.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      return [camel, v.trim()];
    })
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 100 }}>
      <nav style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.2rem' }}>
          <span style={{ fontSize: '1.4rem' }}>📍</span>
          <span>Pinpoint</span>
          <Badge label="demo" color="neutral" />
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1.5rem', listStyle: 'none' }}>
            {['Features', 'Docs', 'Pricing', 'Blog'].map(item => (
              <a key={item} href="#" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>{item}</a>
            ))}
          </div>
          <button style={{ background: 'var(--color-primary)', color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>
            Get Started
          </button>
        </div>
        <button
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(o => !o)}
          style={{ display: 'none', background: 'none', padding: '0.25rem', fontSize: '1.25rem' }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 60%)', padding: '5rem 1.5rem 4rem', textAlign: 'center' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Badge label="Now with MCP Support" color="primary" />
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900, lineHeight: 1.15, margin: '1rem 0 1.25rem', letterSpacing: '-0.02em' }}>
          Visual feedback for<br />
          <span style={{ color: 'var(--color-primary)' }}>AI coding agents</span>
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', maxWidth: 540, margin: '0 auto 2rem', lineHeight: 1.7 }}>
          Click any element on your app to annotate it. Pinpoint turns your feedback into structured data
          that coding agents can actually understand and act on.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{ background: 'var(--color-primary)', color: '#fff', fontWeight: 700, padding: '0.75rem 1.75rem', fontSize: '1rem', boxShadow: 'var(--shadow-md)' }}>
            Start annotating →
          </button>
          <button style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontWeight: 600, padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
            View on GitHub
          </button>
        </div>
        <p style={{ marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          Free & open source · Works with Claude Code · MIT license
        </p>
      </div>
    </section>
  );
}

function FeatureCards() {
  return (
    <section id="features" style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Everything you need</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Designed for humans. Structured for agents.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {FEATURES.map(f => (
          <article key={f.title} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.2s, transform 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; (e.currentTarget as HTMLElement).style.transform = ''; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.75rem' }}>{f.icon}</span>
              {f.badge && <Badge label={f.badge} color={f.badge === 'New' ? 'success' : f.badge === 'Beta' ? 'warning' : 'primary'} />}
            </div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>{f.title}</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', intent: AnnotationIntent.Bug, severity: AnnotationSeverity.Medium, message: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <section style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>Send feedback</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          This form is a demo target. Use Pinpoint to annotate it. Annotation ID: <code style={{ background: 'var(--color-bg)', padding: '0.1rem 0.3rem', borderRadius: 4, fontSize: '0.82rem' }}>{generateId('demo')}</code>
        </p>
        {submitted ? (
          <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', color: '#15803d', fontWeight: 600, textAlign: 'center' }}>
            ✓ Feedback received — thanks!
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Name</span>
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Intent</span>
                <select value={form.intent} onChange={e => setForm(f => ({ ...f, intent: e.target.value as AnnotationIntent }))}>
                  {Object.values(AnnotationIntent).map(v => (
                    <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Severity</span>
                <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value as AnnotationSeverity }))}>
                  {Object.values(AnnotationSeverity).map(v => (
                    <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                  ))}
                </select>
              </label>
            </div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Message</span>
              <textarea
                rows={4}
                placeholder="Describe the issue or feedback…"
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                style={{ resize: 'vertical' }}
                required
              />
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setForm({ name: '', email: '', intent: AnnotationIntent.Bug, severity: AnnotationSeverity.Medium, message: '' })} style={{ background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                Clear
              </button>
              <button type="submit" style={{ background: 'var(--color-primary)', color: '#fff', fontWeight: 700 }}>
                Submit feedback
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <section style={{ maxWidth: 400, margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Interactive Counter</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>A tiny stateful widget — a classic annotation target.</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center' }}>
        <button
          onClick={() => setCount(c => c - 1)}
          style={{ width: 48, height: 48, borderRadius: '50%', fontSize: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}
          aria-label="Decrement"
        >
          −
        </button>
        <span style={{ fontSize: '3rem', fontWeight: 900, minWidth: 64, color: count < 0 ? 'var(--color-danger)' : count > 0 ? 'var(--color-success)' : 'var(--color-text)' }}>
          {count}
        </span>
        <button
          onClick={() => setCount(c => c + 1)}
          style={{ width: 48, height: 48, borderRadius: '50%', fontSize: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}
          aria-label="Increment"
        >
          +
        </button>
      </div>
      <button
        onClick={() => setCount(0)}
        style={{ marginTop: '1.25rem', background: 'none', color: 'var(--color-text-muted)', fontSize: '0.82rem', padding: '0.25rem 0.5rem', border: 'none' }}
      >
        Reset
      </button>
    </section>
  );
}

function OrdersTable() {
  const [filter, setFilter] = useState<'all' | Order['status']>('all');
  const visible = ORDERS.filter(o => filter === 'all' || o.status === filter);

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Recent Orders</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['all', 'completed', 'pending', 'failed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: filter === f ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: filter === f ? '#fff' : 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(order => (
                <tr key={order.id}>
                  <td><code style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{truncate(order.id, 16)}</code></td>
                  <td style={{ fontWeight: 500 }}>{order.customer}</td>
                  <td>{order.product}</td>
                  <td style={{ fontWeight: 600 }}>{order.amount}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{order.date}</td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>No orders match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { label: 'Annotations today', value: '142', delta: '+12%' },
    { label: 'Active sessions', value: '7', delta: '+3' },
    { label: 'Avg. resolution time', value: '4.2 min', delta: '−18%' },
    { label: 'Open bugs', value: '23', delta: '+2' },
  ];
  return (
    <section style={{ background: 'var(--color-primary)', padding: '2.5rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{ color: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: '0.82rem', opacity: 0.8, marginTop: '0.2rem' }}>{s.label}</div>
            <div style={{ fontSize: '0.78rem', marginTop: '0.25rem', background: 'rgba(255,255,255,.15)', display: 'inline-block', padding: '0.1rem 0.5rem', borderRadius: 999 }}>{s.delta}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '3rem 1.5rem 2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.75rem' }}>📍 Pinpoint</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>Visual feedback for the agentic web.</p>
          </div>
          {[
            { heading: 'Product', links: ['Features', 'Changelog', 'Roadmap', 'Pricing'] },
            { heading: 'Developers', links: ['Documentation', 'MCP Reference', 'AFS Schema', 'GitHub'] },
            { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
          ].map(col => (
            <div key={col.heading}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>{col.heading}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {col.links.map(l => <li key={l}><a href="#" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>© 2026 Pinpoint. MIT License.</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Built with ♥ for the agentic era.</span>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div>
      <Nav />
      <main>
        <Hero />
        <FeatureCards />
        <StatsBar />
        <Counter />
        <OrdersTable />
        <ContactForm />
        <CoreTest />
      </main>
      <Footer />
      <Pinpoint
        onAnnotationAdd={ann => console.log('[Pinpoint] annotation added:', ann)}
        onCopy={md => console.log('[Pinpoint] copied markdown:\n', md)}
      />
    </div>
  );
}
