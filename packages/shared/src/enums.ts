export enum AnnotationIntent {
  Bug = 'bug',
  Improvement = 'improvement',
  Question = 'question',
  Praise = 'praise',
  Task = 'task',
  Note = 'note',
}

export enum AnnotationSeverity {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low',
  Info = 'info',
}

export enum AnnotationStatus {
  Open = 'open',
  InProgress = 'in_progress',
  Resolved = 'resolved',
  Dismissed = 'dismissed',
  WontFix = 'wont_fix',
}

export enum AnnotationKind {
  Element = 'element',
  Region = 'region',
  Page = 'page',
  Network = 'network',
  Console = 'console',
  Freeform = 'freeform',
  Placement = 'placement',
  Rearrange = 'rearrange',
}

export enum SessionStatus {
  Active = 'active',
  Paused = 'paused',
  Ended = 'ended',
}

export enum OutputFormat {
  JSON = 'json',
  Markdown = 'markdown',
  XML = 'xml',
}

export enum AFSEventType {
  SessionStarted = 'session.started',
  SessionEnded = 'session.ended',
  SessionPaused = 'session.paused',
  SessionResumed = 'session.resumed',
  AnnotationCreated = 'annotation.created',
  AnnotationUpdated = 'annotation.updated',
  AnnotationDeleted = 'annotation.deleted',
  AnnotationResolved = 'annotation.resolved',
  ScreenshotCaptured = 'screenshot.captured',
  ActionRequested = 'action.requested',
  ActionCompleted = 'action.completed',
}
