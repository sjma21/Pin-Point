import {
  AnnotationIntent,
  AnnotationKind,
  AnnotationSeverity,
  AnnotationStatus,
  AFSEventType,
  SessionStatus,
  OutputFormat,
} from './enums.js';

// ─── Coordinate & Geometry ────────────────────────────────────────────────────

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

// ─── Target ───────────────────────────────────────────────────────────────────

export interface AnnotationTarget {
  /** CSS selector for the targeted element */
  selector?: string;
  /** XPath expression */
  xpath?: string;
  /** Bounding box of the targeted area in viewport coordinates */
  boundingBox?: BoundingBox;
  /** Visible text content of the element */
  textContent?: string;
  /** aria-label of the element */
  ariaLabel?: string;
  /** URL of the page where the annotation was made */
  url: string;
  /** Viewport dimensions at the time of annotation */
  viewport: { width: number; height: number };
  /** Device pixel ratio */
  devicePixelRatio?: number;
}

// ─── Annotation ───────────────────────────────────────────────────────────────

export interface AnnotationMetadata {
  /** Browser user agent string */
  userAgent?: string;
  /** Any arbitrary key/value pairs */
  [key: string]: unknown;
}

/** Core annotation — all required fields */
export interface AnnotationRequired {
  id: string;
  sessionId: string;
  createdAt: string; // ISO-8601
  kind: AnnotationKind;
  intent: AnnotationIntent;
  target: AnnotationTarget;
  comment: string;
}

/** Recommended fields — should be included when available */
export interface AnnotationRecommended {
  severity: AnnotationSeverity;
  status: AnnotationStatus;
  screenshotUrl?: string;
  screenshotDataUrl?: string;
  /** Index within the session (1-based) */
  index?: number;
}

/** Optional / lifecycle fields */
export interface AnnotationOptional {
  updatedAt?: string; // ISO-8601
  resolvedAt?: string; // ISO-8601
  resolvedBy?: string;
  tags?: string[];
  assignee?: string;
  linkedAnnotationIds?: string[];
  metadata?: AnnotationMetadata;
}

export type Annotation = AnnotationRequired & AnnotationRecommended & AnnotationOptional;

// ─── Session ──────────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
  status: SessionStatus;
  url: string;
  title?: string;
  annotations: Annotation[];
  /** Agent or user who owns the session */
  owner?: string;
  outputFormat?: OutputFormat;
  metadata?: Record<string, unknown>;
}

// ─── AFS Events ───────────────────────────────────────────────────────────────

export interface AFSEventBase {
  id: string;
  type: AFSEventType;
  sessionId: string;
  timestamp: string; // ISO-8601
}

export interface SessionStartedEvent extends AFSEventBase {
  type: AFSEventType.SessionStarted;
  payload: { session: Session };
}

export interface SessionEndedEvent extends AFSEventBase {
  type: AFSEventType.SessionEnded;
  payload: { sessionId: string; annotationCount: number };
}

export interface SessionPausedEvent extends AFSEventBase {
  type: AFSEventType.SessionPaused;
  payload: { sessionId: string };
}

export interface SessionResumedEvent extends AFSEventBase {
  type: AFSEventType.SessionResumed;
  payload: { sessionId: string };
}

export interface AnnotationCreatedEvent extends AFSEventBase {
  type: AFSEventType.AnnotationCreated;
  payload: { annotation: Annotation };
}

export interface AnnotationUpdatedEvent extends AFSEventBase {
  type: AFSEventType.AnnotationUpdated;
  payload: { annotation: Annotation; previousStatus?: AnnotationStatus };
}

export interface AnnotationDeletedEvent extends AFSEventBase {
  type: AFSEventType.AnnotationDeleted;
  payload: { annotationId: string; sessionId: string };
}

export interface AnnotationResolvedEvent extends AFSEventBase {
  type: AFSEventType.AnnotationResolved;
  payload: { annotation: Annotation };
}

export interface ScreenshotCapturedEvent extends AFSEventBase {
  type: AFSEventType.ScreenshotCaptured;
  payload: { annotationId: string; dataUrl: string };
}

export interface ActionRequestedEvent extends AFSEventBase {
  type: AFSEventType.ActionRequested;
  payload: { request: ActionRequest };
}

export interface ActionCompletedEvent extends AFSEventBase {
  type: AFSEventType.ActionCompleted;
  payload: { requestId: string; result: ActionResult };
}

export type AFSEvent =
  | SessionStartedEvent
  | SessionEndedEvent
  | SessionPausedEvent
  | SessionResumedEvent
  | AnnotationCreatedEvent
  | AnnotationUpdatedEvent
  | AnnotationDeletedEvent
  | AnnotationResolvedEvent
  | ScreenshotCapturedEvent
  | ActionRequestedEvent
  | ActionCompletedEvent;

// ─── Action Requests ──────────────────────────────────────────────────────────

export type ActionRequestKind =
  | 'navigate'
  | 'click'
  | 'type'
  | 'scroll'
  | 'screenshot'
  | 'highlight'
  | 'dismiss_highlight';

export interface ActionRequest {
  id: string;
  sessionId: string;
  kind: ActionRequestKind;
  createdAt: string; // ISO-8601
  payload: Record<string, unknown>;
}

export interface ActionResult {
  requestId: string;
  success: boolean;
  completedAt: string; // ISO-8601
  error?: string;
  data?: Record<string, unknown>;
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

export interface ToolbarSettings {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  theme: 'light' | 'dark' | 'auto';
  collapsed: boolean;
  /** MCP server base URL */
  serverUrl: string;
  /** Whether to capture screenshots automatically on annotation */
  autoScreenshot: boolean;
  /** Default intent for new annotations */
  defaultIntent: AnnotationIntent;
  /** Default severity for new annotations */
  defaultSeverity: AnnotationSeverity;
  /** Show annotation overlays on the page */
  showOverlays: boolean;
}

export interface ToolbarState {
  sessionId: string | null;
  sessionStatus: SessionStatus;
  annotations: Annotation[];
  isCapturing: boolean;
  selectedAnnotationId: string | null;
  pendingAction: ActionRequest | null;
  settings: ToolbarSettings;
  error: string | null;
}
