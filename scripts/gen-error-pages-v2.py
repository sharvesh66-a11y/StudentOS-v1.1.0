#!/usr/bin/env python3
"""Generate missing error.tsx and loading.tsx for new StudentOS routes."""
from pathlib import Path

ROUTES = {
    "pdf-ai": "PDF AI",
    "flashcards": "Flashcards",
    "providers": "AI Providers",
    "profile": "Profile",
}


def to_pascal(slug: str) -> str:
    return "".join(p.capitalize() for p in slug.split("-"))


def error_text(pascal: str, slug: str, label: str) -> str:
    return f"""'use client';

import {{ useEffect }} from 'react';
import {{ Button }} from '@/components/ui/button';

export default function {pascal}Error({{
  error,
  reset,
}}: {{
  error: Error & {{ digest?: string }};
  reset: () => void;
}}) {{
  useEffect(() => {{
    console.error('[StudentOS/{slug}] Route error:', error);
  }}, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-foreground text-2xl font-bold">Failed to load {label}</h1>
      <p className="text-muted-foreground">We couldn&apos;t load this page. Please try again.</p>
      <Button onClick={{reset}}>Retry</Button>
    </div>
  );
}}
"""


def loading_text(pascal: str) -> str:
    return f"""import {{ Skeleton }} from '@/components/ui/skeleton';

export default function {pascal}Loading() {{
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  );
}}
"""


base = Path("/home/z/my-project/src/app/(app)")
for slug, label in ROUTES.items():
    pascal = to_pascal(slug)
    d = base / slug
    if not d.exists():
        continue

    err_path = d / "error.tsx"
    if not err_path.exists():
        err_path.write_text(error_text(pascal, slug, label))
        print(f"Created: {err_path}")

    load_path = d / "loading.tsx"
    if not load_path.exists():
        load_path.write_text(loading_text(pascal))
        print(f"Created: {load_path}")

print("Done.")
