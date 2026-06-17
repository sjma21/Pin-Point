import Layout from '../components/Layout';
import Callout from '../components/Callout';
import CodeBlock from '../components/CodeBlock';

const toc = [
  { id: 'formats', label: 'Output formats' },
  { id: 'compact', label: 'Compact' },
  { id: 'standard', label: 'Standard' },
  { id: 'detailed', label: 'Detailed' },
  { id: 'forensic', label: 'Forensic' },
  { id: 'source-detection', label: 'Source detection' },
  { id: 'copying', label: 'Copying annotations' },
];

const compactCode = `## Annotation #1 — Bug (High)

**Element:** button.btn-primary
**Comment:** Button has no focus ring — keyboard users can't tell where focus is.
**File:** src/components/Button.tsx:34`;

const standardCode = `## Annotation #1 — Bug (High)

**Element:** button.btn-primary
**Text content:** "Save Changes"
**URL:** http://localhost:5173/settings
**Comment:** Button has no focus ring — keyboard users can't tell where focus is.
**Source file:** src/components/Button.tsx:34
**React components:** App > SettingsPage > SettingsForm > Button`;

const detailedCode = `## Annotation #1 — Bug (High)
**ID:** ann_abc123
**Intent:** bug | **Severity:** high | **Status:** open

**Target:**
- Selector: button.btn-primary
- Text: "Save Changes"
- Bounding box: { x: 200, y: 480, width: 120, height: 40 }
- URL: http://localhost:5173/settings
- Viewport: 1470 × 798

**Comment:**
Button has no focus ring — keyboard users can't tell where focus is.
Add \`outline: 2px solid currentColor; outline-offset: 2px\` to \`:focus-visible\`.

**Source file:** src/components/Button.tsx:34
**React components:** App > SettingsPage > SettingsForm > Button

**Created:** 2025-06-17T14:32:00Z`;

const forensicCode = `## Annotation #1 — Bug (High)
**ID:** ann_abc123
**Intent:** bug | **Severity:** high | **Status:** open

**Target:**
- Selector: button.btn-primary
- Text: "Save Changes"
- Bounding box: { x: 200, y: 480, width: 120, height: 40 }
- XPath: /html/body/div[1]/main/form/button
- URL: http://localhost:5173/settings
- Viewport: 1470 × 798
- Device pixel ratio: 2

**Comment:**
Button has no focus ring — keyboard users can't tell where focus is.
Add \`outline: 2px solid currentColor; outline-offset: 2px\` to \`:focus-visible\`.

**Source file:** src/components/Button.tsx:34
**React components:** App > SettingsPage > SettingsForm > Button

**Computed styles:**
- font-size: 14px
- color: #ffffff
- background-color: #6366f1
- padding: 8px 16px
- border: none
- outline: none   ← the bug

**Thread:**
[Agent] Acknowledged — looking at Button.tsx:34
[Agent] Fixed: added :focus-visible rule in Button.tsx

**Created:** 2025-06-17T14:32:00Z
**Updated:** 2025-06-17T14:33:15Z`;

export default function Output() {
  return (
    <Layout toc={toc}>
      <p className="page-eyebrow">Reference</p>
      <h1>Output Formats</h1>
      <p className="page-description">
        Pinpoint can serialize annotations into four levels of detail. Choose the
        format that gives your agent enough context without overwhelming it.
      </p>

      {/* formats */}
      <section id="formats">
        <h2>Four formats</h2>
        <p>
          Choose the format in Settings → Detail Level. The format affects what
          you get when you press <kbd>C</kbd> to copy annotations as markdown or
          call the REST API.
        </p>
        <table>
          <thead>
            <tr>
              <th>Format</th>
              <th>Best for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="badge-muted">Compact</span></td>
              <td>Quick tasks, simple layout fixes, one-liner feedback</td>
            </tr>
            <tr>
              <td><span className="badge-primary">Standard</span></td>
              <td>Most bugs and improvements — the default</td>
            </tr>
            <tr>
              <td><span className="badge-info">Detailed</span></td>
              <td>Complex bugs that need full context</td>
            </tr>
            <tr>
              <td><span className="badge-warning">Forensic</span></td>
              <td>
                Deep investigations — includes computed styles, React fiber,
                full thread
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Compact */}
      <section id="compact">
        <h2>Compact</h2>
        <p>
          The minimal representation. Includes only the element selector, the
          comment, and the source file. Best for quick fixes where the agent
          doesn't need layout or style context.
        </p>
        <CodeBlock language="markdown" code={compactCode} />
      </section>

      {/* Standard */}
      <section id="standard">
        <h2>Standard</h2>
        <p>
          The default format. Adds visible text content, the page URL, and the
          React component hierarchy. Covers the vast majority of bugs and
          improvement requests.
        </p>
        <CodeBlock language="markdown" code={standardCode} />
      </section>

      {/* Detailed */}
      <section id="detailed">
        <h2>Detailed</h2>
        <p>
          Includes the annotation ID, status, bounding box, and viewport
          dimensions in addition to everything in Standard. Use this when the
          agent needs positional context or when coordinating multiple
          annotations.
        </p>
        <CodeBlock language="markdown" code={detailedCode} />
      </section>

      {/* Forensic */}
      <section id="forensic">
        <h2>Forensic</h2>
        <p>
          Everything Pinpoint knows about the annotation. Adds XPath, device
          pixel ratio, computed CSS styles at annotation time, and the full
          conversation thread. Use this for hard-to-reproduce visual bugs or
          when the agent needs to verify a fix visually.
        </p>
        <CodeBlock language="markdown" code={forensicCode} />
      </section>

      {/* Source detection */}
      <section id="source-detection">
        <h2>Source detection</h2>
        <p>
          <code>metadata.sourceFile</code> is populated from React's internal
          fiber <code>_debugSource</code> property, which is only available when
          source maps are enabled. This is why Pinpoint is dev-only and requires
          development builds — production bundles strip source map data and
          minify component names.
        </p>
        <p>
          When the agent reads{' '}
          <code>metadata.sourceFile = "src/components/Button.tsx:34"</code> it
          can jump directly to that file and line without any grepping or
          searching. This is the primary way Pinpoint accelerates agentic
          workflows.
        </p>

        <Callout type="warning">
          Source file detection requires React development mode with source maps.
          It will not work in production builds or minified code.
        </Callout>
      </section>

      {/* Copying */}
      <section id="copying">
        <h2>Copying annotations</h2>
        <p>There are three ways to get annotation data out of Pinpoint:</p>
        <ol>
          <li>
            <strong>Keyboard shortcut</strong> — press <kbd>C</kbd> to copy all
            pending annotations to the clipboard as markdown in the currently
            selected detail level.
          </li>
          <li>
            <strong>REST API</strong> —{' '}
            <code>GET http://localhost:4747/sessions/{'{id}'}</code> returns the
            full session JSON including every annotation in AFS format.
          </li>
          <li>
            <strong>MCP tools</strong> — <code>pinpoint_get_pending</code>{' '}
            returns a structured object your agent can use directly, without any
            markdown parsing.
          </li>
        </ol>
      </section>
    </Layout>
  );
}
