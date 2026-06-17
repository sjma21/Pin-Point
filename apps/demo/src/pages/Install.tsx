import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Callout from '../components/Callout';
import CodeTabs from '../components/CodeTabs';
import CodeBlock from '../components/CodeBlock';

const toc = [
  { id: 'requirements', label: 'Requirements' },
  { id: 'toolbar', label: 'Install the toolbar' },
  { id: 'mcp-server', label: 'MCP server setup' },
  { id: 'props', label: 'Props reference' },
  { id: 'next-steps', label: 'Next steps' },
];

const installTabs = [
  { label: 'npm', code: 'npm install @pinpoint/toolbar' },
  { label: 'pnpm', code: 'pnpm add @pinpoint/toolbar' },
  { label: 'yarn', code: 'yarn add @pinpoint/toolbar' },
];

const appCode = `// src/App.tsx
import { Pinpoint } from '@pinpoint/toolbar';

export function App() {
  return (
    <>
      {/* Your existing app */}
      <MyRoutes />

      {/* Pinpoint toolbar — dev only */}
      {import.meta.env.DEV && (
        <Pinpoint endpoint="http://localhost:4747" />
      )}
    </>
  );
}`;

const nextjsCode = `// app/layout.tsx
import dynamic from 'next/dynamic';

const Pinpoint = dynamic(
  () => import('@pinpoint/toolbar').then(m => m.Pinpoint),
  { ssr: false }
);

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <Pinpoint endpoint="http://localhost:4747" />
        )}
      </body>
    </html>
  );
}`;

const serverStartCode = `npx pinpoint server
# ✓ Pinpoint MCP server running at http://localhost:4747
# ✓ MCP endpoint: http://localhost:4747/mcp`;

const mcpConfigCode = `{
  "mcpServers": {
    "pinpoint": {
      "command": "npx",
      "args": ["pinpoint", "server"],
      "env": {}
    }
  }
}`;

const persistentServerCode = `# Install globally
npm install -g @pinpoint/mcp-server

# Start with a fixed port
pinpoint server --port 4747`;

export default function Install() {
  return (
    <Layout toc={toc}>
      <p className="page-eyebrow">Getting Started</p>
      <h1>Installation</h1>
      <p className="page-description">
        Add Pinpoint to your React app in two steps: install the toolbar package
        and start the MCP server.
      </p>

      {/* Requirements */}
      <section id="requirements">
        <h2>Requirements</h2>
        <table>
          <thead>
            <tr>
              <th>Requirement</th>
              <th>Version</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>React</td>
              <td>18.0 or later</td>
            </tr>
            <tr>
              <td>Node.js</td>
              <td>18.0 or later</td>
            </tr>
            <tr>
              <td>Vite, Next.js, or Create React App</td>
              <td>Any recent version</td>
            </tr>
            <tr>
              <td>pnpm, npm, or yarn</td>
              <td>Any</td>
            </tr>
          </tbody>
        </table>

        <Callout type="warning">
          Pinpoint is designed for development use only. It should not be included
          in production builds.
        </Callout>
      </section>

      {/* Install the toolbar */}
      <section id="toolbar">
        <h2>Install the toolbar</h2>
        <CodeTabs tabs={installTabs} />

        <h3>Add to your app</h3>
        <CodeBlock language="tsx" code={appCode} />

        <Callout type="info">
          The toolbar renders into a portal at the bottom of <code>&lt;body&gt;</code>,
          so it won't interfere with your app's layout or styles.
        </Callout>

        <h3>Next.js</h3>
        <CodeBlock language="tsx" code={nextjsCode} />
      </section>

      {/* MCP server setup */}
      <section id="mcp-server">
        <h2>MCP server setup</h2>

        <h3>Start the server</h3>
        <CodeBlock language="bash" code={serverStartCode} />

        <h3>Add to Claude Code</h3>
        <CodeBlock language="json" code={mcpConfigCode} />
        <p>
          Add this to your <code>.claude/settings.json</code> or run{' '}
          <code>pinpoint init</code> to configure automatically.
        </p>

        <h3>Persistent server (recommended)</h3>
        <CodeBlock language="bash" code={persistentServerCode} />
      </section>

      {/* Props reference */}
      <section id="props">
        <h2>Props reference</h2>
        <table className="prop-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code className="prop-name">endpoint</code></td>
              <td><code className="prop-type">string</code></td>
              <td><span className="prop-default">—</span></td>
              <td>MCP server URL. Required for agent sync.</td>
            </tr>
            <tr>
              <td><code className="prop-name">sessionId</code></td>
              <td><code className="prop-type">string</code></td>
              <td><span className="prop-default">auto</span></td>
              <td>Override the session ID. Auto-generated if omitted.</td>
            </tr>
            <tr>
              <td><code className="prop-name">onAnnotationAdd</code></td>
              <td><code className="prop-type">(ann: Annotation) =&gt; void</code></td>
              <td><span className="prop-default">—</span></td>
              <td>Called when an annotation is created.</td>
            </tr>
            <tr>
              <td><code className="prop-name">onAnnotationDelete</code></td>
              <td><code className="prop-type">(ann: Annotation) =&gt; void</code></td>
              <td><span className="prop-default">—</span></td>
              <td>Called when an annotation is deleted.</td>
            </tr>
            <tr>
              <td><code className="prop-name">onAnnotationsClear</code></td>
              <td><code className="prop-type">() =&gt; void</code></td>
              <td><span className="prop-default">—</span></td>
              <td>Called when all annotations are cleared.</td>
            </tr>
            <tr>
              <td><code className="prop-name">onCopy</code></td>
              <td><code className="prop-type">(markdown: string) =&gt; void</code></td>
              <td><span className="prop-default">—</span></td>
              <td>Called when annotations are copied as markdown.</td>
            </tr>
            <tr>
              <td><code className="prop-name">onSessionCreated</code></td>
              <td><code className="prop-type">(sessionId: string) =&gt; void</code></td>
              <td><span className="prop-default">—</span></td>
              <td>Called once when the session is established.</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Next steps */}
      <section id="next-steps">
        <h2>Next steps</h2>
        <div className="card-grid">
          <Link
            to="/features"
            className="card"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <h3>Explore features →</h3>
            <p>
              See all annotation modes, keyboard shortcuts, and toolbar controls.
            </p>
          </Link>
          <Link
            to="/mcp"
            className="card"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <h3>MCP tools →</h3>
            <p>Learn all 9 MCP tools your agent can use.</p>
          </Link>
          <Link
            to="/output"
            className="card"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <h3>Output formats →</h3>
            <p>See how annotations are serialized for agent consumption.</p>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
