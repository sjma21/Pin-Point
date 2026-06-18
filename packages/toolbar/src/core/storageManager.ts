import type { Annotation } from '@sajalmishra/markpin-shared';

const PREFIX = 'pp_ann_';
const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_FALLBACK = 20; // items to keep when quota is exceeded

function urlKey(url: string): string {
  // Strip hash, trailing slash, then base64-encode for a safe key
  const normalized = url.replace(/#.*$/, '').replace(/\/+$/, '');
  return PREFIX + btoa(encodeURIComponent(normalized)).slice(0, 48);
}

function isExpired(a: Annotation): boolean {
  return Date.now() - new Date(a.createdAt).getTime() > EXPIRY_MS;
}

function trySet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (
      e instanceof DOMException &&
      (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      return false;
    }
    throw e;
  }
}

/** Persist annotations to localStorage for the given URL (defaults to current page). */
export function saveAnnotations(
  annotations: Annotation[],
  url = window.location.href,
): boolean {
  const key = urlKey(url);
  const fresh = annotations.filter(a => !isExpired(a));

  if (trySet(key, JSON.stringify(fresh))) return true;

  // Quota hit — keep only the most recent MAX_FALLBACK entries
  console.warn('[pinpoint] localStorage quota exceeded — trimming to last', MAX_FALLBACK);
  const trimmed = fresh.slice(-MAX_FALLBACK);
  return trySet(key, JSON.stringify(trimmed));
}

/** Load annotations for the given URL, automatically pruning expired entries. */
export function loadAnnotations(url = window.location.href): Annotation[] {
  const key = urlKey(url);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Annotation[];
    const fresh = parsed.filter(a => !isExpired(a));

    // Write back the pruned list so stale data doesn't accumulate
    if (fresh.length !== parsed.length) saveAnnotations(fresh, url);

    return fresh;
  } catch {
    return [];
  }
}

/** Remove a single annotation by ID. Returns false if the ID wasn't found. */
export function deleteAnnotation(id: string, url = window.location.href): boolean {
  const existing = loadAnnotations(url);
  const next = existing.filter(a => a.id !== id);
  if (next.length === existing.length) return false;
  saveAnnotations(next, url);
  return true;
}

/** Remove all annotations for the given URL. */
export function clearAnnotations(url = window.location.href): void {
  localStorage.removeItem(urlKey(url));
}

/** Nuke every key written by Pinpoint across all pages. */
export function clearAllPinpointData(): void {
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(PREFIX)) toRemove.push(k);
  }
  for (const k of toRemove) localStorage.removeItem(k);
}
