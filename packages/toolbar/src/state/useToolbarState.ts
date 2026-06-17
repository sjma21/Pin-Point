import { useState, useEffect } from 'react';
import { toolbarStore, type ToolbarStateData } from './toolbarState.js';

export function useToolbarState(): ToolbarStateData {
  const [state, setState] = useState(() => toolbarStore.get());
  useEffect(() => toolbarStore.subscribe(setState), []);
  return state;
}
