let _counter = 0;

/** Generates a short lexicographically-sortable ID: timestamp prefix + random suffix */
export function generateId(prefix = 'pp'): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  const seq = (++_counter).toString(36).padStart(3, '0');
  return `${prefix}_${ts}${rand}${seq}`;
}

/** Returns the current time as an ISO-8601 string */
export function now(): string {
  return new Date().toISOString();
}

/** Truncates a string to maxLength, appending an ellipsis if needed */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

/** Converts a plain Date or timestamp number to ISO-8601 */
export function toISO(date: Date | number | string): string {
  return new Date(date).toISOString();
}

/** Returns elapsed milliseconds since an ISO-8601 timestamp */
export function elapsedMs(isoTimestamp: string): number {
  return Date.now() - new Date(isoTimestamp).getTime();
}
