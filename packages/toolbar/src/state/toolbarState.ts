import type { Annotation } from '@pinpoint/shared';
import { AnnotationIntent, AnnotationSeverity, generateId } from '@pinpoint/shared';
import type { DetailLevel } from '../core/markdownSerializer.js';
import { emit } from '../core/eventBus.js';
import { loadAnnotations, saveAnnotations } from '../core/storageManager.js';

export type ToolbarMode = 'idle' | 'capturing' | 'area-select';

export interface ToolbarExtendedSettings {
  detailLevel: DetailLevel;
  showReactComponents: boolean;
  markerColor: string;
  clearOnCopy: boolean;
  blockInteractions: boolean;
  serverUrl: string;
  defaultIntent: AnnotationIntent;
  defaultSeverity: AnnotationSeverity;
}

export interface PopupConfig {
  element: Element;
  clientX: number;
  clientY: number;
  editAnnotationId?: string;
}

export interface ToolbarPosition {
  x: number;
  y: number;
}

export interface ToolbarStateData {
  mode: ToolbarMode;
  annotations: Annotation[];
  sessionId: string;
  settings: ToolbarExtendedSettings;
  markersVisible: boolean;
  animationsPaused: boolean;
  layoutMode: boolean;
  popupConfig: PopupConfig | null;
  toolbarPosition: ToolbarPosition;
  settingsOpen: boolean;
}

const SETTINGS_KEY = 'pp_settings_v1';
const TOOLBAR_POS_KEY = 'pp_toolbar_pos';

function defaultSettings(): ToolbarExtendedSettings {
  return {
    detailLevel: 'standard',
    showReactComponents: true,
    markerColor: '#6366f1',
    clearOnCopy: false,
    blockInteractions: true,
    serverUrl: 'http://localhost:3141',
    defaultIntent: AnnotationIntent.Bug,
    defaultSeverity: AnnotationSeverity.Medium,
  };
}

function loadSettings(): ToolbarExtendedSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    return { ...defaultSettings(), ...(JSON.parse(raw) as Partial<ToolbarExtendedSettings>) };
  } catch {
    return defaultSettings();
  }
}

function persistSettings(s: ToolbarExtendedSettings): void {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* quota */ }
}

function loadToolbarPosition(): ToolbarPosition {
  try {
    const raw = localStorage.getItem(TOOLBAR_POS_KEY);
    if (raw) return JSON.parse(raw) as ToolbarPosition;
  } catch { /* ignore */ }
  return {
    x: Math.max(0, window.innerWidth - 348),
    y: Math.max(0, window.innerHeight - 120),
  };
}

type Listener = (state: ToolbarStateData) => void;

class ToolbarStore {
  private _state: ToolbarStateData;
  private _listeners = new Set<Listener>();

  constructor() {
    this._state = {
      mode: 'idle',
      annotations: loadAnnotations(),
      sessionId: generateId('sess'),
      settings: loadSettings(),
      markersVisible: true,
      animationsPaused: false,
      layoutMode: false,
      popupConfig: null,
      toolbarPosition: loadToolbarPosition(),
      settingsOpen: false,
    };
  }

  get(): ToolbarStateData { return this._state; }

  set(partial: Partial<ToolbarStateData>): void {
    this._state = { ...this._state, ...partial };
    this._notify();
  }

  subscribe(listener: Listener): () => void {
    this._listeners.add(listener);
    return () => { this._listeners.delete(listener); };
  }

  addAnnotation(ann: Annotation): void {
    const annotations = [...this._state.annotations, ann];
    this._state = { ...this._state, annotations };
    saveAnnotations(annotations);
    emit('annotationAdded', ann);
    this._notify();
  }

  updateAnnotation(updated: Annotation): void {
    const annotations = this._state.annotations.map(a => a.id === updated.id ? updated : a);
    this._state = { ...this._state, annotations };
    saveAnnotations(annotations);
    emit('annotationUpdated', updated);
    this._notify();
  }

  deleteAnnotation(id: string): void {
    const deleted = this._state.annotations.find(a => a.id === id);
    const annotations = this._state.annotations.filter(a => a.id !== id);
    this._state = { ...this._state, annotations };
    saveAnnotations(annotations);
    if (deleted) emit('annotationDeleted', deleted);
    this._notify();
  }

  clearAnnotations(): void {
    this._state = { ...this._state, annotations: [] };
    saveAnnotations([]);
    emit('annotationsCleared', undefined);
    this._notify();
  }

  updateSettings(partial: Partial<ToolbarExtendedSettings>): void {
    const settings = { ...this._state.settings, ...partial };
    persistSettings(settings);
    this._state = { ...this._state, settings };
    emit('settingsChanged', settings);
    this._notify();
  }

  saveToolbarPosition(pos: ToolbarPosition): void {
    try { localStorage.setItem(TOOLBAR_POS_KEY, JSON.stringify(pos)); } catch { /* ignore */ }
    this._state = { ...this._state, toolbarPosition: pos };
  }

  private _notify(): void {
    const s = this._state;
    this._listeners.forEach(fn => { try { fn(s); } catch { /* ignore */ } });
  }
}

export const toolbarStore = new ToolbarStore();
