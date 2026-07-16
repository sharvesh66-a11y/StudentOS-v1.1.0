# StudentOS — Changelog

All notable changes to StudentOS are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-07-13

### Release — Production-Ready

StudentOS v1.0.0 is the first stable production release. All 13 sprints are
complete, all tests pass, and the build is green.

### Sprint 13.0 — Testing, Optimization & Production Readiness

#### Added

- **Vitest test suite** — 314 tests across 23 files covering unit, integration,
  component, service, hook, and end-to-end flows. Coverage includes utils,
  Firebase helpers, error handling, auth, Junova AI providers, exam quizzes,
  planner schedule engine, community service, settings service, and auth flow.
- **API authentication layer** — `src/lib/api-auth.ts` shared helper that
  verifies Firebase ID tokens on every server-side API route. All 12 user-
  scoped API routes now require a valid `Authorization: Bearer <token>` header.
- **Client-side auth fetch** — `src/lib/api-client.ts` exports `authedFetch()`
  which injects the current user's ID token into every API call from client
  hooks. 16 call sites across 13 hook/view files updated.
- **Zod validation** on every API route — request bodies are validated before
  processing; malformed requests return 400 with structured error details.
- **Security audit report** — `docs/SECURITY_AUDIT.md` documenting 18 findings
  (1 Critical, 4 High, 5 Medium, 3 Low, 5 Info) with file:line references and
  remediations.
- **Firestore rules hardening** — 47 missing collection rules added. Every
  user-scoped collection now enforces `request.auth.uid == resource.data.uid`.
- **Per-route error/loading pages** — every feature route now has its own
  `error.tsx` and `loading.tsx` for graceful failure recovery.
- **Offline indicator** — `OfflineIndicator` component shows a banner when
  the user loses network connectivity.
- **Global focus-visible styles** — `:focus-visible` outline in `globals.css`
  ensures keyboard users see focus rings on every interactive element.
- **Skip-to-content link** — keyboard users can now skip directly to main
  content from any page.
- **ARIA labels** — 30+ icon-only buttons and 40+ form controls across 19
  files now have accessible names.
- **Deployment documentation** — `docs/DEPLOYMENT.md` covers environment
  variables, Vercel/Firebase Hosting deployment, and post-deploy checklist.

#### Changed

- `next.config.ts` — `typescript.ignoreBuildErrors` flipped from `true` to
  `false` so the build fails fast on type regressions.
- `experimental.optimizePackageImports` extended to include `recharts`,
  `react-markdown`, and `date-fns` for better tree-shaking.
- `images.remotePatterns` whitelists `lh3.googleusercontent.com` and
  `firebasestorage.googleapis.com` for next/image optimization.
- 12 feature route pages now use `next/dynamic` with `ssr: false` and
  Skeleton fallbacks to reduce initial bundle size.
- 5 list-item components (`NoteCard`, `PostCard`, `TeacherCard`, etc.) wrapped
  with `React.memo` for stable re-renders.
- 4 sequential Firestore loops parallelised with `Promise.all` (community
  leave/unfollow, group leave/transfer, planner session creation).
- API error responses now sanitize `err.message` in production — clients
  receive a generic "Internal server error" instead of stack-trace details.
- API routes use the verified `auth.uid` from the Firebase ID token instead
  of trusting the client-sent `body.uid` (IDOR fix).

#### Fixed

- 100 ESLint warnings — unused imports, unused destructured locals, unused
  function parameters, and unused assigned variables cleaned up across 44
  files.
- 2 `react-hooks/incompatible-library` warnings on react-hook-form `watch()`
  calls in login/signup pages suppressed with inline eslint-disable comments.
- `next.config.ts` TypeScript error on `turbopack` key — conditionally spread
  only in non-production environments.
- Next.js 16 build failure on `useSearchParams()` in login/signup — wrapped
  in `<Suspense>` boundary.

---

## [0.7.0] — 2026-07-12

### Sprint 12.0 — Settings & Personalization (intermediate release)

#### Added

- Full Settings module: account, personalization, notifications, privacy,
  accessibility, AI preferences, storage, and about sections.
- `UserSettings` type with 40+ configurable fields.
- Settings service with Firestore persistence under `user_settings/{uid}`.
- Premium subscription module with 3-tier plans (Free / Pro / Premium).
- 8-provider AI registry (ZAI default + OpenAI / Gemini / Claude / Grok /
  DeepSeek / GLM-4 / Local).
- 12 AI tools (summarizer, translator, paraphraser, etc.) under `tools/{uid}`.
- Tool usage tracking with daily/monthly limits per subscription tier.

---

## [0.6.0] — 2026-07-11

### Sprints 7.0 — 11.0 + Phase 7 + Phase 8

#### Added

- **Sprint 7.0 — Study Groups:** Realtime group chat (Firestore onSnapshot),
  member roles (owner/admin/member), study sessions, file sharing, group
  notifications.
- **Sprint 8.0 — Career Planner:** AI career counselor, goals/milestones,
  skill tracking, college planning, timeline view.
- **Sprint 9.0 — Scholarship Finder:** AI scholarship recommendations,
  application tracking, scholarship profiles, deadline reminders.
- **Sprint 10.0 — Student Freelancing:** Job marketplace, AI proposal
  generator, project management, portfolio, earnings tracking.
- **Sprint 11.0 — Student Community:** Social feed, 5 reaction types,
  comments, communities, follow system, AI post generation.
- **Phase 7 — Progress Analytics + Gamification:** Analytics dashboard,
  XP/level/achievements/badges, daily streak, weekly challenges.
- **Phase 8 — AI Tools + Advanced:** 12 AI tools, 8-provider AI registry,
  3-tier premium subscription, user settings.

---

## [0.5.0] — 2026-07-10

### Sprints 5.0 — 6.0

#### Added

- **Sprint 5.0 — Exam Center:** AI quiz generator with 5 question types
  (multiple choice, true/false, short answer, fill-in-blank, matching),
  practice mode, instant scoring, explanation per question.
- **Sprint 5.1 — Mistake Analysis:** Wrong-answer topics fed back into
  Junova memory as "weak topics" for personalized review.
- **Sprint 6.0 — Notes Hub:** AI note generation, flashcards, doubt solver,
  copy/archive/export, folder organization.

---

## [0.4.0] — 2026-07-09

### Junova AI Phases 1 — 4

#### Added

- **Phase 1 (4.0-4.3):** AI Teacher CRUD, Teacher DNA (11 personality
  traits), streaming chat (SSE), Markdown rendering with code highlighting,
  voice input (Web Speech API).
- **Phase 2 (4.4):** Long-term memory under `junova_memory/{uid}` — strong
  topics, weak topics, learning style, study preferences. AI recommendations
  generated from memory + teacher activity.
- **Phase 3 (4.5):** Voice teacher (STT input + TTS output), animated
  teacher avatar (CSS keyframes), whiteboard component, classroom layout
  with multiple panels.
- **Phase 4 (4.6):** Smart study planner — schedule engine, goals, reminders,
  spaced-repetition revisions, daily/weekly views.

---

## [0.3.0] — 2026-07-08

### Sprint 3.0 — Dashboard Foundation

#### Added

- App Shell (sidebar + header + content area).
- Desktop sidebar with all module entries + sprint badges.
- Mobile drawer navigation (shadcn Sheet).
- Sticky header (mobile menu, search, notifications, avatar).
- Welcome Header (time-based greeting + quick stats).
- User Profile Card (avatar, name, level/XP bar, streak).
- Quick Actions grid (6 action shortcuts).
- Recent Activity feed.
- Upcoming Deadlines widget.
- 8 placeholder module routes for upcoming sprints.

---

## [0.2.0] — 2026-07-07

### Sprint 2.0 — Authentication

#### Added

- Email/password sign up + login + logout.
- Forgot password flow (Firebase reset email).
- Session persistence (local + session strategies) + "Remember me".
- Protected routes (`<ProtectedRoute>`) + Authentication middleware.
- Auth Provider + Context + Hooks + Service.
- Loading states (button spinners, route-guard loader).
- Form validation (Zod schemas + React Hook Form).
- Toast notifications (Sonner).
- OAuth buttons (Google wired up).
- Password strength meter.
- Open-redirect protection (`sanitizeRedirect`).

---

## [0.1.0] — 2026-07-06

### Sprints 1.1 — 1.2 — Project Foundation

#### Added

- **1.1:** Next.js 16 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui scaffolding.
  Modular folder structure. ESLint + Prettier. Import aliases. Shared utils
  (`cn`, `formatDate`, `formatRelativeTime`, `validateEmail`). Shared types
  (branded IDs, API response envelopes, async state). StudentOS dark theme
  (purple + blue, oklch color space).
- **1.2:** Firebase SDK installed and initialized (client + admin). Firestore
  - Storage security rules. Composite indexes. Firebase emulators config.
    Centralized error handler (`normalizeFirebaseError`). Reusable Firestore
    helpers (8 CRUD primitives). Reusable Storage helpers (upload, download,
    delete, validate).

---

[v1.0.0]: https://github.com/studentos/studentos/releases/tag/v1.0.0
