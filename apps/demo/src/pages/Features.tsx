import Layout from '../components/Layout';
import Callout from '../components/Callout';

const toc = [
  { id: 'annotation-modes', label: 'Annotation modes' },
  { id: 'toolbar-controls', label: 'Toolbar controls' },
  { id: 'smart-targeting', label: 'Smart targeting' },
  { id: 'react-detection', label: 'React detection' },
  { id: 'layout-mode', label: 'Layout mode' },
  { id: 'keyboard-shortcuts', label: 'Keyboard shortcuts' },
  { id: 'agent-sync', label: 'Agent sync' },
  { id: 'settings', label: 'Settings' },
];

export default function Features() {
  return (
    <Layout toc={toc}>
      <p className="page-eyebrow">Reference</p>
      <h1>Features</h1>
      <p className="page-description">
        Everything Pinpoint can do — annotation modes, toolbar controls, smart
        targeting, agent sync, and more.
      </p>

      {/* Annotation modes */}
      <section id="annotation-modes">
        <h2>Annotation modes</h2>
        <p>
          Pinpoint supports four ways to capture feedback, each suited to a
          different kind of issue.
        </p>
        <div className="card-grid">
          <div className="card">
            <h3>Element annotation</h3>
            <p>
              Click any DOM element. Pinpoint captures the CSS selector, bounding
              box, React component tree, source file, computed styles, and visible
              text.
            </p>
          </div>
          <div className="card">
            <h3>Text selection</h3>
            <p>
              Select any text on the page. The annotation attaches to the text
              range and records the selected text and its parent element.
            </p>
          </div>
          <div className="card">
            <h3>Area selection</h3>
            <p>
              Drag to draw a rectangle. Captures everything within the selected
              region.
            </p>
          </div>
          <div className="card">
            <h3>Page annotation</h3>
            <p>
              Annotate the whole page without targeting a specific element. Useful
              for general feedback.
            </p>
          </div>
        </div>
      </section>

      {/* Toolbar controls */}
      <section id="toolbar-controls">
        <h2>Toolbar controls</h2>
        <table>
          <thead>
            <tr>
              <th>Control</th>
              <th>Action</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Capture button</td>
              <td>Toggle capture mode</td>
              <td>Green when active; cursor turns crosshair</td>
            </tr>
            <tr>
              <td>⏸ Pause</td>
              <td>Pause/resume CSS animations</td>
              <td>Helpful for capturing hover states</td>
            </tr>
            <tr>
              <td>👁 Toggle</td>
              <td>Show/hide marker pins</td>
              <td>Markers persist in the toolbar even when hidden</td>
            </tr>
            <tr>
              <td>⧉ Copy</td>
              <td>Copy annotations as markdown</td>
              <td>Copies all pending annotations; clears if "Clear on copy" is enabled</td>
            </tr>
            <tr>
              <td>✕ Clear</td>
              <td>Delete all annotations</td>
              <td>Requires a second click to confirm</td>
            </tr>
            <tr>
              <td>⬜ Layout</td>
              <td>Toggle layout mode</td>
              <td>Activates drag-and-drop component placement</td>
            </tr>
          </tbody>
        </table>
        <p>
          The toolbar is draggable — grab the ⣿ handle at the top-left to
          reposition it anywhere on the page.
        </p>
      </section>

      {/* Smart targeting */}
      <section id="smart-targeting">
        <h2>Smart targeting</h2>

        <h3>CSS selector generation</h3>
        <p>
          Pinpoint generates a specific, stable CSS selector for each annotated
          element. It prefers <code>id</code> attributes, then unique class
          combinations, then data attributes, and falls back to nth-child
          selectors. The selector is stored in <code>target.selector</code> in
          every annotation.
        </p>

        <h3>Computed styles</h3>
        <p>
          Pinpoint captures the computed CSS values of the targeted element at
          annotation time: font size, color, background, padding, margin, and
          border. These are stored in <code>metadata.computedStyles</code> and
          are especially useful when reporting visual bugs.
        </p>

        <h3>Bounding box</h3>
        <p>
          <code>target.boundingBox</code> contains{' '}
          <code>{'{ x, y, width, height }'}</code> in viewport coordinates,
          captured at the moment of annotation. This lets the agent know exactly
          where the element is on screen, independent of the DOM structure.
        </p>
      </section>

      {/* React detection */}
      <section id="react-detection">
        <h2>React detection</h2>

        <h3>Component hierarchy</h3>
        <p>
          Pinpoint walks the React fiber tree from the annotated DOM node upward,
          collecting component names. The result is stored in{' '}
          <code>metadata.reactComponents</code> as a string like{' '}
          <code>"App &gt; Layout &gt; Card &gt; Button"</code>. This gives your
          agent the full component context without any manual tracing.
        </p>

        <h3>Source file detection</h3>
        <p>
          React DevTools embed the source file path and line number in component
          fibers when source maps are available. Pinpoint extracts this and stores
          it in <code>metadata.sourceFile</code>, e.g.,{' '}
          <code>"src/components/Button.tsx:42"</code>. This is what lets your
          agent open the exact file without searching.
        </p>

        <Callout type="info">
          Source file detection requires source maps. Vite and Create React App
          include them in development mode by default. In Next.js, ensure{' '}
          <code>reactStrictMode</code> is not disabled.
        </Callout>
      </section>

      {/* Layout mode */}
      <section id="layout-mode">
        <h2>Layout mode</h2>
        <p>
          Press <kbd>L</kbd> or click ⬜ Layout to enter layout mode. This adds:
        </p>
        <ul>
          <li>
            A component palette on the left edge with common UI primitives
            (Heading, Paragraph, Button, Card, Image, Divider, Badge, Input)
          </li>
          <li>Blue grid outlines on all block elements</li>
          <li>
            Drag components from the palette onto the page to record placement
            annotations
          </li>
          <li>
            Drag existing sections up/down to record rearrange annotations
          </li>
          <li>A wireframe opacity slider to fade the page content</li>
        </ul>
        <p>
          Placement and rearrange annotations include a <code>layoutContext</code>{' '}
          field with additional details:
        </p>
        <table>
          <thead>
            <tr>
              <th>Kind</th>
              <th>Fields</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Placement</td>
              <td>
                <code>componentType</code>, <code>xPercent</code>,{' '}
                <code>yPercent</code>, <code>dropWidth</code>,{' '}
                <code>dropHeight</code>, <code>wireframePurpose</code>
              </td>
            </tr>
            <tr>
              <td>Rearrange</td>
              <td>
                <code>sectionLabel</code>, <code>originalIndex</code>,{' '}
                <code>newIndex</code>, <code>targetLabel</code>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Keyboard shortcuts */}
      <section id="keyboard-shortcuts">
        <h2>Keyboard shortcuts</h2>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><kbd>Cmd/Ctrl+Shift+F</kbd></td>
              <td>Toggle capture mode</td>
            </tr>
            <tr>
              <td><kbd>Escape</kbd></td>
              <td>Close popup / exit current mode</td>
            </tr>
            <tr>
              <td><kbd>P</kbd></td>
              <td>Pause / resume animations</td>
            </tr>
            <tr>
              <td><kbd>H</kbd></td>
              <td>Toggle marker pin visibility</td>
            </tr>
            <tr>
              <td><kbd>C</kbd></td>
              <td>Copy annotations as markdown</td>
            </tr>
            <tr>
              <td><kbd>X</kbd></td>
              <td>Clear all annotations</td>
            </tr>
            <tr>
              <td><kbd>L</kbd></td>
              <td>Toggle layout mode</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Agent sync */}
      <section id="agent-sync">
        <h2>Agent sync</h2>
        <p>
          Every annotation is POSTed to the MCP server at the configured{' '}
          <code>endpoint</code>. The server then broadcasts an SSE event to all
          connected clients. The toolbar subscribes to{' '}
          <code>GET /sessions/{'{id}'}/events</code> and updates in real time
          when the agent changes an annotation's status.
        </p>
        <table>
          <thead>
            <tr>
              <th>Agent action</th>
              <th>Toolbar effect</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>pinpoint_acknowledge</code></td>
              <td>Marker pin turns yellow with an eye icon</td>
            </tr>
            <tr>
              <td><code>pinpoint_resolve</code></td>
              <td>Marker pin flashes green and disappears</td>
            </tr>
            <tr>
              <td><code>pinpoint_reply</code></td>
              <td>Thread message appears in the marker pin popup</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Settings */}
      <section id="settings">
        <h2>Settings</h2>
        <p>
          Open the settings panel with the ⚙ button. The following options are
          available:
        </p>
        <table>
          <thead>
            <tr>
              <th>Setting</th>
              <th>Options</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Marker color</td>
              <td>indigo, rose, amber, emerald, sky</td>
              <td>Color of the annotation pins</td>
            </tr>
            <tr>
              <td>Detail level</td>
              <td>compact, standard, detailed, forensic</td>
              <td>How much detail to include when copying as markdown</td>
            </tr>
            <tr>
              <td>Clear on copy</td>
              <td>on / off</td>
              <td>Clear annotations after copying to clipboard</td>
            </tr>
            <tr>
              <td>Block interactions</td>
              <td>on / off</td>
              <td>
                Block clicks on the host page while in capture mode (prevents
                accidental navigation)
              </td>
            </tr>
            <tr>
              <td>Server URL</td>
              <td>text field</td>
              <td>
                MCP server base URL (default:{' '}
                <code>http://localhost:4747</code>)
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </Layout>
  );
}
