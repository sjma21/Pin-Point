import Layout from '../components/Layout';
import Callout from '../components/Callout';
import CodeBlock from '../components/CodeBlock';

const toc = [
  { id: 'dev-only', label: 'Dev only?' },
  { id: 'frameworks', label: 'Frameworks' },
  { id: 'data-privacy', label: 'Data privacy' },
  { id: 'source-detection', label: 'Source detection' },
  { id: 'non-react', label: 'Non-React apps' },
  { id: 'nextjs', label: 'Next.js' },
  { id: 'what-is-mcp', label: 'What is MCP?' },
  { id: 'vs-chat', label: 'vs. describing in chat' },
  { id: 'multi-user', label: 'Multiple users' },
  { id: 'pricing', label: 'Pricing' },
];

const nextjsCode = `const Pinpoint = dynamic(
  () => import('@pinpoint/toolbar').then(m => m.Pinpoint),
  { ssr: false }
);`;

export default function Faq() {
  return (
    <Layout toc={toc}>
      <p className="page-eyebrow">More</p>
      <h1>FAQ</h1>
      <p className="page-description">Common questions about Pinpoint.</p>

      <section id="dev-only">
        <h3>Does Pinpoint work in production?</h3>
        <p>
          No — Pinpoint is designed for development use only. The toolbar should be
          wrapped in a development check:{' '}
          <code>{'{import.meta.env.DEV && <Pinpoint />}'}</code>. The MCP server
          also runs locally and does not have any authentication. Never expose the
          MCP server port publicly.
        </p>
        <Callout type="warning">
          Always guard the toolbar with a dev-only check. Never ship Pinpoint in a
          production build or expose port 4747 outside your local machine.
        </Callout>
      </section>

      <section id="frameworks">
        <h3>Which frameworks are supported?</h3>
        <p>
          Pinpoint works with any React 18+ application regardless of the bundler or
          framework: Vite, Next.js, Remix, Create React App, and others. The toolbar
          is a standard React component that renders into a portal.
        </p>
      </section>

      <section id="data-privacy">
        <h3>Does Pinpoint send data anywhere?</h3>
        <p>
          No. All annotations are stored in memory on your local machine in the MCP
          server process. Nothing is sent to any external server. When the MCP server
          process stops, all annotations are lost — they are not persisted to disk
          unless you add your own storage layer.
        </p>
      </section>

      <section id="source-detection">
        <h3>How does the agent know which file to edit?</h3>
        <p>
          Pinpoint reads the <code>_debugSource</code> property from React's internal
          fiber tree. In development mode, React embeds the source file path and line
          number into each component's fiber. Pinpoint walks the fiber tree from the
          annotated DOM node upward and extracts the first source reference it finds.
          This is stored in <code>metadata.sourceFile</code>.
        </p>
        <p>
          Source maps must be enabled (they are by default in Vite and CRA dev mode).
        </p>
      </section>

      <section id="non-react">
        <h3>What if I'm not using React?</h3>
        <p>
          The toolbar itself requires React, but the annotations it creates still
          include <code>target.selector</code> (the CSS selector) and{' '}
          <code>target.boundingBox</code>, which work for any HTML element regardless
          of framework. Source file detection (<code>metadata.sourceFile</code>)
          requires React and won't be available in non-React apps.
        </p>
      </section>

      <section id="nextjs">
        <h3>Does it work with Next.js?</h3>
        <p>
          Yes. Use <code>dynamic</code> import with <code>{`{ ssr: false }`}</code>{' '}
          to prevent server-side rendering:
        </p>
        <CodeBlock language="tsx" code={nextjsCode} />
        <p>
          Then render{' '}
          <code>{'<Pinpoint endpoint="http://localhost:4747" />'}</code> inside your
          root layout.
        </p>
      </section>

      <section id="what-is-mcp">
        <h3>What is MCP?</h3>
        <p>
          MCP (Model Context Protocol) is an open standard developed by Anthropic
          that lets AI agents discover and call tools exposed by external servers.
          The Pinpoint MCP server registers 9 tools that your AI agent (Claude Code,
          Cursor, etc.) can call to read and update annotations. Learn more at{' '}
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            modelcontextprotocol.io
          </a>
          .
        </p>
      </section>

      <section id="vs-chat">
        <h3>How is this different from describing the issue in chat?</h3>
        <p>
          When you describe a UI issue in chat, the agent has no context: it doesn't
          know which component, which file, what the element looks like, or where it
          is on the page. With Pinpoint, the agent gets the CSS selector, React
          component hierarchy, source file path, bounding box, and computed styles —
          all in a structured format it can act on immediately without asking
          follow-up questions.
        </p>
      </section>

      <section id="multi-user">
        <h3>Can multiple people use it at the same time?</h3>
        <p>
          The MCP server supports multiple concurrent browser sessions. Each browser
          tab that loads Pinpoint gets its own session. Multiple users on the same
          network can connect to the same MCP server and each get their own session.
          Use <code>pinpoint_list_sessions</code> to see all active sessions.
        </p>
      </section>

      <section id="pricing">
        <h3>Is it free?</h3>
        <p>
          Yes — Pinpoint is free and open source (MIT license). The toolbar package
          and MCP server are both open source. There is no paid tier, no cloud
          service, and no account required.
        </p>
      </section>

      <Callout type="success">
        Still have questions? Open an issue on GitHub or use Pinpoint itself to
        annotate this page — the toolbar is active right now.
      </Callout>
    </Layout>
  );
}
