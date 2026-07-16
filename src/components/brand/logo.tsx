/**
 * StudentOS Logo Component
 *
 * Renders the StudentOS logo as an inline SVG. Supports multiple sizes and
 * variants. Uses the brand purple→blue gradient.
 *
 * Usage:
 *   <Logo size="sm" />
 *   <Logo size="lg" showWordmark />
 *
 * @see public/logo.svg — canonical SVG asset
 */

import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';

export interface LogoProps {
  /** Visual size. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Show the "StudentOS" wordmark next to the icon. */
  showWordmark?: boolean;
  /** Additional classes. */
  className?: string;
}

const SIZE_MAP: Record<NonNullable<LogoProps['size']>, { icon: number; text: string }> = {
  xs: { icon: 20, text: 'text-xs' },
  sm: { icon: 24, text: 'text-sm' },
  md: { icon: 32, text: 'text-base' },
  lg: { icon: 40, text: 'text-lg' },
  xl: { icon: 56, text: 'text-2xl' },
};

export function Logo({ size = 'md', showWordmark = false, className }: LogoProps) {
  const dims = SIZE_MAP[size];

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        width={dims.icon}
        height={dims.icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="sos-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="sos-logo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#sos-logo-grad)" />
        <g filter="url(#sos-logo-glow)">
          <path
            d="M 44 22 A 12 12 0 0 0 32 20 A 10 10 0 0 0 22 28"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.95"
          />
          <path
            d="M 20 42 A 12 12 0 0 0 32 44 A 10 10 0 0 0 42 36"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.95"
          />
          <circle cx="32" cy="32" r="4" fill="white" />
          <circle cx="22" cy="28" r="2" fill="white" opacity="0.7" />
          <circle cx="42" cy="36" r="2" fill="white" opacity="0.7" />
          <line x1="22" y1="28" x2="32" y2="32" stroke="white" strokeWidth="1" opacity="0.4" />
          <line x1="42" y1="36" x2="32" y2="32" stroke="white" strokeWidth="1" opacity="0.4" />
        </g>
      </svg>
      {showWordmark && (
        <span className={cn('font-bold tracking-tight', dims.text)}>{APP_NAME}</span>
      )}
    </span>
  );
}
