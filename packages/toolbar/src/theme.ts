export const C = {
  bg: '#16162a',
  surface: '#1e1e3a',
  surfaceHover: '#262648',
  border: '#32325a',
  borderLight: '#3d3d68',
  text: '#e4e4f0',
  textMuted: '#8888aa',
  textDim: '#555578',
  primary: '#6366f1',
  primaryHover: '#4f46e5',
  primaryFaint: 'rgba(99,102,241,0.14)',
  primaryBright: '#818cf8',
  success: '#22c55e',
  successFaint: 'rgba(34,197,94,0.14)',
  danger: '#ef4444',
  dangerFaint: 'rgba(239,68,68,0.14)',
  warning: '#f59e0b',
  warningFaint: 'rgba(245,158,11,0.14)',
  info: '#38bdf8',
  infoFaint: 'rgba(56,189,248,0.14)',
} as const;

export const Z = {
  blockInteractions: 2147483620, // blocks host app only; below all toolbar UI
  highlight:         2147483625,
  capture:           2147483630,
  markers:           2147483635,
  markerTooltip:     2147483636,
  toolbar:           2147483638,
  popup:             2147483643, // must be above toolbar
  settings:          2147483645, // must be above popup
} as const;

export const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Roboto, sans-serif`;

export const INTENT_META: Record<string, { label: string; color: string; faint: string }> = {
  bug:         { label: '🐛 Bug',         color: C.danger,   faint: C.dangerFaint },
  improvement: { label: '✨ Improve',     color: C.info,     faint: C.infoFaint },
  question:    { label: '❓ Question',    color: C.warning,  faint: C.warningFaint },
  praise:      { label: '👍 Praise',      color: C.success,  faint: C.successFaint },
  task:        { label: '📋 Task',        color: C.primary,  faint: C.primaryFaint },
  note:        { label: '📝 Note',        color: C.textMuted,faint: 'rgba(136,136,170,0.14)' },
};

export const SEVERITY_META: Record<string, { label: string; color: string; faint: string }> = {
  critical:  { label: '🔴 Critical',    color: '#dc2626', faint: 'rgba(220,38,38,0.14)' },
  high:      { label: '🟠 High',        color: C.danger,  faint: C.dangerFaint },
  medium:    { label: '🟡 Medium',      color: C.warning, faint: C.warningFaint },
  low:       { label: '🔵 Low',         color: C.info,    faint: C.infoFaint },
  info:      { label: '⚪ Info',        color: C.textMuted,faint: 'rgba(136,136,170,0.14)' },
};

export const MARKER_COLORS = [
  { label: 'Indigo',  value: '#6366f1' },
  { label: 'Rose',    value: '#f43f5e' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber',   value: '#f59e0b' },
  { label: 'Sky',     value: '#0ea5e9' },
  { label: 'Violet',  value: '#8b5cf6' },
] as const;
