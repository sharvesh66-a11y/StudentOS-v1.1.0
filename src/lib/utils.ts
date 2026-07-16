import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * `cn` — Tailwind class combiner.
 *
 * Merges clsx (conditional classes) with tailwind-merge (dedupes conflicting
 * Tailwind utilities, last-write-wins). This is the single source of truth
 * for combining className strings across the entire StudentOS codebase.
 *
 * @example
 *   cn('px-2 py-1', condition && 'bg-primary', 'px-4') // → 'py-1 bg-primary px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
