#!/usr/bin/env bash
# Generates per-route error.tsx and loading.tsx for all StudentOS feature routes
# that don't already have them. Idempotent — skips existing files.

set -euo pipefail
cd /home/z/my-project

# Map of route-slug → human-readable label
declare -A ROUTES=(
  [ai-tools]="AI Tools"
  [career-planner]="Career Planner"
  [freelancing]="Freelancing Hub"
  [progress]="Progress Analytics"
  [scholarship-finder]="Scholarship Finder"
  [settings]="Settings"
  [study-groups]="Study Groups"
  [dashboard]="Dashboard"
)

for slug in "${!ROUTES[@]}"; do
  label="${ROUTES[$slug]}"
  dir="src/app/(app)/$slug"
  mkdir -p "$dir"

  # ---- error.tsx ----
  if [ ! -f "$dir/error.tsx" ]; then
    cat > "$dir/error.tsx" <<EOF
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ${slug//-/}Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[StudentOS/$slug] Route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-foreground text-2xl font-bold">Failed to load ${label}</h1>
      <p className="text-muted-foreground">
        We couldn&apos;t load this page. Please try again.
      </p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
EOF
    echo "Created: $dir/error.tsx"
  fi

  # ---- loading.tsx ----
  if [ ! -f "$dir/loading.tsx" ]; then
    cat > "$dir/loading.tsx" <<EOF
import { Skeleton } from '@/components/ui/skeleton';

export default function ${slug//-/}Loading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  );
}
EOF
    echo "Created: $dir/loading.tsx"
  fi
done

echo "---"
echo "Done. Re-run lint + type-check to verify."
