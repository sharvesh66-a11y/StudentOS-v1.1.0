import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * StudentOS ESLint Configuration
 *
 * Layered config:
 *   1. Next.js core-web-vitals (performance + a11y rules)
 *   2. Next.js TypeScript rules
 *   3. Prettier integration (formatting as lint errors)
 *   4. Project-specific overrides
 *   5. Ignore patterns
 *
 * Note: Several strict TypeScript/React rules are relaxed here because the
 * StudentOS codebase will rely on Prettier for formatting and the team's
 * own review process for code quality. They can be tightened in Sprint 1.3.
 */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettierPlugin,
  prettierConfig,
  {
    rules: {
      // Formatting (delegated to Prettier)
      'prettier/prettier': 'warn',

      // TypeScript rules — relaxed for Sprint 1.x, will tighten progressively
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/prefer-as-const': 'off',
      '@typescript-eslint/no-unused-disable-directive': 'off',

      // React rules
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/purity': 'off',
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
      'react/prop-types': 'off',
      'react-compiler/react-compiler': 'off',

      // Next.js rules
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'off',

      // General JavaScript rules
      'prefer-const': 'warn',
      'no-unused-vars': 'off',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'warn',
      'no-empty': 'warn',
      'no-irregular-whitespace': 'error',
      'no-case-declarations': 'off',
      'no-fallthrough': 'error',
      'no-mixed-spaces-and-tabs': 'error',
      'no-redeclare': 'error',
      'no-undef': 'off',
      'no-unreachable': 'error',
      'no-useless-escape': 'warn',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'next-env.d.ts',
      'examples/**',
      'skills/**',
      'apps/**',
      'packages/**',
      'download/**',
      '.zscripts/**',
      'dev.log',
      'server.log',
      '*.config.mjs',
      '*.config.ts',
      // CLI scripts that intentionally use console.log for user-facing output
      'scripts/**',
    ],
  },
];

export default eslintConfig;
