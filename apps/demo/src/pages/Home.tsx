import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Callout from '../components/Callout';
import CodeTabs from '../components/CodeTabs';
import CodeBlock from '../components/CodeBlock';

const toc = [
  { id: 'overview', label: 'Overview' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'quick-start', label: 'Quick start' },
  { id: 'annotation-anatomy', label: 'Annotation anatomy' },
  { id: 'agent-modes', label: 'Agent modes' },
];

const installTabs = [
  { label: 'npm', code: 'npm install @pinpoint/toolbar' },
  { label: 'pnpm', code: 'pnpm add @pinpoint/toolbar' },
  { label: 'yarn', code: 'yarn add @pinpoint/toolbar' },
];

const usageCode = `import { Pinpoint } from '@pinpoint/toolbar';

export function App() {
  return (
    <>
      <YourApp />
      <Pinpoint endpoint="http://localhost:4747" />
    </>
  );
}`;

const serverCode = `npx pinpoint server
# MCP server running at http://localhost:4747`;

export default function Home() {
  return (
    <Layout toc={toc}>
      <p className="page-eyebrow">Documentation</p>
      <h1>Visual feedback for AI agents</h1>
      <p className="page-description">
        Pinpoint lets you click any element in your running app to leave structured
        annotations. Your AI coding agent reads the annotations, finds the source
        file, and fixes the issue — all without you describing which component or
        line of code.
      </p>

      {/* Overview */}
      <section id="overview">
        <h2>What is Pinpoint?</h2>
        <p>
          Pinpoint injects a small toolbar into your dev app. You click{' '}
          <strong>Capture</strong>, then click any element. A popup lets you choose
          intent (Bug / Improvement / Question / etc), severity, and write a comment.
          The annotation is POSTed to the MCP server, which your AI agent is
          watching. The agent reads the React component hierarchy, CSS selector,
          source file path, and bounding box — enough to find and fix the issue
          without guesswork.
        </p>

        <div className="card-grid">
          <div className="card">
            <h3>Click to annotate</h3>
            <p>
              Click Capture, then click any element. Pinpoint captures the CSS
              selector, React component tree, source file path, and bounding box.
            </p>
          </div>
          <div className="card">
            <h3>Agent reads context</h3>
            <p>
              Your AI agent calls <code>pinpoint_get_pending</code> and gets a
              fully-structured annotation with everything it needs to find and fix
              the issue.
            </p>
          </div>
          <div className="card">
            <h3>Real-time sync</h3>
            <p>
              Annotations sync via SSE. The agent acknowledges, fixes, and resolves
              each annotation — you see marker pins change color in real time.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works">
        <h2>How it works</h2>
        <ol>
          <li>
            <strong>Install</strong> the toolbar and MCP server
          </li>
          <li>
            <strong>Start</strong> your dev server and the Pinpoint MCP server (
            <code>npx pinpoint server</code>)
          </li>
          <li>
            <strong>Click Capture</strong> in the Pinpoint toolbar to enter
            annotation mode
          </li>
          <li>
            <strong>Click any element</strong> — a popup appears with intent,
            severity, and comment fields
          </li>
          <li>
            <strong>Your AI agent</strong> calls <code>pinpoint_get_pending</code>,
            reads the annotation, and fixes the code
          </li>
          <li>
            <strong>The agent resolves</strong> the annotation — the marker pin
            disappears
          </li>
        </ol>
      </section>

      {/* Quick start */}
      <section id="quick-start">
        <h2>Quick start</h2>
        <CodeTabs tabs={installTabs} />

        <CodeBlock language="tsx" code={usageCode} />

        <Callout type="info">
          The toolbar is a dev-only tool. Wrap it with{' '}
          <code>{`{process.env.NODE_ENV === 'development' && <Pinpoint />}`}</code>{' '}
          so it never ships to production.
        </Callout>

        <CodeBlock language="bash" code={serverCode} />

        <Callout type="success">
          Add the MCP server to your <code>CLAUDE.md</code> or Claude Code settings
          so your agent can call <code>pinpoint_get_pending</code> and other tools
          automatically.
        </Callout>
      </section>

      {/* Annotation anatomy */}
      <section id="annotation-anatomy">
        <h2>Annotation anatomy</h2>
        <p>Every annotation Pinpoint creates contains:</p>
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>id</code></td>
              <td><code>string</code></td>
              <td>Unique identifier</td>
            </tr>
            <tr>
              <td><code>intent</code></td>
              <td><code>bug | improvement | question | praise | task | note</code></td>
              <td>What kind of feedback this is</td>
            </tr>
            <tr>
              <td><code>severity</code></td>
              <td><code>critical | high | medium | low | info</code></td>
              <td>How urgent the issue is</td>
            </tr>
            <tr>
              <td><code>status</code></td>
              <td><code>open | in_progress | resolved | dismissed</code></td>
              <td>Lifecycle state</td>
            </tr>
            <tr>
              <td><code>comment</code></td>
              <td><code>string</code></td>
              <td>Human-written description</td>
            </tr>
            <tr>
              <td><code>target.selector</code></td>
              <td><code>string</code></td>
              <td>CSS selector for the targeted element</td>
            </tr>
            <tr>
              <td><code>target.url</code></td>
              <td><code>string</code></td>
              <td>Page URL where the annotation was made</td>
            </tr>
            <tr>
              <td><code>target.boundingBox</code></td>
              <td><code>BoundingBox</code></td>
              <td>Pixel coordinates of the element</td>
            </tr>
            <tr>
              <td><code>metadata.sourceFile</code></td>
              <td><code>string</code></td>
              <td>Source file path from React fiber tree</td>
            </tr>
            <tr>
              <td><code>metadata.reactComponents</code></td>
              <td><code>string</code></td>
              <td>React component hierarchy</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Agent modes */}
      <section id="agent-modes">
        <h2>Agent modes</h2>
        <div className="card-grid">
          <div
            className="card"
            style={{ borderLeft: '3px solid var(--color-primary)' }}
          >
            <h3>Hands-free mode</h3>
            <p>
              Tell your agent <em>"watch mode"</em>. It calls{' '}
              <code>pinpoint_watch_annotations</code> in a loop, acknowledges each
              annotation, makes the fix, and resolves it. You just click and walk
              away.
            </p>
          </div>
          <div
            className="card"
            style={{ borderLeft: '3px solid var(--color-primary)' }}
          >
            <h3>Critique mode</h3>
            <p>
              Tell your agent <em>"critique the UI at localhost:5173"</em>. It reads
              your source code and posts 5–10 specific, actionable annotations
              covering a11y, spacing, contrast, and responsiveness.
            </p>
          </div>
          <div
            className="card"
            style={{ borderLeft: '3px solid var(--color-primary)' }}
          >
            <h3>Self-driving mode</h3>
            <p>
              Tell your agent <em>"self-driving mode"</em>. It finds issues itself,
              annotates them, fixes the code, takes a screenshot to verify, then
              resolves — a full loop without you.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
          <Link to="/install" className="btn-primary">
            Get started →
          </Link>
          <Link to="/features" className="btn-ghost">
            See all features
          </Link>
        </div>
      </section>
    </Layout>
  );
}
