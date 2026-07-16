/**
 * Unit tests for `cn` className combiner (clsx + tailwind-merge).
 */
import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('joins plain string classes', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('returns an empty string for no inputs', () => {
    expect(cn()).toBe('');
  });

  it('skips falsy values (false, null, undefined, 0)', () => {
    expect(cn('a', false, null, undefined, 0, 'b')).toBe('a b');
  });

  it('handles conditional objects', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active');
  });

  it('handles arrays of classes', () => {
    expect(cn('base', ['px-2', ['py-1']])).toBe('base px-2 py-1');
  });

  it('dedupes conflicting Tailwind utilities (last-write-wins)', () => {
    // px-2 then px-4 — tailwind-merge should keep only the latter.
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('preserves non-conflicting utilities during dedup', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('respects conditional overrides', () => {
    expect(cn('px-2', false && 'px-4', 'px-6')).toBe('px-6');
  });

  it('handles the canonical @example from the source', () => {
    // From the JSDoc: cn('px-2 py-1', condition && 'bg-primary', 'px-4')
    // → 'py-1 bg-primary px-4' when condition is true.
    expect(cn('px-2 py-1', true && 'bg-primary', 'px-4')).toBe('py-1 bg-primary px-4');
  });

  it('merges responsive variants correctly', () => {
    expect(cn('px-2', 'md:px-4')).toBe('px-2 md:px-4');
  });

  it('handles variant conflicts across breakpoints', () => {
    // sm:px-2 and sm:px-4 conflict at the sm: breakpoint.
    expect(cn('sm:px-2', 'sm:px-4')).toBe('sm:px-4');
  });
});
