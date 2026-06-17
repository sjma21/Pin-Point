import { useEffect } from 'react';
import { activateAreaSelection, deactivateAreaSelection } from '../core/areaSelectionHandler.js';
import type { AreaSelection } from '../core/areaSelectionHandler.js';

interface Props {
  onComplete: (sel: AreaSelection) => void;
}

export function AreaSelectionOverlay({ onComplete }: Props) {
  useEffect(() => {
    activateAreaSelection((sel) => {
      onComplete(sel);
    });
    return () => deactivateAreaSelection();
  }, [onComplete]);

  return null;
}
