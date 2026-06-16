export type ToolbarEventType =
  | 'annotationAdded'
  | 'annotationDeleted'
  | 'annotationUpdated'
  | 'annotationsCleared'
  | 'annotationResolved'
  | 'annotationAcknowledged'
  | 'annotationReplied'
  | 'modeChanged'
  | 'settingsChanged'
  | 'animationsPaused'
  | 'animationsResumed'
  | 'markersToggled'
  | 'sessionCreated';

// biome-ignore lint: handler data is genuinely dynamic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler<T = any> = (data: T) => void;

// biome-ignore lint: event map is dynamic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _listeners = new Map<ToolbarEventType, Set<Handler<any>>>();

export function subscribe<T>(event: ToolbarEventType, handler: Handler<T>): void {
  let bucket = _listeners.get(event);
  if (!bucket) {
    bucket = new Set();
    _listeners.set(event, bucket);
  }
  bucket.add(handler);
}

export function unsubscribe<T>(event: ToolbarEventType, handler: Handler<T>): void {
  _listeners.get(event)?.delete(handler);
}

export function emit<T>(event: ToolbarEventType, data: T): void {
  _listeners.get(event)?.forEach(handler => {
    try {
      handler(data);
    } catch (err) {
      console.error(`[pinpoint:eventBus] error in handler for "${event}":`, err);
    }
  });
}

export function once<T>(event: ToolbarEventType, handler: Handler<T>): void {
  const wrapper: Handler<T> = (data) => {
    unsubscribe(event, wrapper);
    handler(data);
  };
  subscribe(event, wrapper);
}

export function clearAllListeners(): void {
  _listeners.clear();
}
