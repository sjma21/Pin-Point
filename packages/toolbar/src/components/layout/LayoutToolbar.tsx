import { C, FONT } from '../../theme.js';
import { toolbarStore } from '../../state/toolbarState.js';
import { WireframeMode } from './WireframeMode.js';

interface Props {
  placementCount: number;
  rearrangeCount: number;
  wireframeMode: boolean;
  wireframeOpacity: number;
  wireframePurpose: string;
}

export function LayoutToolbar({
  placementCount,
  rearrangeCount,
  wireframeMode,
  wireframeOpacity,
  wireframePurpose,
}: Props) {
  const total = placementCount + rearrangeCount;

  function handleClearPlacements() {
    // Remove only placement and rearrange annotations
    const state = toolbarStore.get();
    const keep = state.annotations.filter(
      a => (a.kind as string) !== 'placement' && (a.kind as string) !== 'rearrange',
    );
    toolbarStore.set({ annotations: keep });
  }

  function handleDone() {
    if (wireframeMode) toolbarStore.set({ wireframeMode: false });
    toolbarStore.set({ layoutMode: false });
  }

  const statChip = (label: string, count: number, color: string) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', background: `${color}18`,
      border: `1px solid ${color}44`, borderRadius: 999,
      fontSize: 11, fontWeight: 700, color, fontFamily: FONT,
    }}>
      {count} {label}
    </span>
  );

  const btn = (label: string, onClick: () => void, accent: string, disabled = false) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '4px 10px', borderRadius: 6, border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 11, fontWeight: 600, fontFamily: FONT,
        background: disabled ? C.surface : `${accent}22`,
        color: disabled ? C.textDim : accent,
        outline: disabled ? 'none' : `1px solid ${accent}44`,
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ borderTop: `1px solid ${C.border}` }}>
      {/* Stats + controls row */}
      <div style={{ padding: '8px 10px', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {total === 0 ? (
          <span style={{ fontSize: 11, color: C.textDim, fontFamily: FONT }}>
            No placements yet — drag components onto the page
          </span>
        ) : (
          <>
            {placementCount > 0 && statChip('placed', placementCount, C.success)}
            {rearrangeCount > 0 && statChip('rearranged', rearrangeCount, C.primary)}
          </>
        )}
        <div style={{ flex: 1 }} />
        {btn('Clear', handleClearPlacements, C.danger, total === 0)}
        {btn('✓ Done', handleDone, C.success)}
      </div>

      {/* Wireframe controls */}
      <WireframeMode
        active={wireframeMode}
        opacity={wireframeOpacity}
        purpose={wireframePurpose}
      />
    </div>
  );
}
