/**
 * Formatting Utilities
 *
 * Pure functions for formatting dates, numbers, strings, and durations.
 * No side effects, no dependencies on React or Firebase.
 */

/**
 * Format an ISO date string (or Date) as a human-readable date.
 * @example formatDate('2026-07-09') → 'Jul 9, 2026'
 */
export function formatDate(
  input: string | Date,
  opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', opts).format(date);
}

/**
 * Format an ISO date string as a relative time (e.g. "3 days ago").
 * @example formatRelativeTime('2026-07-06') → '3 days ago'
 */
export function formatRelativeTime(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '—';
  const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });
  const diff = date.getTime() - Date.now();
  const absDiff = Math.abs(diff);

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
    ['second', 1000],
  ];

  for (const [unit, msPerUnit] of units) {
    if (absDiff >= msPerUnit || unit === 'second') {
      return rtf.format(Math.round(diff / msPerUnit), unit);
    }
  }
  return 'just now';
}

/**
 * Format a number with thousands separators.
 * @example formatNumber(1234567) → '1,234,567'
 */
export function formatNumber(value: number, opts?: Intl.NumberFormatOptions): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', opts).format(value);
}

/**
 * Format a number as a compact abbreviation (1.2K, 3.4M).
 * @example formatCompact(1234567) → '1.2M'
 */
export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  );
}

/**
 * Format a number as a percentage.
 * @example formatPercent(0.875) → '87.5%'
 */
export function formatPercent(value: number, fractionDigits = 1): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * Convert a duration in seconds to a mm:ss or hh:mm:ss string.
 * @example formatDuration(75) → '01:15'
 */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '00:00';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/**
 * Truncate a string to `max` characters, appending an ellipsis if cut.
 * @example truncate('Hello world', 5) → 'He…'
 */
export function truncate(value: string, max: number, suffix = '…'): string {
  if (value.length <= max) return value;
  return value.slice(0, Math.max(0, max - suffix.length)) + suffix;
}

/**
 * Convert a string to a URL-friendly slug.
 * @example slugify('Hello, World!') → 'hello-world'
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Return initials from a name (max 2 chars).
 * @example getInitials('Ada Lovelace') → 'AL'
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
