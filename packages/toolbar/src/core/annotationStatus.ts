import { AnnotationStatus } from '@sajalmishra/markpin-shared';

const TERMINAL = new Set<string>([
  AnnotationStatus.Resolved,
  AnnotationStatus.Dismissed,
  AnnotationStatus.WontFix,
]);

/** Statuses that should show a marker pin on the page. */
export function isPendingMarkerStatus(status: string): boolean {
  return !TERMINAL.has(status);
}

/** Resolved, dismissed, or won't-fix — remove from the live toolbar. */
export function isTerminalStatus(status: string): boolean {
  return TERMINAL.has(status);
}
