import { C, FONT } from '../../theme.js';
import { toolbarStore } from '../../state/toolbarState.js';

interface Props {
  active: boolean;
  opacity: number;
  purpose: string;
}

export function WireframeMode({ active, opacity, purpose }: Props) {
  return (
    <div style={{ padding: '8px 10px', borderTop: `1px solid ${C.border}` }}>
      {/* Toggle row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: active ? 8 : 0 }}>
        <button
          onClick={() => toolbarStore.set({ wireframeMode: !active })}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 6, border: 'none',
            cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: FONT,
            background: active ? `${C.primary}22` : C.surface,
            color: active ? C.primaryBright : C.textMuted,
            outline: active ? `1px solid ${C.primary}55` : 'none',
            transition: 'all 0.15s',
          }}
          title="Toggle wireframe mode — fades the page for clean sketching"
        >
          <span style={{ fontSize: 12 }}>{active ? '◈' : '◇'}</span>
          Wireframe
        </button>
        <span style={{ fontSize: 10, color: C.textDim, lineHeight: 1.4 }}>
          {active ? 'Page faded — sketch freely' : 'Fade page to sketch'}
        </span>
      </div>

      {active && (
        <>
          {/* Opacity slider */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 10, color: C.textMuted, fontFamily: FONT, fontWeight: 600 }}>
                Page opacity
              </label>
              <span style={{ fontSize: 10, color: C.textDim, fontFamily: FONT }}>
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={Math.round(opacity * 100)}
              onChange={e => toolbarStore.set({ wireframeOpacity: Number(e.target.value) / 100 })}
              style={{ width: '100%', accentColor: C.primary, cursor: 'pointer' }}
            />
          </div>

          {/* Purpose field */}
          <div>
            <label style={{ fontSize: 10, color: C.textMuted, fontFamily: FONT, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              What is this page for?
            </label>
            <textarea
              value={purpose}
              onChange={e => toolbarStore.set({ wireframePurpose: e.target.value })}
              placeholder="e.g. SaaS pricing page targeting SMB customers…"
              rows={2}
              style={{
                width: '100%', padding: '5px 8px',
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 6, color: C.text, fontSize: 11,
                fontFamily: FONT, resize: 'vertical', outline: 'none',
                boxSizing: 'border-box', lineHeight: 1.5,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
