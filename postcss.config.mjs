// Tailwind v4 PostCSS integration.
//
// This config uses the string form `['@tailwindcss/postcss']` which is
// accepted by Next.js 16 webpack (when building with `--webpack` flag).
//
// For Turbopack (default) and Vitest, we use the function-call form via
// the `VITEST` env var check. Turbopack's PostCSS loader and Vitest's
// Vite-based loader both reject the string form but accept the function form.
//
// StudentOS builds with webpack by default (see `next build --webpack` in
// package.json `build` script) because Turbopack has a known issue with
// `@tailwindcss/node/dist/esm-cache.loader.mjs` resolution in sandboxed
// environments.
import tailwindcss from '@tailwindcss/postcss';

const isVitest = !!process.env.VITEST;

const config = {
  plugins: isVitest
    ? // Vitest (Vite) function form
      [tailwindcss()]
    : // Next.js webpack string form
      ['@tailwindcss/postcss'],
};

export default config;
