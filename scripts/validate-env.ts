#!/usr/bin/env node
/**
 * StudentOS Environment Variable Validator
 *
 * Run before deploying: `bun run scripts/validate-env.ts`
 *
 * Exits non-zero if any required variable is missing or malformed.
 * This script is also called by CI before the production build.
 */

import { config } from 'dotenv';
import { existsSync } from 'fs';

// Load .env.local if it exists (dev), otherwise rely on process.env (CI/prod)
if (existsSync('.env.local')) {
  config({ path: '.env.local' });
}

interface EnvVarSpec {
  name: string;
  required: boolean;
  pattern?: RegExp;
  description: string;
  /** If true, the value is masked in output (for secrets). */
  secret?: boolean;
}

const CLIENT_VARS: EnvVarSpec[] = [
  {
    name: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    required: true,
    description: 'Firebase Web API key (from Project Settings > SDK setup)',
    secret: false,
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    required: true,
    pattern: /^[a-z0-9-]+\.firebaseapp\.com$/,
    description: 'Firebase auth domain (e.g. studentos.firebaseapp.com)',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    required: true,
    pattern: /^[a-z0-9-]+$/,
    description: 'Firebase project ID',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    required: true,
    pattern: /^[a-z0-9-]+\.appspot\.com$/,
    description: 'Firebase Storage bucket (e.g. studentos.appspot.com)',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    required: true,
    pattern: /^\d+$/,
    description: 'Firebase messaging sender ID (numeric)',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_APP_ID',
    required: true,
    pattern: /^[0-9]+:[A-Za-z0-9_-]+$/,
    description: 'Firebase app ID (e.g. 1:1234:web:abcd)',
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    pattern: /^https?:\/\/.+/,
    description: 'Public app URL (e.g. https://studentos.app)',
  },
  {
    name: 'NEXT_PUBLIC_APP_NAME',
    required: false,
    description: 'App display name (defaults to "StudentOS")',
  },
];

const SERVER_VARS: EnvVarSpec[] = [
  {
    name: 'FIREBASE_PROJECT_ID',
    required: true,
    pattern: /^[a-z0-9-]+$/,
    description: 'Firebase project ID (server-side)',
  },
  {
    name: 'FIREBASE_CLIENT_EMAIL',
    required: true,
    pattern: /^firebase-adminsdk-[a-z0-9-]+@[a-z0-9-]+\.iam\.gserviceaccount\.com$/,
    description: 'Firebase Admin SDK service account email',
  },
  {
    name: 'FIREBASE_PRIVATE_KEY',
    required: true,
    pattern: /-----BEGIN PRIVATE KEY-----/,
    description: 'Firebase Admin SDK private key (PEM format)',
    secret: true,
  },
];

const OPTIONAL_PROVIDER_KEYS = [
  'OPENAI_API_KEY',
  'GEMINI_API_KEY',
  'ANTHROPIC_API_KEY',
  'XAI_API_KEY',
  'DEEPSEEK_API_KEY',
  'GLM_API_KEY',
];

function mask(value: string): string {
  if (value.length <= 8) return '***';
  return value.slice(0, 4) + '...' + value.slice(-4);
}

function validate(spec: EnvVarSpec): string[] {
  const errors: string[] = [];
  const value = process.env[spec.name];

  if (value === undefined || value === '') {
    if (spec.required) {
      errors.push(`❌ ${spec.name} is missing — ${spec.description}`);
    } else {
      console.log(`  ⚪ ${spec.name} not set (optional)`);
    }
    return errors;
  }

  if (spec.pattern && !spec.pattern.test(value)) {
    errors.push(`❌ ${spec.name} is malformed — expected ${spec.description}`);
    errors.push(`   Got: ${spec.secret ? mask(value) : value}`);
    return errors;
  }

  console.log(`  ✅ ${spec.name} = ${spec.secret ? mask(value) : value}`);
  return errors;
}

function main(): number {
  console.log('\n=== StudentOS Environment Validation ===\n');

  console.log('Client-side variables:');
  let errors: string[] = [];
  for (const spec of CLIENT_VARS) {
    errors = errors.concat(validate(spec));
  }

  console.log('\nServer-side variables:');
  for (const spec of SERVER_VARS) {
    errors = errors.concat(validate(spec));
  }

  console.log('\nOptional AI provider keys (any subset):');
  let anyProvider = false;
  for (const key of OPTIONAL_PROVIDER_KEYS) {
    if (process.env[key]) {
      console.log(`  ✅ ${key} = ${mask(process.env[key]!)}`);
      anyProvider = true;
    }
  }
  if (!anyProvider) {
    console.log('  ⚪ No optional provider keys set — default ZAI provider will be used.');
  }

  console.log('\n=== Result ===');
  if (errors.length > 0) {
    console.error(`\n❌ ${errors.length} error(s) found:\n`);
    errors.forEach((e) => console.error('  ' + e));
    console.error('\nFix the above errors before deploying.');
    return 1;
  }

  console.log('✅ All required environment variables are present and valid.\n');
  return 0;
}

process.exit(main());
