import { useState } from 'react';
import { C, Z, FONT, MARKER_COLORS } from '../theme.js';
import { toolbarStore } from '../state/toolbarState.js';
import { useToolbarState } from '../state/useToolbarState.js';
import type { DetailLevel } from '../core/markdownSerializer.js';
import type { AgentMode } from '../state/toolbarState.js';

const DETAIL_LEVELS: { value: DetailLevel; label: string; desc: string }[] = [
  { value: 'compact',  label: 'Compact',  desc: 'Tag, path, comment only' },
  { value: 'standard', label: 'Standard', desc: '+ source file, position, classes' },
  { value: 'detailed', label: 'Detailed', desc: '+ bbox, React tree, aria' },
  { value: 'forensic', label: 'Forensic', desc: '+ computed styles, full DOM path' },
];

const VERSION = '0.6.0';

const AGENT_MODES: {
  mode: AgentMode;
  icon: string;
  title: string;
  desc: string;
  phrase: string;
  hasUrl: boolean;
  requiresSkill?: string;
  installCmd?: string;
  altPhrase?: string;
  altPhraseLabel?: string;
}[] = [
  {
    mode: 'watching',
    icon: '👁',
    title: 'Hands-Free Mode',
    desc: 'Claude watches and automatically fixes annotations as you create them.',
    phrase: 'watch mode',
    hasUrl: false,
  },
  {
    mode: 'critiquing',
    icon: '🔍',
    title: 'Critique Mode',
    desc: 'Claude reviews your app and adds annotations. Browser critique needs the agent-browser skill; code review works without it.',
    phrase: 'critique [url]',
    hasUrl: true,
    requiresSkill: 'agent-browser',
    installCmd: 'npx skills add vercel-labs/agent-browser',
    altPhrase: 'critique my code at [url]',
    altPhraseLabel: 'No browser needed',
  },
  {
    mode: 'self-driving',
    icon: '🚗',
    title: 'Self-Driving Mode',
    desc: 'Claude critiques and fixes everything in one session without you doing anything.',
    phrase: 'self-driving mode on [url]',
    hasUrl: true,
    requiresSkill: 'agent-browser',
    installCmd: 'npx skills add vercel-labs/agent-browser',
  },
];

export function SettingsPanel() {
  const { settings, agentMode } = useToolbarState();
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);
  const [critiqueUrl, setCritiqueUrl] = useState('');
  const [selfDrivingUrl, setSelfDrivingUrl] = useState('');

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

  async function copyPhrase(phrase: string, url: string) {
    const full = url ? phrase.replace('[url]', url) : phrase;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(full);
      } else {
        const ta = document.createElement('textarea');
        ta.value = full;
        ta.style.cssText = 'position:fixed;top:-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
    } catch { /* ignore */ }
    setCopiedPhrase(phrase);
    setTimeout(() => setCopiedPhrase(null), 2000);
  }

  function startMode(mode: AgentMode) {
    toolbarStore.set({ agentMode: mode, settingsOpen: false });
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
          width: 420, maxHeight: '90vh', background: C.bg,
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

          {/* ── Agent Modes ───────────────────────────────────────────────── */}
          <div style={{ padding: '12px 0 6px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ ...label, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              🤖 Agent Modes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {AGENT_MODES.map(m => {
                const isActive = agentMode === m.mode;
                const url = m.mode === 'critiquing' ? critiqueUrl : m.mode === 'self-driving' ? selfDrivingUrl : '';
                const setUrl = m.mode === 'critiquing' ? setCritiqueUrl : m.mode === 'self-driving' ? setSelfDrivingUrl : null;
                const isCopied = copiedPhrase === m.phrase;

                return (
                  <div
                    key={m.mode}
                    style={{
                      borderRadius: 8, padding: '10px 12px',
                      background: isActive ? `${C.primary}14` : C.surface,
                      border: `1px solid ${isActive ? C.primary + '55' : C.border}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: FONT, marginBottom: 3 }}>
                          {m.icon} {m.title}
                          {isActive && (
                            <span style={{
                              marginLeft: 8, fontSize: 10, fontWeight: 600,
                              color: C.success, background: C.successFaint,
                              padding: '1px 6px', borderRadius: 999,
                            }}>
                              Active
                            </span>
                          )}
                        </div>
                        <div style={{ ...sub, lineHeight: 1.5 }}>{m.desc}</div>
                      </div>
                    </div>

                    {m.hasUrl && setUrl && (
                      <input
                        type="text"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="http://localhost:5173"
                        style={{
                          marginTop: 8, width: '100%', boxSizing: 'border-box',
                          background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5,
                          color: C.text, fontSize: 11, fontFamily: 'monospace', padding: '5px 8px',
                          outline: 'none',
                        }}
                        onFocus={e => (e.target.style.borderColor = C.primary)}
                        onBlur={e => (e.target.style.borderColor = C.border)}
                        onClick={e => e.stopPropagation()}
                      />
                    )}

                    {m.requiresSkill && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 10, fontWeight: 600, fontFamily: FONT,
                          color: '#92400e', background: '#fef3c7',
                          border: '1px solid #fde68a', borderRadius: 4,
                          padding: '2px 6px', marginBottom: 5,
                        }}>
                          ⚡ Requires: {m.requiresSkill}
                        </div>
                        <div style={{
                          background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5,
                          padding: '4px 8px', fontSize: 10, fontFamily: 'monospace', color: C.textMuted,
                        }}>
                          {m.installCmd}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                      <div style={{
                        flex: 1, background: C.bg, border: `1px solid ${C.border}`,
                        borderRadius: 5, padding: '4px 8px',
                        fontSize: 11, fontFamily: 'monospace', color: C.textMuted,
                      }}>
                        {url ? m.phrase.replace('[url]', url) : m.phrase}
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); void copyPhrase(m.phrase, url); }}
                        style={{
                          background: 'none', border: `1px solid ${C.border}`, borderRadius: 5,
                          color: isCopied ? C.success : C.textMuted, fontSize: 10, fontWeight: 600,
                          cursor: 'pointer', padding: '4px 8px', fontFamily: FONT, flexShrink: 0,
                          transition: 'color 0.15s',
                        }}
                        title="Copy trigger phrase"
                      >
                        {isCopied ? '✓ Copied' : 'Copy'}
                      </button>
                      {isActive ? (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toolbarStore.set({ agentMode: 'idle', settingsOpen: false });
                          }}
                          style={{
                            background: C.dangerFaint, border: `1px solid ${C.danger}55`,
                            borderRadius: 5, color: C.danger, fontSize: 10, fontWeight: 700,
                            cursor: 'pointer', padding: '4px 10px', fontFamily: FONT, flexShrink: 0,
                          }}
                        >
                          Stop
                        </button>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation(); startMode(m.mode); }}
                          style={{
                            background: C.primaryFaint, border: `1px solid ${C.primary}55`,
                            borderRadius: 5, color: C.primaryBright, fontSize: 10, fontWeight: 700,
                            cursor: 'pointer', padding: '4px 10px', fontFamily: FONT, flexShrink: 0,
                          }}
                        >
                          Start
                        </button>
                      )}
                    </div>

                    {m.altPhrase && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <div style={{
                          fontSize: 9, fontWeight: 700, color: C.success, background: C.successFaint,
                          border: `1px solid ${C.success}44`, borderRadius: 4,
                          padding: '2px 5px', fontFamily: FONT, flexShrink: 0, whiteSpace: 'nowrap',
                        }}>
                          {m.altPhraseLabel}
                        </div>
                        <div style={{
                          flex: 1, background: C.bg, border: `1px solid ${C.border}`,
                          borderRadius: 5, padding: '4px 8px',
                          fontSize: 11, fontFamily: 'monospace', color: C.textMuted,
                        }}>
                          {url ? m.altPhrase.replace('[url]', url) : m.altPhrase}
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); void copyPhrase(m.altPhrase!, url); }}
                          style={{
                            background: 'none', border: `1px solid ${C.border}`, borderRadius: 5,
                            color: copiedPhrase === m.altPhrase ? C.success : C.textMuted,
                            fontSize: 10, fontWeight: 600, cursor: 'pointer',
                            padding: '4px 8px', fontFamily: FONT, flexShrink: 0,
                            transition: 'color 0.15s',
                          }}
                          title="Copy no-browser trigger phrase"
                        >
                          {copiedPhrase === m.altPhrase ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Output Detail ─────────────────────────────────────────────── */}
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

          {/* ── React Components ──────────────────────────────────────────── */}
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

          {/* ── Clear on Copy ─────────────────────────────────────────────── */}
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

          {/* ── Block interactions ────────────────────────────────────────── */}
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

          {/* ── Marker Color ──────────────────────────────────────────────── */}
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

          {/* ── MCP Endpoint ──────────────────────────────────────────────── */}
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
          <span>Phase 6 — Agent Modes</span>
        </div>
      </div>
    </div>
  );
}
