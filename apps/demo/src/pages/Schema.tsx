import Layout from '../components/Layout';
import CodeBlock from '../components/CodeBlock';

const toc = [
  { id: 'overview', label: 'Overview' },
  { id: 'annotation-type', label: 'Annotation type' },
  { id: 'required-fields', label: 'Required fields' },
  { id: 'recommended-fields', label: 'Recommended fields' },
  { id: 'optional-fields', label: 'Optional fields' },
  { id: 'enums', label: 'Enums' },
  { id: 'session', label: 'Session type' },
  { id: 'lifecycle', label: 'Lifecycle states' },
  { id: 'events', label: 'AFS Events' },
];

const annotationTypeCode = `type Annotation = AnnotationRequired & AnnotationRecommended & AnnotationOptional;`;

const requiredFieldsCode = `interface AnnotationRequired {
  id: string;           // unique identifier, e.g. "ann_abc123"
  sessionId: string;    // which browser session it belongs to
  createdAt: string;    // ISO-8601 timestamp
  kind: AnnotationKind; // "element" | "region" | "page" | ...
  intent: AnnotationIntent; // "bug" | "improvement" | "question" | ...
  target: AnnotationTarget;
  comment: string;      // human-written description
}

interface AnnotationTarget {
  url: string;                           // page URL
  viewport: { width: number; height: number };
  selector?: string;                     // CSS selector
  xpath?: string;                        // XPath fallback
  boundingBox?: BoundingBox;             // { x, y, width, height }
  textContent?: string;                  // visible text
  ariaLabel?: string;                    // aria-label if present
  devicePixelRatio?: number;
}`;

const recommendedFieldsCode = `interface AnnotationRecommended {
  severity: AnnotationSeverity; // "critical" | "high" | "medium" | "low" | "info"
  status: AnnotationStatus;     // "open" | "in_progress" | "resolved" | "dismissed"
  screenshotUrl?: string;
  screenshotDataUrl?: string;
  index?: number; // 1-based position within the session
}`;

const optionalFieldsCode = `interface AnnotationOptional {
  updatedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  tags?: string[];
  assignee?: string;
  linkedAnnotationIds?: string[];
  metadata?: AnnotationMetadata;
}

interface AnnotationMetadata {
  userAgent?: string;
  sourceFile?: string;          // "src/components/Button.tsx:34"
  reactComponents?: string;     // "App > Layout > Button"
  computedStyles?: Record<string, string>;
  thread?: ThreadMessage[];
  [key: string]: unknown;       // arbitrary agent-specific data
}

interface ThreadMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  createdAt: string;
}`;

const intentEnumCode = `enum AnnotationIntent {
  Bug         = 'bug',
  Improvement = 'improvement',
  Question    = 'question',
  Praise      = 'praise',
  Task        = 'task',
  Note        = 'note',
}`;

const severityEnumCode = `enum AnnotationSeverity {
  Critical = 'critical',
  High     = 'high',
  Medium   = 'medium',
  Low      = 'low',
  Info     = 'info',
}`;

const statusEnumCode = `enum AnnotationStatus {
  Open       = 'open',
  InProgress = 'in_progress',
  Resolved   = 'resolved',
  Dismissed  = 'dismissed',
}`;

const kindEnumCode = `enum AnnotationKind {
  Element   = 'element',
  Region    = 'region',
  Page      = 'page',
  Freeform  = 'freeform',
  Placement = 'placement', // layout mode: new component
  Rearrange = 'rearrange', // layout mode: section reorder
}`;

const sessionTypeCode = `interface Session {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'paused' | 'ended';
  url: string;                    // page URL where toolbar was initialized
  title?: string;
  annotations: Annotation[];
  owner?: string;
  outputFormat?: 'json' | 'markdown' | 'xml';
  metadata?: Record<string, unknown>;
}`;

const lifecycleDiagramCode = `open
  └─ pinpoint_acknowledge ──► in_progress
                                  ├─ pinpoint_resolve  ──► resolved
                                  └─ pinpoint_dismiss  ──► dismissed
open
  └─ pinpoint_dismiss ──► dismissed`;

const eventEnvelopeCode = `interface AFSEventBase {
  id: string;
  type: AFSEventType;
  sessionId: string;
  timestamp: string; // ISO-8601
}
// payload varies by type, e.g.:
interface AnnotationCreatedEvent extends AFSEventBase {
  type: 'annotation.created';
  payload: { annotation: Annotation };
}`;

export default function Schema() {
  return (
    <Layout toc={toc}>
      <p className="page-eyebrow">Reference</p>
      <h1>Schema</h1>
      <p className="page-description">
        The Annotation Format Schema (AFS) — the TypeScript types that define
        how annotations are structured.
      </p>

      {/* Overview */}
      <section id="overview">
        <h2>Overview</h2>
        <p>
          AFS is the data format Pinpoint uses internally and exposes via MCP
          and REST. It is fully typed in TypeScript and exported from{' '}
          <code>@pinpoint/shared</code>. All MCP tools return annotations in AFS
          format, so your agent always works with the same consistent structure
          regardless of whether it calls a tool or hits the REST API directly.
        </p>
      </section>

      {/* Annotation type */}
      <section id="annotation-type">
        <h2>Annotation type</h2>
        <p>
          The top-level <code>Annotation</code> type is an intersection of three
          interfaces, grouped by whether their fields are required, recommended,
          or optional.
        </p>
        <CodeBlock language="typescript" code={annotationTypeCode} />
      </section>

      {/* Required fields */}
      <section id="required-fields">
        <h2>Required fields</h2>
        <p>
          These fields must be present on every annotation. The MCP server
          rejects POSTs that omit any of them.
        </p>
        <CodeBlock language="typescript" code={requiredFieldsCode} />
      </section>

      {/* Recommended fields */}
      <section id="recommended-fields">
        <h2>Recommended fields</h2>
        <p>
          Technically optional, but strongly recommended. Agents should always
          emit <code>severity</code> and <code>status</code> so the toolbar can
          display and sort annotations correctly.
        </p>
        <CodeBlock language="typescript" code={recommendedFieldsCode} />
      </section>

      {/* Optional fields */}
      <section id="optional-fields">
        <h2>Optional fields</h2>
        <p>
          Additional fields for tracking, threading, and agent-specific data.
          The <code>metadata</code> object accepts arbitrary keys, so agents can
          attach any extra context they need.
        </p>
        <CodeBlock language="typescript" code={optionalFieldsCode} />
      </section>

      {/* Enums */}
      <section id="enums">
        <h2>Enums</h2>

        <h3>Intent</h3>
        <CodeBlock language="typescript" code={intentEnumCode} />

        <h3>Severity</h3>
        <CodeBlock language="typescript" code={severityEnumCode} />

        <h3>Status</h3>
        <CodeBlock language="typescript" code={statusEnumCode} />

        <h3>Kind</h3>
        <CodeBlock language="typescript" code={kindEnumCode} />
      </section>

      {/* Session type */}
      <section id="session">
        <h2>Session type</h2>
        <p>
          A session groups all annotations captured from a single browser tab.
          The toolbar creates a session automatically when it mounts and reports
          its <code>sessionId</code> via the <code>onSessionCreated</code> prop.
        </p>
        <CodeBlock language="typescript" code={sessionTypeCode} />
      </section>

      {/* Lifecycle states */}
      <section id="lifecycle">
        <h2>Lifecycle states</h2>
        <p>
          Annotations move through a defined set of states as the agent works.
          The toolbar reflects each transition in real time via SSE.
        </p>
        <CodeBlock code={lifecycleDiagramCode} />
        <table>
          <thead>
            <tr>
              <th>State</th>
              <th>Meaning</th>
              <th>Toolbar display</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>open</code></td>
              <td>Newly created, agent hasn't seen it yet</td>
              <td>Blue marker pin</td>
            </tr>
            <tr>
              <td><code>in_progress</code></td>
              <td>Agent has acknowledged — fix is in progress</td>
              <td>Yellow marker pin (eye icon)</td>
            </tr>
            <tr>
              <td><code>resolved</code></td>
              <td>Fix committed</td>
              <td>Green flash → disappears</td>
            </tr>
            <tr>
              <td><code>dismissed</code></td>
              <td>Will not fix</td>
              <td>Gray marker pin</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* AFS Events */}
      <section id="events">
        <h2>AFS Events</h2>
        <p>
          The SSE stream at{' '}
          <code>GET /sessions/{'{id}'}/events</code> emits AFS events whenever
          the session state changes. The toolbar subscribes to this stream on
          mount and applies updates optimistically — no polling required.
        </p>
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Trigger</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>session.started</code></td>
              <td>Session created</td>
            </tr>
            <tr>
              <td><code>session.ended</code></td>
              <td>Session closed</td>
            </tr>
            <tr>
              <td><code>annotation.created</code></td>
              <td>New annotation POSTed</td>
            </tr>
            <tr>
              <td><code>annotation.updated</code></td>
              <td>Annotation status changed (acknowledge, resolve, etc.)</td>
            </tr>
            <tr>
              <td><code>annotation.deleted</code></td>
              <td>Annotation deleted</td>
            </tr>
            <tr>
              <td><code>annotation.resolved</code></td>
              <td>Annotation moved to resolved state</td>
            </tr>
            <tr>
              <td><code>screenshot.captured</code></td>
              <td>Screenshot attached to annotation</td>
            </tr>
            <tr>
              <td><code>action.requested</code></td>
              <td>Agent requested a browser action</td>
            </tr>
            <tr>
              <td><code>action.completed</code></td>
              <td>Browser action completed</td>
            </tr>
          </tbody>
        </table>
        <CodeBlock language="typescript" code={eventEnvelopeCode} />
      </section>
    </Layout>
  );
}
