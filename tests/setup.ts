/**
 * StudentOS Vitest Test Setup
 *
 * - Registers jest-dom matchers (`toBeInTheDocument`, `toHaveAttribute`, etc.)
 * - Cleans up the DOM between tests
 * - Polyfills browser globals jsdom doesn't implement
 *   (IntersectionObserver, ResizeObserver, matchMedia, clipboard)
 * - Mocks `next/navigation` and `next-themes` so client components can render
 *   in the test environment without a Next.js runtime
 * - Suppresses cosmetic React 18+ `act()` warnings
 */
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup DOM between tests
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver (not available in jsdom)
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn();
}
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock navigator.clipboard — `@testing-library/user-event` redefines this
// property when `userEvent.setup()` is called, so it MUST be configurable.
// In modern jsdom, `navigator.clipboard` exists but is not configurable by
// default — we replace it with a configurable stub.
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
  configurable: true,
});

// Mock window.scrollTo — jsdom doesn't implement it
if (!window.scrollTo) {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
}

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn(), resolvedTheme: 'dark' }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Suppress React 18+ act warnings in tests (cosmetic)
const originalError = console.error;
console.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('not wrapped in act')) {
    return;
  }
  originalError.call(console, ...args);
};
