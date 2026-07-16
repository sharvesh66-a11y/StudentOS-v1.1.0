/**
 * StudentOS Domain-Agnostic Utilities
 *
 * This barrel file re-exports every utility so callers can do:
 *   import { formatDate, cn } from '@/utils'
 *
 * Rules for what belongs in `utils/` vs `lib/`:
 * - `utils/` — pure, framework-agnostic helpers (no React, no Firebase).
 * - `lib/`   — framework-aware infrastructure (cn, config, constants, db).
 */

export * from './format';
export * from './validation';
