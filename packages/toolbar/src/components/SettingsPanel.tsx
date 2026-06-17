import { C, Z, FONT, MARKER_COLORS } from '../theme.js';
import { toolbarStore } from '../state/toolbarState.js';
import { useToolbarState } from '../state/useToolbarState.js';
import type { DetailLevel } from '../core/markdownSerializer.js';

const DETAIL_LEVELS: { value: DetailLevel; label: string; desc: string }[] = [
  { value: 'compact',  label: 'Compact',  desc: 'Tag, path, comment only' },
  { value: 'standard', label: 'Standard', desc: '+ source file, position, classes' },
  { value: 'detailed', label: 'Detailed', desc: '+ bbox, React tree, aria' },
  { value: 'forensic', label: 'Forensic', desc: '+ computed styles, full DOM path' },
];

const VERSION = '0.3.0';

export function SettingsPanel() {
  const { settings } = useToolbarState();

  const row: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 0', borderBottom: `1px solid ${C.border}`,
  };

  const label: React.CSSProperties = {
    fontSize: 13, color: C.text, fontFamily: FONT, fontWeight: 500,
  };

  const sub: React.CSSProperties = {
    fontSize: 11, color: C.textMuted, fontFamily: FONT, marginTop: 1,
  };

  function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
      <div
        onClick={onToggle}
        style={{
          width: 38, height: 20, borderRadius: 10, cursor: 'pointer',
          background: on ? C.primary : C.border,
          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 2, left: on ? 20 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff', transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
    );
  }

  return (
    <div
      data-pinpoint="settings"
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: Z.settings, pointerEvents: 'auto', background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT,
      }}
      onClick={() => toolbarStore.set({ settingsOpen: false })}
    >
      <div
        style={{
          width: 400, maxHeight: '85vh', background: C.bg,
          border: `1px solid ${C.borderLight}`, borderRadius: 14,
          boxShadow: '0 16px 60px rgba(0,0,0,0.7)',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '14px 18px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>⚙ Settings</span>
          <button
            onClick={() => toolbarStore.set({ settingsOpen: false })}
            style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 18, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '4px 18px 18px' }}>

          {/* Output Detail */}
          <div style={{ padding: '12px 0 6px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ ...label, marginBottom: 8 }}>Output Detail</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {DETAIL_LEVELS.map(lvl => (
                <button
                  key={lvl.value}
                  onClick={() => toolbarStore.updateSettings({ detailLevel: lvl.value })}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 7, cursor: 'pointer', textAlign: 'left',
                    background: settings.detailLevel === lvl.value ? C.primaryFaint : C.surface,
                    border: `1px solid ${settings.detailLevel === lvl.value ? C.primary + '66' : C.border}`,
                    color: settings.detailLevel === lvl.value ? C.primary : C.text,
                    transition: 'all 0.12s',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, fontFamily: FONT }}>{lvl.label}</span>
                  <span style={{ fontSize: 11, color: C.textMuted, fontFamily: FONT }}>{lvl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* React Components */}
          <div style={row}>
            <div>
              <div style={label}>Show React Components</div>
              <div style={sub}>Display fiber component hierarchy in popup & output</div>
            </div>
            <Toggle
              on={settings.showReactComponents}
              onToggle={() => toolbarStore.updateSettings({ showReactComponents: !settings.showReactComponents })}
            />
          </div>

          {/* Clear on Copy */}
          <div style={row}>
            <div>
              <div style={label}>Clear on Copy</div>
              <div style={sub}>Remove all annotations after copying markdown</div>
            </div>
            <Toggle
              on={settings.clearOnCopy}
              onToggle={() => toolbarStore.updateSettings({ clearOnCopy: !settings.clearOnCopy })}
            />
          </div>

          {/* Block interactions */}
          <div style={row}>
            <div>
              <div style={label}>Block Page Interactions</div>
              <div style={sub}>Prevent host app clicks while capturing</div>
            </div>
            <Toggle
              on={settings.blockInteractions}
              onToggle={() => toolbarStore.updateSettings({ blockInteractions: !settings.blockInteractions })}
            />
          </div>

          {/* Marker Color */}
          <div style={{ ...row, flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
            <div style={label}>Marker Color</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {MARKER_COLORS.map(mc => (
                <div
                  key={mc.value}
                  onClick={() => toolbarStore.updateSettings({ markerColor: mc.value })}
                  title={mc.label}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
                    background: mc.value,
                    border: settings.markerColor === mc.value ? '3px solid #fff' : '2px solid transparent',
                    boxShadow: settings.markerColor === mc.value ? `0 0 0 2px ${mc.value}` : 'none',
                    transition: 'all 0.15s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* MCP Endpoint */}
          <div style={{ ...row, flexDirection: 'column', alignItems: 'flex-start', gap: 6, borderBottom: 'none' }}>
            <div style={label}>MCP Server URL</div>
            <input
              type="text"
              value={settings.serverUrl}
              onChange={e => toolbarStore.updateSettings({ serverUrl: e.target.value })}
              placeholder="http://localhost:3141"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7,
                color: C.text, fontSize: 12, fontFamily: 'monospace', padding: '7px 10px',
                outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = C.primary)}
              onBlur={e => (e.target.style.borderColor = C.border)}
            />
          </div>
        </div>

        <div style={{
          padding: '10px 18px',
          borderTop: `1px solid ${C.border}`,
          fontSize: 11, color: C.textDim, fontFamily: FONT,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>📍 Pinpoint v{VERSION}</span>
          <span>Phase 3 — React UI</span>
        </div>
      </div>
    </div>
  );
}
