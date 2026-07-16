import type { NextConfig } from 'next';
import path from 'path';
import { existsSync } from 'fs';

/**
 * StudentOS Next.js Configuration
 *
 * Notes:
 * - `output: 'standalone'` produces a self-contained production bundle for
 *   Firebase Hosting / containerized deployment.
 * - `reactStrictMode: true` surfaces side-effect bugs early in development.
 * - `typescript.ignoreBuildErrors: false` — build fails fast on type errors.
 * - `experimental.optimizePackageImports` enables per-module tree-shaking
 *   for icon/markdown/chart libraries that publish large barrel files.
 * - `images.remotePatterns` whitelists external hosts for `<Image>`.
 *
 * Turbopack + lightningcss note:
 *   lightningcss 1.30.2 loads a native binary via dynamic
 *   `require('lightningcss-${platform}-${arch}-${libc}')`. In some sandboxed
 *   environments Turbopack's ESM resolver can't resolve this pattern even
 *   when the native binary is present. We conditionally alias `lightningcss`
 *   to a pure-JS stub ONLY if the stub file exists. On Vercel/production
 *   where the native binary is resolvable, no alias is applied.
 */

const projectRoot = process.cwd();
const lightningcssStubPath = path.resolve(projectRoot, 'node_modules/lightningcss-stub/index.js');
const useLightningcssStub = existsSync(lightningcssStubPath);

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
      'react-markdown',
      'date-fns',
    ],
  },
  ...(useLightningcssStub
    ? {
        turbopack: {
          resolveAlias: {
            lightningcss: lightningcssStubPath,
          },
        },
      }
    : {}),
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
};

export default nextConfig;
