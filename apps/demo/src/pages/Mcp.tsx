import Layout from '../components/Layout';
import Callout from '../components/Callout';
import CodeBlock from '../components/CodeBlock';

const toc = [
  { id: 'overview', label: 'Overview' },
  { id: 'setup', label: 'Setup' },
  { id: 'tools', label: 'MCP tools' },
  { id: 'hands-free', label: 'Hands-free mode' },
  { id: 'tool-reference', label: 'Tool reference' },
];

const serverStartCode = `npx @sajalmishra/markpin-mcp server`;

const mcpConfigCode = `{
  "mcpServers": {
    "markpin": {
      "command": "npx",
      "args": ["@sajalmishra/markpin-mcp", "server"]
    }
  }
}`;

const claudeMdCode = `## Pinpoint feedback

When the user says "watch mode", call pinpoint_watch_annotations in a loop.
For each annotation: acknowledge it, find the source file from metadata.sourceFile,
fix the issue, then resolve it.`;

const watchModeTriggerCode = `Tell your agent: "watch mode"`;

const watchModeClaudeMdCode = `When the user says "watch mode", enter a loop:
1. Call pinpoint_watch_annotations
2. For each annotation, call pinpoint_acknowledge
3. Open metadata.sourceFile, fix the issue in the comment
4. Call pinpoint_resolve with a summary of what changed
5. Repeat`;

const listSessionsExampleCode = `// Call: pinpoint_list_sessions
// No parameters

// Example response:
[
  {
    "id": "sess_abc123",
    "url": "http://localhost:5173",
    "status": "active",
    "annotationCount": 3,
    "pendingCount": 2,
    "createdAt": "2025-06-17T14:00:00Z"
  }
]`;

const getSessionExampleCode = `// Call: pinpoint_get_session
// Parameters: { sessionId: "sess_abc123" }

// Returns the full session object with all annotations.`;

const getPendingExampleCode = `// Call: pinpoint_get_pending
// Parameters: { sessionId: "sess_abc123" }

// Example response:
{
  "count": 2,
  "byKind": {
    "feedback": 1,
    "placement": 0,
    "rearrange": 1
  },
  "annotations": [ /* annotation objects */ ]
}`;

const getAllPendingExampleCode = `// Call: pinpoint_get_all_pending
// No parameters

// Returns all unresolved annotations across all sessions, grouped by session.`;

const watchAnnotationsExampleCode = `// Call: pinpoint_watch_annotations
// No parameters

// Blocks until one or more annotations arrive.
// Times out after 5 minutes of inactivity.

// Example response:
[
  { "id": "ann_xyz", "intent": "bug", "severity": "high", ... }
]`;

const acknowledgeExampleCode = `// Call: pinpoint_acknowledge
// Parameters: { annotationId: "ann_xyz" }

// Moves annotation to in_progress.
// The marker pin turns yellow in the browser.`;

const resolveExampleCode = `// Call: pinpoint_resolve
// Parameters: {
//   annotationId: "ann_xyz",
//   resolution: "Added :focus-visible rule in Button.tsx line 34"
// }

// Moves annotation to resolved.
// The marker pin flashes green then disappears.`;

const dismissExampleCode = `// Call: pinpoint_dismiss
// Parameters: {
//   annotationId: "ann_xyz",
//   reason: "This is intentional per design spec."
// }

// Moves annotation to dismissed.`;

const replyExampleCode = `// Call: pinpoint_reply
// Parameters: {
//   annotationId: "ann_xyz",
//   message: "Should the focus ring match the brand color (#6366f1) or use the browser default?"
// }

// Posts a message to the annotation thread.`;

export default function Mcp() {
  return (
    <Layout toc={toc}>
      <p className="page-eyebrow">Reference</p>
      <h1>MCP Server</h1>
      <p className="page-description">
        The Pinpoint MCP server exposes 9 tools your AI agent can call to read,
        acknowledge, fix, and resolve annotations.
      </p>

      {/* Overview */}
      <section id="overview">
        <h2>Overview</h2>
        <p>
          The Pinpoint MCP server runs at <code>http://localhost:4747</code>. It
          stores annotations in memory for the current dev session. Your AI agent
          connects to it via the MCP protocol and can call 9 tools to interact with
          annotations.
        </p>
        <p>
          The server also serves a REST API and an SSE stream — see the{' '}
          <a href="/api">REST API</a> page for details.
        </p>
      </section>

      {/* Setup */}
      <section id="setup">
        <h2>Setup</h2>

        <h3>Start the server</h3>
        <CodeBlock language="bash" code={serverStartCode} />

        <h3>Connect Claude Code</h3>
        <p>
          Add to <code>.claude/settings.json</code>:
        </p>
        <CodeBlock language="json" code={mcpConfigCode} />

        <h3>Add to CLAUDE.md</h3>
        <p>
          You can add the MCP tool descriptions to your <code>CLAUDE.md</code> to
          tell the agent when and how to use them. This primes the agent with the
          right behavior without needing to explain it each session:
        </p>
        <CodeBlock language="markdown" code={claudeMdCode} />
      </section>

      {/* Tools */}
      <section id="tools">
        <h2>The 9 MCP tools</h2>
        <table>
          <thead>
            <tr>
              <th>Tool</th>
              <th>When to use</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>pinpoint_list_sessions</code></td>
              <td>Discover which pages have feedback waiting</td>
            </tr>
            <tr>
              <td><code>pinpoint_get_session</code></td>
              <td>Read all annotations for a specific page</td>
            </tr>
            <tr>
              <td><code>pinpoint_get_pending</code></td>
              <td>Get unresolved annotations for one session</td>
            </tr>
            <tr>
              <td><code>pinpoint_get_all_pending</code></td>
              <td>Get all unresolved annotations across all pages</td>
            </tr>
            <tr>
              <td><code>pinpoint_watch_annotations</code></td>
              <td>Block until new annotations arrive (hands-free loop)</td>
            </tr>
            <tr>
              <td><code>pinpoint_acknowledge</code></td>
              <td>Mark an annotation <code>in_progress</code> — user sees you noticed</td>
            </tr>
            <tr>
              <td><code>pinpoint_resolve</code></td>
              <td>Mark an annotation resolved after the fix is committed</td>
            </tr>
            <tr>
              <td><code>pinpoint_dismiss</code></td>
              <td>Mark an annotation you will not address, with a reason</td>
            </tr>
            <tr>
              <td><code>pinpoint_reply</code></td>
              <td>Post a message to the annotation thread</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Hands-free */}
      <section id="hands-free">
        <h2>Hands-free mode</h2>
        <p>
          In hands-free mode, the agent enters a watch loop and processes each
          annotation as it arrives:
        </p>
        <ol>
          <li>
            Calls <code>pinpoint_watch_annotations</code> — blocks until annotations
            arrive
          </li>
          <li>
            Acknowledges each annotation — user sees yellow pin in the browser
          </li>
          <li>
            Reads <code>metadata.sourceFile</code> to open the exact file
          </li>
          <li>Makes the fix described in the annotation comment</li>
          <li>
            Calls <code>pinpoint_resolve</code> with a summary of what changed
          </li>
          <li>Goes back to step 1</li>
        </ol>

        <CodeBlock code={watchModeTriggerCode} />

        <p>Or add to your CLAUDE.md for persistent behavior:</p>
        <CodeBlock language="markdown" code={watchModeClaudeMdCode} />
      </section>

      {/* Tool reference */}
      <section id="tool-reference">
        <h2>Tool reference</h2>

        <h3>pinpoint_list_sessions</h3>
        <p>
          Discover which pages have feedback waiting. Returns an array of session
          summaries including <code>id</code>, <code>url</code>, <code>status</code>,{' '}
          <code>annotationCount</code>, <code>pendingCount</code>, and{' '}
          <code>createdAt</code>. No parameters required.
        </p>
        <CodeBlock code={listSessionsExampleCode} />

        <h3>pinpoint_get_session</h3>
        <p>
          Read all annotations for a specific page. Returns the full session object
          including every annotation regardless of status.
        </p>
        <p>
          <strong>Parameters:</strong> <code>sessionId: string</code>
        </p>
        <CodeBlock code={getSessionExampleCode} />

        <h3>pinpoint_get_pending</h3>
        <p>
          Get unresolved annotations for one session. Returns a count, a breakdown
          by kind (<code>feedback</code>, <code>placement</code>,{' '}
          <code>rearrange</code>), and the annotation array. Each annotation includes
          a <code>layoutContext</code> field for placement and rearrange kinds.
        </p>
        <p>
          <strong>Parameters:</strong> <code>sessionId: string</code>
        </p>
        <CodeBlock code={getPendingExampleCode} />

        <h3>pinpoint_get_all_pending</h3>
        <p>
          Get all unresolved annotations across all sessions, grouped by session.
          Useful for a broad sweep before starting a fix session. No parameters
          required.
        </p>
        <CodeBlock code={getAllPendingExampleCode} />

        <h3>pinpoint_watch_annotations</h3>
        <p>
          Subscribe to new annotations via SSE. Blocks until one or more new
          annotations are created, then returns them as an array. Times out after
          5 minutes of inactivity. No parameters required.
        </p>
        <CodeBlock code={watchAnnotationsExampleCode} />

        <h3>pinpoint_acknowledge</h3>
        <p>
          Move an annotation to <code>in_progress</code>. The marker pin turns
          yellow in the browser so the user can see the agent noticed their
          feedback.
        </p>
        <p>
          <strong>Parameters:</strong> <code>annotationId: string</code>
        </p>
        <CodeBlock code={acknowledgeExampleCode} />

        <h3>pinpoint_resolve</h3>
        <p>
          Mark an annotation resolved after committing the fix. The marker pin
          flashes green then disappears. Always call this after making a change —
          never leave annotations in <code>in_progress</code>.
        </p>
        <p>
          <strong>Parameters:</strong> <code>annotationId: string</code>,{' '}
          <code>resolution: string</code> (description of what was changed)
        </p>
        <CodeBlock code={resolveExampleCode} />

        <h3>pinpoint_dismiss</h3>
        <p>
          Mark an annotation you will not address. Use when the issue is
          intentional, out of scope, or already handled elsewhere.
        </p>
        <p>
          <strong>Parameters:</strong> <code>annotationId: string</code>,{' '}
          <code>reason: string</code>
        </p>
        <CodeBlock code={dismissExampleCode} />

        <h3>pinpoint_reply</h3>
        <p>
          Post a message to the annotation thread. Use this to ask clarifying
          questions instead of guessing — especially for <code>question</code>{' '}
          intent annotations or design decisions.
        </p>
        <p>
          <strong>Parameters:</strong> <code>annotationId: string</code>,{' '}
          <code>message: string</code>
        </p>
        <CodeBlock code={replyExampleCode} />

        <Callout type="info">
          Always acknowledge before fixing and resolve after fixing. Never leave
          an annotation in <code>in_progress</code> without following up.
        </Callout>
      </section>
    </Layout>
  );
}
