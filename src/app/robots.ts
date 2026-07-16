import type { MetadataRoute } from 'next';

/**
 * StudentOS robots.ts
 *
 * In test mode (STUDENTOS_TEST_MODE=1), returns a noindex rule that
 * disallows all crawlers. In production, replace with per-route allow
 * rules + a sitemap URL.
 */
export default function robots(): MetadataRoute.Robots {
  const isTestMode = process.env.STUDENTOS_TEST_MODE === '1';

  if (isTestMode) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/sitemap.xml`,
  };
}
