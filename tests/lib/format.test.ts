/**
 * Unit tests for the pure formatting helpers in `src/utils/format.ts`.
 *
 * These are pure functions with no Firebase/React dependencies, so they can
 * be tested without any mocking.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  formatDate,
  formatRelativeTime,
  formatNumber,
  formatCompact,
  formatPercent,
  formatDuration,
  truncate,
  slugify,
  getInitials,
} from '@/utils/format';

describe('formatDate', () => {
  it('formats an ISO date string with default options', () => {
    expect(formatDate('2026-07-09')).toBe('Jul 9, 2026');
  });

  it('accepts a Date object', () => {
    expect(formatDate(new Date('2026-01-15T00:00:00Z'))).toMatch(/Jan 1[45], 2026/);
  });

  it('returns "—" for invalid date strings', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('returns "—" for invalid Date objects', () => {
    expect(formatDate(new Date('invalid'))).toBe('—');
  });

  it('respects custom Intl options', () => {
    const out = formatDate('2026-07-09', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(out).toMatch(/Thursday, July 9, 2026/);
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    // Pin "now" so assertions are deterministic.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-09T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "—" for an invalid date', () => {
    expect(formatRelativeTime('garbage')).toBe('—');
  });

  it('returns "now" or "in 0 seconds" for the current time', () => {
    const out = formatRelativeTime(new Date());
    expect(out).toMatch(/^(now|in 0 seconds|0 seconds ago)$/);
  });

  it('describes a date 3 days in the past as "3 days ago"', () => {
    expect(formatRelativeTime('2026-07-06T12:00:00Z')).toBe('3 days ago');
  });

  it('describes a date 2 hours in the future as "in 2 hours"', () => {
    expect(formatRelativeTime('2026-07-09T14:00:00Z')).toBe('in 2 hours');
  });

  it('describes a date 5 minutes in the past as "5 minutes ago"', () => {
    expect(formatRelativeTime('2026-07-09T11:55:00Z')).toBe('5 minutes ago');
  });
});

describe('formatNumber', () => {
  it('adds thousands separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('returns "—" for non-finite numbers', () => {
    expect(formatNumber(Number.NaN)).toBe('—');
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('—');
  });

  it('respects custom options', () => {
    expect(formatNumber(0.5, { style: 'currency', currency: 'USD' })).toBe('$0.50');
  });
});

describe('formatCompact', () => {
  it('formats large numbers compactly', () => {
    expect(formatCompact(1234567)).toBe('1.2M');
  });

  it('formats thousands with K', () => {
    expect(formatCompact(2500)).toBe('2.5K');
  });

  it('returns "—" for non-finite numbers', () => {
    expect(formatCompact(Number.NaN)).toBe('—');
  });
});

describe('formatPercent', () => {
  it('formats a fraction as a percentage', () => {
    expect(formatPercent(0.875)).toBe('87.5%');
  });

  it('respects fractionDigits', () => {
    expect(formatPercent(0.87555, 2)).toBe('87.56%');
  });

  it('returns "—" for non-finite numbers', () => {
    expect(formatPercent(Number.NaN)).toBe('—');
  });
});

describe('formatDuration', () => {
  it('formats seconds as mm:ss', () => {
    expect(formatDuration(75)).toBe('01:15');
  });

  it('formats hours as hh:mm:ss', () => {
    expect(formatDuration(3661)).toBe('01:01:01');
  });

  it('returns 00:00 for negative or non-finite inputs', () => {
    expect(formatDuration(-1)).toBe('00:00');
    expect(formatDuration(Number.NaN)).toBe('00:00');
  });

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('00:00');
  });
});

describe('truncate', () => {
  it('returns the string unchanged if shorter than max', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and appends the ellipsis', () => {
    // max=5, suffix='…' (length 1) → slice(0, 4) + '…' = 'hell…'
    expect(truncate('hello world', 5)).toBe('hell…');
  });

  it('supports a custom suffix', () => {
    expect(truncate('hello world', 8, '...')).toBe('hello...');
  });

  it('handles max = 0 by returning just the suffix', () => {
    expect(truncate('hello', 0)).toBe('…');
  });
});

describe('slugify', () => {
  it('lowercases and replaces spaces with dashes', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('collapses multiple separators', () => {
    expect(slugify('  multiple   spaces  ')).toBe('multiple-spaces');
  });

  it('strips non-word characters', () => {
    expect(slugify('Math & Science!!!')).toBe('math-science');
  });
});

describe('getInitials', () => {
  it('returns initials for a two-word name', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL');
  });

  it('returns at most 2 initials', () => {
    expect(getInitials('John Ronald Reuel Tolkien')).toBe('JR');
  });

  it('returns a single initial for a one-word name', () => {
    expect(getInitials('Plato')).toBe('P');
  });

  it('returns empty string for an empty input', () => {
    expect(getInitials('')).toBe('');
  });

  it('trims leading/trailing whitespace before splitting', () => {
    expect(getInitials('  Grace Hopper  ')).toBe('GH');
  });
});
