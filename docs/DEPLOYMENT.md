# StudentOS — Deployment Guide

This document covers deploying StudentOS v1.0.0 to production.

---

## 1. Prerequisites

### 1.1 Required accounts & tools

| Item                        | Notes                                                |
| --------------------------- | ---------------------------------------------------- |
| Node.js 20+ or Bun 1.3+     | Bun recommended (faster install + runtime)           |
| Firebase project            | With Auth, Firestore, Storage, and Functions enabled |
| Vercel account (optional)   | For Next.js hosting                                  |
| Firebase Hosting (optional) | Alternative hosting with `output: 'standalone'`      |
| Domain + TLS certificate    | For production URL                                   |

### 1.2 Local environment

```bash
git clone <your-repo-url> studentos
cd studentos
bun install
cp .env.local.example .env.local
# Edit .env.local with your real Firebase credentials
```

---

## 2. Environment Variables

StudentOS uses the following environment variables. **All `NEXT_PUBLIC_*`
vars are exposed to the browser** — never put secrets in them.

### 2.1 Client-side (NEXT_PUBLIC_*)

```bash
# Firebase client config — from Firebase Console > Project Settings > SDK setup
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# App config
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=StudentOS

# Feature flags (optional — all default to true)
NEXT_PUBLIC_FEATURE_JUNOVA=true
NEXT_PUBLIC_FEATURE_EXAM_CENTER=true
NEXT_PUBLIC_FEATURE_NOTES=true
NEXT_PUBLIC_FEATURE_PLANNER=true
NEXT_PUBLIC_FEATURE_GROUPS=true
NEXT_PUBLIC_FEATURE_CAREER=true
NEXT_PUBLIC_FEATURE_SCHOLARSHIPS=true
NEXT_PUBLIC_FEATURE_FREELANCE=true
NEXT_PUBLIC_FEATURE_COMMUNITY=true
```

### 2.2 Server-side (NO NEXT_PUBLIC_ prefix)

```bash
# Firebase Admin SDK — from Firebase Console > Project Settings > Service Accounts
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AI providers (optional — only if you use a non-default provider)
OPENAI_API_KEY=...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=...
```

### 2.3 Validation

Run the env-validation script before deploying:

```bash
bun run scripts/validate-env.ts
```

This script exits non-zero if any required variable is missing or malformed.

---

## 3. Firebase Setup

### 3.1 Create the project

1. Go to <https://console.firebase.google.com> → **Add project**.
2. Enable **Authentication** → Sign-in methods → Email/Password + Google.
3. Enable **Cloud Firestore** (production mode).
4. Enable **Cloud Storage** (production mode).

### 3.2 Deploy security rules

```bash
# Install Firebase CLI if you don't have it
npm install -g firebase-tools
firebase login

# Deploy rules
firebase deploy --only firestore:rules,storage:rules
```

### 3.3 Deploy Firestore indexes

```bash
firebase deploy --only firestore:indexes
```

The `firestore.indexes.json` file defines all composite indexes required by
StudentOS queries.

### 3.4 Authorized domains

In Firebase Console → Authentication → Settings → Authorized domains, add:

- `localhost` (for dev)
- `your-domain.com`
- `your-project.vercel.app` (if using Vercel preview URLs)

---

## 4. Build

### 4.1 Local production build

```bash
bun run build
```

This produces a self-contained standalone build at `.next/standalone/`.

### 4.2 Verify build

```bash
# Type-check
bun run type-check

# Lint
bun run lint

# Tests
bun run test

# Full production build
bun run build
```

All four commands must exit 0 before deploying.

---

## 5. Deploy to Vercel

### 5.1 Connect the repo

1. Go to <https://vercel.com> → **New Project**.
2. Import your GitHub/GitLab repo.
3. Vercel auto-detects Next.js — accept the defaults.

### 5.2 Configure environment variables

In Vercel → Project Settings → Environment Variables, add **every** variable
from section 2 above. Set them for Production (and optionally Preview).

### 5.3 Deploy

```bash
git push origin main
```

Vercel auto-deploys on push to `main`. The build takes ~2-3 minutes.

### 5.4 Custom domain

Vercel → Project Settings → Domains → Add your domain. Update DNS records
as Vercel instructs.

---

## 6. Deploy to Firebase Hosting (alternative)

### 6.1 firebase.json

The included `firebase.json` is pre-configured for Next.js standalone
hosting. Verify:

```json
{
  "hosting": {
    "public": ".next/standalone/public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

### 6.2 Build + deploy

```bash
bun run build
firebase deploy --only hosting
```

---

## 7. Post-Deployment Checklist

### 7.1 Smoke tests (manual, ~10 minutes)

- [ ] Visit `/login` — page loads, form is interactive.
- [ ] Sign up with a test email — confirmation toast appears.
- [ ] Visit `/dashboard` — sidebar + header + widgets render.
- [ ] Open `/junova-ai` — teacher list loads, can create a teacher.
- [ ] Send a chat message — streaming response appears.
- [ ] Visit `/exam-center` — quiz generation works.
- [ ] Visit `/notes` — note creation works.
- [ ] Visit `/planner` — schedule generates.
- [ ] Visit `/community` — feed loads.
- [ ] Visit `/settings` — all settings tabs render.
- [ ] Test on mobile (Chrome devtools → responsive mode).
- [ ] Test offline mode: DevTools → Network → Offline → indicator shows.
- [ ] Test 404: visit `/nonexistent` — 404 page renders.

### 7.2 Monitoring

- [ ] Enable Vercel Analytics (or your preferred analytics).
- [ ] Set up Firebase Alerts for quota / auth anomalies.
- [ ] Set up error monitoring (Sentry, LogRocket, or Vercel's built-in).
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom).

### 7.3 Backups

- [ ] Schedule Firestore export (Cloud Scheduler + gcloud firestore export).
- [ ] Schedule Storage backup if you have user uploads.

### 7.4 Security

- [ ] Run `firebase deploy --only firestore:rules,storage:rules` again
      after any rule changes.
- [ ] Audit Firebase Console → Authentication → Users for any test accounts
      that should be removed.
- [ ] Review Firestore usage tab for unexpected reads/writes.
- [ ] Rotate `FIREBASE_PRIVATE_KEY` if it was ever committed to git.

---

## 8. Rollback

### Vercel

1. Vercel → Deployments → find the last known-good deployment.
2. Click the `...` menu → **Promote to Production**.

### Firebase Hosting

```bash
# List previous releases
firebase hosting:releases:list

# Roll back to a specific version
firebase hosting:rollback --release VERSION_ID
```

---

## 9. Troubleshooting

### Build fails with "lightningcss" error

If the build fails with a lightningcss native-module error on your CI host,
either (a) install the platform-specific lightningcss binary, or (b) keep
the stub alias in `next.config.ts`:

```ts
experimental: {
  turbopack: {
    resolveAlias: {
      lightningcss: require('path').resolve(
        __dirname,
        'node_modules/lightningcss-stub/index.js',
      ),
    },
  },
},
```

### "Unauthorized" on all API calls

The client is not sending the Firebase ID token. Verify:

- The user is logged in (`getAuth().currentUser` is not null).
- `authedFetch` is being used (not raw `fetch`).
- The ID token hasn't expired (the helper auto-refreshes, but a long-lived
  background tab can hit this).

### Firestore "permission-denied"

Check:

1. The user is authenticated.
2. The collection has a rule allowing the operation.
3. The document being written has `uid: request.auth.uid` (for owner-scoped
   collections).
4. Run `firebase deploy --only firestore:rules` to ensure latest rules are
   live.

---

_This document is part of StudentOS v1.0.0 release documentation._
