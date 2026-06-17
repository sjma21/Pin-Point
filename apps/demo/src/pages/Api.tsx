import Layout from '../components/Layout';
import Callout from '../components/Callout';
import CodeBlock from '../components/CodeBlock';

const toc = [
  { id: 'overview', label: 'Overview' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'annotations', label: 'Annotations' },
  { id: 'sse', label: 'SSE events' },
  { id: 'errors', label: 'Error responses' },
];

const listSessionsResponseCode = `[
  {
    "id": "sess_abc123",
    "url": "http://localhost:5173",
    "status": "active",
    "annotationCount": 3,
    "pendingCount": 2,
    "createdAt": "2025-06-17T14:00:00Z"
  }
]`;

const createSessionCode = `POST /sessions

{
  "url": "http://localhost:5173",
  "title": "Homepage review"
}

// Response:
{ "id": "sess_abc123", "createdAt": "2025-06-17T14:00:00Z" }`;

const createAnnotationCode = `POST /sessions/:sessionId/annotations

{
  "id": "ann_critique_001",
  "kind": "element",
  "intent": "bug",
  "severity": "high",
  "status": "open",
  "comment": "Button has no visible focus ring (WCAG 2.4.7 failure).",
  "target": {
    "selector": "button.btn-primary",
    "url": "http://localhost:5173/",
    "textContent": "Get Started",
    "boundingBox": { "x": 200, "y": 400, "width": 120, "height": 40 },
    "viewport": { "width": 1470, "height": 798 }
  },
  "metadata": {
    "sourceFile": "/app/src/components/Button.tsx:34",
    "reactComponents": "App > Hero > Button"
  }
}`;

const updateAnnotationCode = `PATCH /sessions/:sessionId/annotations/:annotationId

{ "status": "resolved", "resolution": "Added :focus-visible rule in Button.tsx:34" }`;

const replyCode = `POST /sessions/:sessionId/annotations/:annotationId/reply

{ "role": "agent", "content": "I'll fix the focus ring in Button.tsx" }`;

const sseCode = `const es = new EventSource(
  'http://localhost:4747/sessions/sess_abc123/events'
);
es.onmessage = (e) => {
  const event = JSON.parse(e.data);
  console.log(event.type, event.payload);
};`;

const errorResponseCode = `{ "error": "Session not found", "code": "SESSION_NOT_FOUND" }`;

export default function Api() {
  return (
    <Layout toc={toc}>
      <p className="page-eyebrow">Reference</p>
      <h1>REST API</h1>
      <p className="page-description">
        The Pinpoint MCP server exposes a REST API at{' '}
        <code>http://localhost:4747</code>. Use it when MCP tools aren't available
        or for direct programmatic access.
      </p>

      {/* Overview */}
      <section id="overview">
        <h2>Overview</h2>
        <p>
          Base URL: <code>http://localhost:4747</code>
        </p>
        <p>
          All responses are JSON. All request bodies are JSON with{' '}
          <code>Content-Type: application/json</code>.
        </p>
        <Callout type="info">
          The REST API is useful when you're writing scripts, testing from the
          command line, or when your AI agent doesn't have MCP access. The MCP
          tools are usually more convenient for AI agents.
        </Callout>
      </section>

      {/* Sessions */}
      <section id="sessions">
        <h2>Sessions</h2>

        <h3>List sessions</h3>
        <CodeBlock language="bash" code="GET /sessions" />
        <p>Returns an array of session summaries.</p>
        <CodeBlock language="json" code={listSessionsResponseCode} />

        <h3>Get session</h3>
        <CodeBlock language="bash" code="GET /sessions/:sessionId" />
        <p>Returns the full session object with an annotations array.</p>

        <h3>Create session</h3>
        <CodeBlock language="bash" code={createSessionCode} />

        <h3>Delete session</h3>
        <CodeBlock language="bash" code="DELETE /sessions/:sessionId" />
        <p>Deletes the session and all its annotations.</p>
      </section>

      {/* Annotations */}
      <section id="annotations">
        <h2>Annotations</h2>

        <h3>List annotations</h3>
        <CodeBlock language="bash" code="GET /sessions/:sessionId/annotations" />
        <p>Returns an array of all annotations for the session.</p>

        <h3>Create annotation</h3>
        <CodeBlock language="json" code={createAnnotationCode} />
        <p>
          <strong>Notes:</strong> <code>id</code> is optional — auto-generated if
          omitted. <code>sessionId</code> is ignored in the body (taken from the
          URL). <code>createdAt</code> is set by the server.
        </p>

        <h3>Update annotation status</h3>
        <CodeBlock language="json" code={updateAnnotationCode} />

        <h3>Delete annotation</h3>
        <CodeBlock
          language="bash"
          code="DELETE /sessions/:sessionId/annotations/:annotationId"
        />

        <h3>Reply to annotation</h3>
        <CodeBlock language="json" code={replyCode} />
      </section>

      {/* SSE events */}
      <section id="sse">
        <h2>SSE events</h2>
        <CodeBlock
          language="bash"
          code="GET /sessions/:sessionId/events"
        />
        <p>Subscribe to real-time events for a session.</p>
        <CodeBlock language="javascript" code={sseCode} />

        <p>Event types:</p>
        <table>
          <thead>
            <tr>
              <th>Event type</th>
              <th>When it fires</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>annotation.created</code></td>
              <td>A new annotation was added</td>
            </tr>
            <tr>
              <td><code>annotation.updated</code></td>
              <td>An annotation's status or fields changed</td>
            </tr>
            <tr>
              <td><code>annotation.deleted</code></td>
              <td>An annotation was deleted</td>
            </tr>
            <tr>
              <td><code>annotation.resolved</code></td>
              <td>An annotation was marked resolved</td>
            </tr>
            <tr>
              <td><code>session.started</code></td>
              <td>A browser tab connected to the session</td>
            </tr>
            <tr>
              <td><code>session.ended</code></td>
              <td>The browser tab disconnected</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Error responses */}
      <section id="errors">
        <h2>Error responses</h2>
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>200</td>
              <td>Success</td>
            </tr>
            <tr>
              <td>201</td>
              <td>Created</td>
            </tr>
            <tr>
              <td>400</td>
              <td>Bad request — check request body</td>
            </tr>
            <tr>
              <td>404</td>
              <td>Session or annotation not found</td>
            </tr>
            <tr>
              <td>500</td>
              <td>Server error</td>
            </tr>
          </tbody>
        </table>

        <p>All errors return a consistent JSON shape:</p>
        <CodeBlock language="json" code={errorResponseCode} />
      </section>
    </Layout>
  );
}
