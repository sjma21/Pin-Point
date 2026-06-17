import { useState, useCallback } from 'react';
import { C, Z, FONT } from '../../theme.js';
import { placementHandler } from '../../core/placementHandler.js';

interface ComponentDef { type: string; icon: string }
interface Category { name: string; icon: string; components: ComponentDef[] }

const CATEGORIES: Category[] = [
  {
    name: 'Layout', icon: '⬜',
    components: [
      { type: 'Hero', icon: '🌟' }, { type: 'Header', icon: '⬆' },
      { type: 'Footer', icon: '⬇' }, { type: 'Sidebar', icon: '◧' },
      { type: 'Container', icon: '▭' }, { type: 'Grid', icon: '⊞' },
      { type: 'Section', icon: '▬' }, { type: 'Divider', icon: '—' },
    ],
  },
  {
    name: 'Navigation', icon: '🧭',
    components: [
      { type: 'Navbar', icon: '☰' }, { type: 'Breadcrumb', icon: '›' },
      { type: 'Tabs', icon: '⊟' }, { type: 'Pagination', icon: '⋯' },
      { type: 'Sidebar Nav', icon: '≡' }, { type: 'Steps', icon: '→' },
    ],
  },
  {
    name: 'Content', icon: '📝',
    components: [
      { type: 'Heading', icon: 'H' }, { type: 'Paragraph', icon: '¶' },
      { type: 'Quote', icon: '"' }, { type: 'Code Block', icon: '</>' },
      { type: 'List', icon: '≡' }, { type: 'Table', icon: '⊞' },
      { type: 'Timeline', icon: '↕' }, { type: 'Accordion', icon: '⊕' },
      { type: 'FAQ', icon: '?' },
    ],
  },
  {
    name: 'Media', icon: '🖼',
    components: [
      { type: 'Image', icon: '🖼' }, { type: 'Video', icon: '▶' },
      { type: 'Avatar', icon: '👤' }, { type: 'Icon', icon: '★' },
      { type: 'Banner', icon: '📢' }, { type: 'Carousel', icon: '◁▷' },
      { type: 'Gallery', icon: '⊞' },
    ],
  },
  {
    name: 'Forms', icon: '📋',
    components: [
      { type: 'Form', icon: '📋' }, { type: 'Input', icon: '▭' },
      { type: 'Textarea', icon: '▬' }, { type: 'Select', icon: '▾' },
      { type: 'Checkbox', icon: '☑' }, { type: 'Radio', icon: '◉' },
      { type: 'Toggle', icon: '⊙' }, { type: 'Slider', icon: '⋯' },
      { type: 'File Upload', icon: '⬆' }, { type: 'Date Picker', icon: '📅' },
    ],
  },
  {
    name: 'Feedback', icon: '💬',
    components: [
      { type: 'Alert', icon: '⚠' }, { type: 'Toast', icon: '🍞' },
      { type: 'Modal', icon: '⬜' }, { type: 'Tooltip', icon: '💭' },
      { type: 'Badge', icon: '●' }, { type: 'Progress', icon: '▬' },
      { type: 'Spinner', icon: '↻' }, { type: 'Skeleton', icon: '▭' },
    ],
  },
  {
    name: 'Cards', icon: '🃏',
    components: [
      { type: 'Card', icon: '🃏' }, { type: 'Product Card', icon: '🛍' },
      { type: 'Profile Card', icon: '👤' }, { type: 'Pricing Card', icon: '💰' },
      { type: 'Stats Card', icon: '📊' }, { type: 'Feature Card', icon: '✨' },
      { type: 'Testimonial Card', icon: '💬' },
    ],
  },
  {
    name: 'Actions', icon: '⚡',
    components: [
      { type: 'Button', icon: '⬜' }, { type: 'Button Group', icon: '⬛⬛' },
      { type: 'FAB', icon: '⊕' }, { type: 'Link', icon: '🔗' },
      { type: 'Dropdown', icon: '▾' }, { type: 'Context Menu', icon: '☰' },
    ],
  },
  {
    name: 'Data', icon: '📊',
    components: [
      { type: 'Chart', icon: '📊' }, { type: 'Data Table', icon: '⊞' },
      { type: 'Kanban', icon: '⊟' }, { type: 'Calendar', icon: '📅' },
      { type: 'Map', icon: '🗺' },
    ],
  },
];

interface Props {
  wireframePurpose: string;
}

export function ComponentPalette({ wireframePurpose }: Props) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCat = useCallback((name: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }, []);

  const filtered = search.trim()
    ? CATEGORIES.map(cat => ({
        ...cat,
        components: cat.components.filter(c =>
          c.type.toLowerCase().includes(search.toLowerCase()),
        ),
      })).filter(cat => cat.components.length > 0)
    : CATEGORIES;

  return (
    <div
      data-pinpoint="layout-palette"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 216,
        height: '100vh',
        background: C.bg,
        borderRight: `1px solid ${C.border}`,
        boxShadow: '4px 0 28px rgba(0,0,0,0.55)',
        zIndex: Z.palette,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONT,
        pointerEvents: 'auto',
        animation: 'ppPaletteIn 0.22s ease-out both',
      }}
    >
      <style>{`
        @keyframes ppPaletteIn {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        [data-pinpoint="layout-palette"] ::-webkit-scrollbar { width: 4px; }
        [data-pinpoint="layout-palette"] ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: '12px 10px 8px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: C.primary, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ⬜ Components
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search…"
          style={{
            width: '100%', padding: '4px 8px',
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 5, color: C.text, fontSize: 12,
            fontFamily: FONT, outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Component list */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 12 }}>
        {filtered.map(cat => (
          <div key={cat.name}>
            <button
              onClick={() => toggleCat(cat.name)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 10px 4px', background: 'none', border: 'none',
                cursor: 'pointer', color: C.textMuted, fontSize: 10, fontWeight: 800,
                fontFamily: FONT, letterSpacing: '0.08em', textTransform: 'uppercase',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 9, opacity: 0.6 }}>{collapsed.has(cat.name) ? '▶' : '▼'}</span>
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>

            {!collapsed.has(cat.name) && (
              <div style={{ padding: '2px 8px 4px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {cat.components.map(comp => (
                  <ComponentChip key={comp.type} comp={comp} wireframePurpose={wireframePurpose} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div style={{ padding: '6px 10px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: C.textDim, lineHeight: 1.5 }}>
          Drag a component onto the page to place it
        </div>
      </div>
    </div>
  );
}

function ComponentChip({ comp, wireframePurpose }: { comp: ComponentDef; wireframePurpose: string }) {
  const [dragging, setDragging] = useState(false);

  // wireframePurpose is read at drop time via closure; pass through dragstart
  void wireframePurpose;

  return (
    <div
      draggable
      onDragStart={e => {
        setDragging(true);
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', comp.type);
        placementHandler.startDrag(comp.type);
      }}
      onDragEnd={() => {
        setDragging(false);
        placementHandler.endDrag();
      }}
      title={comp.type}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '3px 6px',
        background: dragging ? C.primaryFaint : C.surface,
        border: `1px solid ${dragging ? C.primary : C.border}`,
        borderRadius: 5, cursor: 'grab', fontSize: 11,
        color: dragging ? C.primaryBright : C.textMuted,
        fontFamily: FONT, userSelect: 'none',
        transition: 'all 0.1s', whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: 10 }}>{comp.icon}</span>
      <span>{comp.type}</span>
    </div>
  );
}
