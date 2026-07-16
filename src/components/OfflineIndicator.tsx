'use client';

import { useSyncExternalStore } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * StudentOS Offline Indicator
 *
 * Renders a small floating banner at the bottom of the screen whenever the
 * browser reports `navigator.onLine === false`. Subscribes to the `online` /
 * `offline` window events via `useSyncExternalStore` so the banner appears
 * and disappears in real time as the network status changes.
 *
 * Mounted once at the root layout so it shows on every page.
 */

function subscribe(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot(): boolean {
  return !navigator.onLine;
}

function getServerSnapshot(): boolean {
  // Server-side render: assume online. The client snapshot will correct this
  // on hydration if the browser is actually offline.
  return false;
}

export function OfflineIndicator() {
  const isOffline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-amber-500/90 px-4 py-2 text-sm text-white shadow-lg backdrop-blur"
    >
      <span className="flex items-center gap-2">
        <WifiOff className="h-4 w-4" aria-hidden="true" />
        You&apos;re offline. Some features may be unavailable.
      </span>
    </div>
  );
}
