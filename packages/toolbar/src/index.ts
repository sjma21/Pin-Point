// Primary export — drop into any React app
export { Pinpoint } from './components/Pinpoint.js';
export type { PinpointProps } from './components/Pinpoint.js';

// Core engine (Phase 2) — available for advanced use
export * from './core/index.js';

// State manager — for external integrations
export { toolbarStore } from './state/toolbarState.js';
export type { ToolbarStateData, ToolbarMode, ToolbarExtendedSettings } from './state/toolbarState.js';

// Shared types re-exported for convenience
export type { Annotation, Session } from '@sajalmishra/markpin-shared';
export { AnnotationIntent, AnnotationSeverity, AnnotationStatus, AnnotationKind } from '@sajalmishra/markpin-shared';
