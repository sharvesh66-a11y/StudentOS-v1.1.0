'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ProvidersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[StudentOS/providers] Route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-foreground text-2xl font-bold">Failed to load AI Providers</h1>
      <p className="text-muted-foreground">We couldn&apos;t load this page. Please try again.</p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
