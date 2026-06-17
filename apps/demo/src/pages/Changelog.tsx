import Layout from '../components/Layout';

const toc = [
  { id: 'v0-5-0', label: 'v0.5.0' },
  { id: 'v0-4-0', label: 'v0.4.0' },
  { id: 'v0-3-0', label: 'v0.3.0' },
  { id: 'v0-2-0', label: 'v0.2.0' },
  { id: 'v0-1-0', label: 'v0.1.0' },
];

export default function Changelog() {
  return (
    <Layout toc={toc}>
      <p className="page-eyebrow">More</p>
      <h1>Changelog</h1>
      <p className="page-description">What's new in each version of Pinpoint.</p>

      {/* v0.5.0 */}
      <section id="v0-5-0">
        <h2>
          v0.5.0{' '}
          <span className="badge-success" style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}>
            Current
          </span>
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
          2025-06-17
        </p>
        <ul>
          <li>Phase 7: Complete documentation site built with React Router</li>
          <li>
            Docs site has Pinpoint toolbar embedded — annotate the docs directly
          </li>
          <li>
            Dark-themed docs with persistent sidebar, table of contents, and mobile
            hamburger
          </li>
          <li>
            Improved toolbar: cleaner shadows, consistent spacing, better transitions
          </li>
          <li>
            Packages ready for npm publish: toolbar and mcp-server with README files
          </li>
        </ul>
      </section>

      {/* v0.4.0 */}
      <section id="v0-4-0">
        <h2>v0.4.0</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
          2025-06-10
        </p>
        <ul>
          <li>
            Phase 5 &amp; 6: Layout mode — drag-and-drop component palette, rearrange
            sections, wireframe opacity
          </li>
          <li>
            MCP tools extended with <code>layoutContext</code> for placement and
            rearrange annotations
          </li>
          <li>
            New <code>pinpoint_get_pending</code> returns <code>byKind</code> counts
            for feedback/placement/rearrange
          </li>
          <li>
            <code>wireframePurpose</code> field in placement annotations for semantic
            intent
          </li>
          <li>Area selection mode</li>
        </ul>
      </section>

      {/* v0.3.0 */}
      <section id="v0-3-0">
        <h2>v0.3.0</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
          2025-06-03
        </p>
        <ul>
          <li>Phase 4: MCP server with real-time SSE sync</li>
          <li>
            9 MCP tools: list_sessions, get_session, get_pending, get_all_pending,
            watch_annotations, acknowledge, resolve, dismiss, reply
          </li>
          <li>
            Toolbar shows agent mode status: Watching, Critique, Self-driving
          </li>
          <li>
            Marker pins change color on acknowledge (yellow) and resolve (green flash)
          </li>
          <li>Self-driving and critique modes documented in CLAUDE.md</li>
        </ul>
      </section>

      {/* v0.2.0 */}
      <section id="v0-2-0">
        <h2>v0.2.0</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
          2025-05-27
        </p>
        <ul>
          <li>Phase 2 &amp; 3: Core annotation engine</li>
          <li>Element picker with CSS selector generation</li>
          <li>React fiber traversal for component hierarchy detection</li>
          <li>
            Source file detection from <code>_debugSource</code>
          </li>
          <li>Computed styles capture</li>
          <li>
            Toolbar with drag handle, capture mode, marker pins, and settings panel
          </li>
          <li>Annotation popup with intent/severity chips and textarea</li>
          <li>Thread viewer for agent replies</li>
          <li>
            Four output formats: compact, standard, detailed, forensic
          </li>
          <li>
            Keyboard shortcuts: Cmd+Shift+F, Esc, P, H, C, X, L
          </li>
        </ul>
      </section>

      {/* v0.1.0 */}
      <section id="v0-1-0">
        <h2>v0.1.0</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
          2025-05-20
        </p>
        <ul>
          <li>Initial proof of concept</li>
          <li>Basic toolbar injection via React portal</li>
          <li>Click-to-annotate with comment textarea</li>
          <li>In-memory annotation store</li>
          <li>Export as markdown</li>
        </ul>
      </section>
    </Layout>
  );
}
