# StudentOS — DEVELOPMENT PLAN

**Version:** 1.0.0 — Production-Ready (2026-07-13)

---

## 1. Engineering Principles

1. **Production-ready, always.** No "we'll fix it later" code. Every PR ships
   at production quality.
2. **Modular first.** Code lives in the smallest possible scope. Promote to a
   wider scope only when reused.
3. **Typed end-to-end.** TypeScript everywhere. Zod for runtime validation at
   trust boundaries.
4. **DRY, but not dogmatically.** Duplication is sometimes clearer than the
   wrong abstraction. When in doubt, prefer readability.
5. **Tests describe behavior, not implementation.** Test what the user
   experiences, not internal call graphs.
6. **Documentation is a deliverable.** Every sprint updates `docs/`.
7. **Performance is a feature.** Measure it. Budget it. Defend it in CI.
8. **Server-side by default.** Sensitive logic, AI calls, and Firestore
   Admin access live in server-only modules.

---

## 2. Naming Conventions

| Element          | Convention     | Example                                      |
| ---------------- | -------------- | -------------------------------------------- |
| Files (general)  | kebab-case     | `chat-input.tsx`, `format.ts`                |
| React components | PascalCase     | `ChatInput`, `NoteCard`                      |
| Hooks            | `use-*`        | `use-streaming-chat.ts` → `useStreamingChat` |
| Services         | `*.service.ts` | `teacher.service.ts` → `teacherService`      |
| Schemas          | `*.schema.ts`  | `quiz.schema.ts` → `quizSchema`              |
| Stores (Zustand) | `*.store.ts`   | `junova.store.ts` → `useJunovaStore`         |
| Constants        | UPPER_SNAKE    | `COLLECTIONS.USERS`, `USER_ROLES.STUDENT`    |
| Types            | PascalCase     | `AITeacher`, `QuizAttempt`                   |
| API routes       | kebab-case dir | `/api/exam/generate-quiz`                    |
| Feature folders  | kebab-case     | `src/features/study-groups/`                 |

---

## 3. Git Workflow

### Branches

| Branch                         | Purpose                              |
| ------------------------------ | ------------------------------------ |
| `main`                         | Always deployable. Protected.        |
| `feature/<scope>-<short-desc>` | e.g. `feature/m2-auth-signup`        |
| `fix/<scope>-<short-desc>`     | Bug fixes                            |
| `release/<milestone>`          | Release prep (e.g. `release/v1.0.0`) |

### Commit conventions (Conventional Commits)

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`.

**Examples:**

```
feat(m2): add signup form with email/password
fix(junova): handle streaming timeout gracefully
docs(roadmap): mark M1 as complete
chore(deps): bump next to 16.1.1
```

### Pull requests

- One PR per feature/fix — small enough to review in <30 min.
- PR template requires: what changed, why, screenshots (if UI), test plan.
- At least one approval required to merge.
- CI must be green (lint, type-check, tests).

---

## 4. Sprint Cadence

StudentOS ships in **sprints**. Each milestone decomposes into 3–5 sprints.

```
Milestone ─┬─ Sprint X.1 ─┬─ Sprint X.2 ─┬─ Sprint X.3 ─...─ Sprint X.Y (verify)
           │
           └─ Each sprint:
              • Pre-coding brief (what / files / why / output)
              • Implementation
              • Post-coding report (files created/modified, docs updated)
              • Stop and await approval
```

### Sprint workflow (per Sprint)

1. **Assign** — user explicitly assigns a sprint.
2. **Brief** — engineer explains what will be built, files affected, why.
3. **Build** — engineer implements.
4. **Verify** — engineer confirms it builds, lints, and meets acceptance criteria.
5. **Report** — engineer lists files created/modified, docs updated, next sprint.
6. **Stop** — engineer waits for next assignment. Never auto-advance.

---

## 5. Code Quality Gates

Every PR must pass these gates before merge:

| Gate       | Tool                   | Threshold                      |
| ---------- | ---------------------- | ------------------------------ |
| Lint       | `bun run lint`         | 0 errors, 0 warnings           |
| Type check | `bun run type-check`   | 0 errors                       |
| Format     | `bun run format:check` | 0 diffs                        |
| Tests      | `bun run test`         | 100% pass (314 tests)          |
| Build      | `bun run build`        | 0 errors, 20 pages + 14 routes |

---

## 6. Code Review Checklist

- [ ] Does it follow the folder responsibility rules (see `ARCHITECTURE.md`)?
- [ ] Is it fully typed (no `any` without justification)?
- [ ] Are inputs validated (Zod) at trust boundaries?
- [ ] Does it handle loading, error, and empty states?
- [ ] Is it accessible (keyboard, ARIA, contrast)?
- [ ] Is it responsive (mobile + desktop)?
- [ ] Does it use design tokens (no raw hex colors)?
- [ ] Are secrets kept server-side?
- [ ] Are docs updated if behavior changed?

---

## 7. Testing Strategy

### Test pyramid

1. **Unit tests** — pure functions, hooks, utils. Fast, isolated.
2. **Component tests** — React Testing Library. Test behavior, not implementation.
3. **Service tests** — service-layer functions against mocked Firestore.
4. **Flow tests** — end-to-end critical user flows (auth, quiz generation).
5. **Visual regression** — Chromatic or similar. UI primitives. (Future)

### Test file layout

```
tests/
├── setup.ts                         # jsdom + IntersectionObserver / matchMedia mocks
├── lib/{utils,format,validation}.test.ts
├── firebase/{firestore-helpers,error-handling}.test.ts
├── components/{button,input}.test.tsx
├── features/
│   ├── junova/{teacher-card,chat-message,ai-provider,teacher.service}.test.{tsx,ts}
│   ├── exam/{quiz-results,quiz.service}.test.{tsx,ts}
│   ├── planner/{goal.service,schedule-engine}.test.ts
│   ├── community/community.service.test.ts
│   ├── settings/settings.service.test.ts
│   └── auth/auth-context.test.tsx
├── hooks/use-toast.test.tsx
└── flows/{auth-flow,quiz-generation}.test.tsx
```

### Coverage targets

- `utils/`: 100%
- `lib/`: ≥90%
- `services/`: ≥85% (service tests with mocked Firestore)
- `components/ui/`: ≥80% (component + interaction)
- `features/`: ≥75%

### Current state

314 tests passing across 23 test files. All Firebase / AI / network calls are
mocked — tests are hermetic and run in ~22 seconds.

---

## 8. Performance Budgets

| Metric                    | Budget       | Tool                    |
| ------------------------- | ------------ | ----------------------- |
| First Contentful Paint    | < 1.5s       | Lighthouse              |
| Largest Contentful Paint  | < 2.5s       | Lighthouse              |
| Time to Interactive       | < 3.0s       | Lighthouse              |
| Cumulative Layout Shift   | < 0.1        | Lighthouse              |
| JS bundle (initial)       | < 200KB gzip | `@next/bundle-analyzer` |
| Firestore reads / session | < 50         | Custom telemetry        |

### Optimizations applied in Sprint 13.0

- 12 feature route pages use `next/dynamic` with `ssr: false` + `<Skeleton>`
  fallback to reduce initial bundle size.
- `experimental.optimizePackageImports` extended to include `recharts`,
  `react-markdown`, `date-fns`, `lucide-react`, `framer-motion`.
- 5 list-item components wrapped with `React.memo` (`NoteCard`, `PostCard`,
  `TeacherCard`, `ChatMessage`, `MarkdownRenderer`).
- 4 sequential Firestore loops parallelised with `Promise.all` (community
  leave / unfollow, group leave / transfer, planner session creation).

---

## 9. Security Checklist (per feature)

- [ ] Auth required for all routes / data except explicitly public.
- [ ] Firestore rules enforce per-user isolation (owner-scoped) or
      public-feed pattern.
- [ ] User input validated (Zod) at every trust boundary.
- [ ] No secrets in client bundle.
- [ ] No `eval`, `dangerouslySetInnerHTML` without sanitization.
- [ ] HTTPS only (enforced by Firebase Hosting / Vercel).
- [ ] Rate limiting on auth endpoints (Cloud Functions, future).
- [ ] API routes verify Firebase ID token via `verifyAuthToken()`.
- [ ] Server-sent `body.uid` is NOT trusted — verified `auth.uid` is used.

---

## 10. Documentation Discipline

| When             | What                                                      |
| ---------------- | --------------------------------------------------------- |
| Start of sprint  | Read `docs/ROADMAP.md` to confirm scope                   |
| During sprint    | Update `docs/ARCHITECTURE.md` if architecture changes     |
| End of sprint    | Append entry to `docs/CHANGELOG.md`                       |
| End of milestone | Update `docs/ROADMAP.md` status, refresh all touched docs |

---

## 11. Sprint History (1.1 → 13.0)

### Sprint 1.1 — Project Initialization (✅ complete)

- Next.js 16 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui scaffolding
- Modular folder structure (`src/{app,components,features,hooks,lib,services,firebase,types,utils}`)
- ESLint 9 + Prettier 3 configured
- Import aliases (`@/components`, `@/lib`, `@/features`, etc.)
- Shared utilities (`cn`, `formatDate`, `formatRelativeTime`, `formatNumber`, `validateEmail`)
- Shared types (branded IDs, API response envelopes, async state)
- StudentOS dark theme (purple + blue, oklch color space)

**Key files added:** `tailwind.config.ts`, `eslint.config.mjs`, `src/lib/utils.ts`,
`src/utils/{format,validation}.ts`, `src/types/index.ts`, `src/app/globals.css`,
`src/app/layout.tsx`.

### Sprint 1.2 — Firebase Foundation (✅ complete)

- Firebase SDK (client + admin) installed and initialized
- Granular `src/firebase/` module split (config, app, auth, firestore, storage, admin, constants, error-handler, helpers)
- Firestore + Storage security rules + composite indexes
- `.env.local.example` with all env vars
- Firebase emulators config (`firebase.json`)
- Centralized error handler (`normalizeFirebaseError`)
- Reusable Firestore helpers (8 CRUD primitives)
- Reusable Storage helpers (upload, download, delete, validate)

**Key files added:** `src/firebase/{app,auth,firestore,storage,admin,config,constants,error-handler,firestore-helpers,storage-helpers,types,index}.ts`,
`firestore.rules`, `storage.rules`, `firestore.indexes.json`, `firebase.json`,
`.env.local.example`.

### Sprint 2.0 — Authentication (✅ complete)

- Email/password sign up + login + logout
- Session persistence (local + session strategies) + "Remember me"
- Protected routes (`ProtectedRoute`) + authentication middleware (`middleware.ts`)
- Auth Provider + Context + Hooks + Service + Zustand store
- Loading states (button spinners, route-guard loader)
- Error handling (centralized + form-level alerts + toast)
- Form validation (Zod schemas + React Hook Form)
- Toast notifications (Sonner)
- OAuth buttons (Google wired up; Apple placeholder)
- Password strength meter
- User document expanded with `role`, `level`, `lastLogin`
- `/login`, `/signup`, `/forgot-password` pages
- Open-redirect protection (`sanitizeRedirect`)

**Key files added:** `src/features/auth/{components,provider,hooks,services,store,schemas,utils,types,index}.{tsx,ts}`,
`src/app/(auth)/{login,signup,forgot-password}/page.tsx`, `middleware.ts`.

### Sprint 3.0 — Dashboard Foundation (✅ complete)

- App Shell (sidebar + header + content area)
- Desktop sidebar + mobile drawer (shadcn Sheet)
- Sticky header (mobile menu, search, notifications, avatar)
- 9 dashboard widgets (welcome header, profile card, today's overview, quick
  actions, recent activity, upcoming exams, notes preview, study progress, AI
  assistant preview)
- Module launcher grid
- 8 placeholder module routes

**Key files added:** `src/components/layout/{app-shell,sidebar,header,mobile-nav}.tsx`,
`src/features/dashboard/components/{welcome-header,user-profile-card,today-overview,quick-actions,recent-activity,upcoming-exams,notes-preview,study-progress,ai-assistant-preview,module-placeholder}.tsx`.

### Sprints 4.0–4.3 — Junova AI Phase 1 (✅ complete)

- AI Teacher CRUD (create, edit, delete, unlimited teachers)
- Avatar upload (Firebase Storage, image validation, replace / remove)
- Teacher DNA system (11 traits, modulates every AI response)
- Personality presets (5 presets + custom)
- Teaching styles (5 styles)
- Streaming chat (SSE via `/api/junova/chat`)
- Markdown rendering (code blocks, KaTeX math, tables)
- Chat management (search, pin, rename, export, delete)
- Copy responses, regenerate, continue response
- Suggested follow-up questions
- Image + PDF upload in chat
- Voice input foundation (Web Speech API)
- 4-layer architecture (UI → Hooks → Services → AI Provider)
- Server-only AI provider (`import 'server-only'` guard)

**Key files added:** `src/features/junova/{components/{chat,teacher},hooks,services,store,schemas,constants,types}.tsx`,
`src/app/api/junova/{chat,suggest,recommendations}/route.ts`,
`src/features/junova/services/{ai-provider,chat,teacher,prompt-builder}.service.ts`.

### Sprint 4.4 — Junova AI Phase 2: Memory & Recommendations (✅ complete)

- Long-term memory system (single doc per user at `junova_memory/{uid}`)
- Memory fields: profile, learning style, weak / strong topics, exam goals,
  routine, language, conversation summary, revision history, preferences
- Memory deduplication (`addWeakTopic`, `addStrongTopic`, `addRecentTopic`)
- Memory auto-update (`recordRevision`, `updateConversationSummary`)
- AI reads memory before responding (injected into system prompt via `buildMemorySection`)
- Memory service + `useMemory` hook with real-time subscription
- AI recommendation engine (next chapter, revision topics, daily goals, study
  path, exam-readiness score, teacher recommendations, motivational insights)
- Recommendations stored at `junova_recommendations/{uid}`
- `/api/junova/recommendations` API route

**Key files added:** `src/features/junova/services/{memory,recommendation}.service.ts`,
`src/features/junova/hooks/{use-memory,use-recommendations}.ts`.

### Sprint 4.5 — Junova AI Phase 3: Voice Teacher & Live AI Teacher (✅ complete)

- Voice conversation system (STT → AI → TTS loop with interrupt / pause / resume)
- Text-to-Speech via browser SpeechSynthesis API (no external dependency)
- Multiple voice options + voice selection (filtered by language)
- Voice settings (rate, pitch, volume, language, auto-speak) stored in Firestore
- Multi-language support (14 languages)
- Voice status indicators (idle, listening, processing, speaking, paused, error)
- Animated AI Teacher avatar (CSS-based, no 3D library) with lip-sync, 7 facial
  expressions, eye-contact tracking, hand gestures
- Full-screen teaching mode
- Whiteboard mode (canvas foundation with drawing tools)
- Classroom layout (avatar + whiteboard + voice controls)

**Key files added:** `src/features/junova/components/{live-teacher/{avatar,whiteboard,classroom-layout},voice/{voice-settings,voice-conversation-panel}}.tsx`,
`src/features/junova/hooks/{use-speech-synthesis,use-voice-preferences,use-voice-conversation,use-voice-input,use-live-teacher}.ts`,
`src/features/junova/services/{speech,voice,live-teacher}.service.ts`.

### Sprint 4.6 — Junova AI Phase 4: Smart Study Planner (✅ complete)

- Daily / weekly / monthly / custom study plans
- AI-generated personalized schedules (weak topics, strong topics, exam dates,
  available time)
- Revision planner with spaced-repetition tracking
- Exam countdown widget
- Timetable generator (schedule engine)
- AI goal tracking with progress bars + milestones
- Smart break suggestions
- Smart reminders (study, exam, break, revision, goal)
- Study sessions with status tracking
- Focus mode tracking
- Calendar view (monthly), timeline view, today's tasks view
- Subject-wise + chapter-wise + difficulty-based scheduling
- Intelligent subject balancing
- 5 Firestore collections (`study_plans`, `study_sessions`, `reminders`,
  `goals`, `revisions`)
- `/api/planner/generate` API route

**Key files added:** `src/features/planner/{components/{planner-view,calendar-view,timeline-view,today-tasks,goals-card,countdown-widget},services/{planner,session,goal,reminder,schedule-engine}.service.ts,hooks/{use-planner,use-goals,use-reminders}.ts}`.

### Sprints 5.0–5.1 — Exam Center (✅ complete)

- AI quiz generator with 5 question types (multiple choice, true/false, short
  answer, fill-in-blank, matching)
- Practice mode (instant scoring, explanation per question)
- Quiz player with timer + question navigator
- Quiz results with per-question analysis
- Mistake analysis — wrong-answer topics fed back into Junova memory as "weak
  topics" for personalized review
- Question bank (saved questions for reuse)
- Daily practice tracking
- 6 Firestore collections (`exam_quizzes`, `quiz_attempts`, `question_bank`,
  `practice_sessions`, `mistake_analysis`, `daily_practice`)
- 2 API routes (`/api/exam/generate-quiz`, `/api/exam/generate-practice`)

**Key files added:** `src/features/exam/{components/{exam-center-view,quiz-config-form,quiz-player,quiz-results,quiz-timer,question-card,question-navigator,practice-view,mistake-analysis-view},services/{quiz,attempt,practice,mistake-analysis}.service.ts,hooks/{use-quizzes,use-quiz-attempt,use-practice}.ts}`.

### Sprint 6.0 — Notes Hub (✅ complete)

- AI note generation
- Flashcard extraction
- Doubt solver
- Folder organization with nesting
- Tags + full-text search
- Copy / archive / export (Markdown)
- Pin / favourite / bookmark
- 3 Firestore collections (`notes`, `note_folders`, `doubt_history`)
- 2 API routes (`/api/notes/generate`, `/api/notes/doubt`)

**Key files added:** `src/features/notes/{components/notes-hub-view,services/{note,doubt}.service.ts,hooks/{use-notes,use-doubts}.ts,store/notes.store.ts,constants.ts}`.

### Sprint 7.0 — Study Groups (✅ complete)

- Realtime group chat (Firestore `onSnapshot`)
- Member roles (owner / admin / member) with transfer-ownership flow
- Study sessions (scheduled, in-progress, completed)
- File sharing (Firebase Storage)
- Group notifications
- Tag / reply / edit / delete messages + emoji reactions
- 6 Firestore collections (`study_groups`, `group_members`, `group_messages`,
  `group_sessions`, `group_files`, `group_notifications`)

**Key files added:** `src/features/groups/{components/study-groups-view,services/{group,chat}.service.ts,hooks/{use-groups,use-chat}.ts,types.ts}`.

### Sprint 8.0 — Career Planner (✅ complete)

- AI career counselor
- Goals / milestones tracking
- Skill tracker (current vs target level)
- College planning (program, fees, deadlines, exams)
- Timeline view
- AI recommendations at `career_recommendations/{uid}`
- 6 Firestore collections (`career_profiles`, `career_goals`,
  `career_progress`, `career_recommendations`, `career_skills`,
  `career_colleges`)
- 1 API route (`/api/career/recommendations`)

**Key files added:** `src/features/career/{components/career-planner-view,services/career.service.ts,hooks/use-career.ts,types.ts}`.

### Sprint 9.0 — Scholarship Finder (✅ complete)

- AI-curated scholarship recommendations based on student profile
- Application tracking (saved / applied / in-progress / awarded / rejected)
- Deadline reminders
- Scholarship profiles
- 5 Firestore collections (`scholarships`, `student_scholarships`,
  `scholarship_profiles`, `scholarship_recommendations`,
  `scholarship_notifications`)
- 1 API route (`/api/scholarships/recommendations`)

**Key files added:** `src/features/scholarships/{components/scholarship-finder-view,services/scholarship.service.ts,hooks/use-scholarships.ts,types.ts}`.

### Sprint 10.0 — Student Freelancing (✅ complete)

- Job marketplace with category / skill filters
- AI proposal generator
- Project management with messages
- Portfolio builder
- Reviews + ratings
- Earnings tracking
- 8 Firestore collections (`freelance_profiles`, `freelance_jobs`,
  `job_applications`, `freelance_projects`, `freelance_messages`,
  `portfolios`, `reviews`, `earnings`)
- 1 API route (`/api/freelance/generate-proposal`)

**Key files added:** `src/features/freelance/{components/freelance-view,services/freelance.service.ts,hooks/use-freelance.ts,types.ts}`.

### Sprint 11.0 — Student Community (✅ complete)

- Social feed with 5 reaction types (like, love, helpful, inspiring, celebrate)
- Comments with nested replies
- Communities (create / join / leave)
- Follow system
- AI post generation
- Reports + moderation
- 8 Firestore collections (`community_posts`, `community_comments`,
  `communities`, `community_members`, `community_notifications`,
  `community_reports`, `community_profiles`, `community_followers`)
- 1 API route (`/api/community/generate-post`)

**Key files added:** `src/features/community/{components/community-view,services/community.service.ts,hooks/use-community.ts,types.ts}`.

### Sprint 12.0 — Settings & Personalization (✅ complete)

- Full Settings module: account, personalization (accent color, density,
  animations), notifications, privacy, accessibility, AI preferences, storage,
  about
- `UserSettings` type with 40+ configurable fields
- Premium subscription module with 3-tier plans (Free / Pro / Premium)
- 8-provider AI registry (ZAI default + OpenAI / Gemini / Claude / Grok /
  DeepSeek / GLM-4 / Local)
- 12 AI tools (summarizer, translator, paraphraser, etc.) with usage limits
  per subscription tier
- 4 Firestore collections (`user_settings`, `subscriptions`, `tool_usage`,
  `user_preferences`, `user_notifications`, `user_privacy`, `user_devices`)
- 1 API route (`/api/tools`)

**Key files added:** `src/features/settings/{components/settings-view,services/settings.service.ts,hooks/use-settings.ts}`,
`src/features/premium/{services/premium.service.ts,hooks/use-premium.ts}`,
`src/features/tools/{components/tools-view,services/tools.service.ts}`,
`src/features/junova/services/ai-provider-registry.ts`.

### Sprint 13.0 — Testing, Optimization & Production Readiness (✅ complete)

- **Vitest test suite** — 314 tests across 23 files (unit, integration,
  component, service, hook, flow)
- **API authentication layer** — `src/lib/api-auth.ts` `verifyAuthToken()`
  verifies Firebase ID tokens on all 12 user-scoped API routes
- **Client auth fetch** — `src/lib/api-client.ts` `authedFetch()` injects
  ID token into all 13 client fetch sites
- **Zod validation** on every API route body
- **Firestore rules hardening** — 47 missing collection rules added
- **Security audit** — `docs/SECURITY_AUDIT.md` (18 findings)
- **Per-route error / loading pages** — every feature route has `error.tsx`
  - `loading.tsx`
- **Performance optimization** — dynamic imports (12 pages), React.memo (5
  components), skeleton loaders (5 views), N+1 query parallelisation (3
  service files), `next.config.ts` tuning
- **Accessibility audit** — global focus-visible, skip-to-content link,
  landmark aria-labels, icon-only button aria-labels, form label associations
  across 19 files
- **Deployment documentation** — `docs/DEPLOYMENT.md`
- **IDOR fix** — server uses verified `auth.uid`, not client-sent `body.uid`

**Key files added:** `src/lib/{api-auth,api-client}.ts`, `vitest.config.ts`,
`tests/` (23 files), `docs/{SECURITY_AUDIT,DEPLOYMENT,VERSION}.md`,
per-route `error.tsx` + `loading.tsx` (32 files).

---

## 12. CI/CD Pipeline (planned)

The CI/CD pipeline runs on every push to `main` and every PR:

```
┌─────────────┐   ┌──────────────┐   ┌────────────┐   ┌─────────┐   ┌──────────┐
│ type-check  │──▶│ lint         │──▶│ test       │──▶│ build   │──▶│ deploy   │
│ tsc --noEmit│   │ eslint .     │   │ vitest run │   │ next    │   │ vercel / │
│             │   │              │   │            │   │ build   │   │ firebase │
└─────────────┘   └──────────────┘   └────────────┘   └─────────┘   └──────────┘
```

| Stage        | Command                | Failure action                 |
| ------------ | ---------------------- | ------------------------------ |
| Type-check   | `bun run type-check`   | Block merge                    |
| Lint         | `bun run lint`         | Block merge                    |
| Format check | `bun run format:check` | Block merge                    |
| Test         | `bun run test`         | Block merge                    |
| Build        | `bun run build`        | Block merge                    |
| Deploy       | (Vercel / Firebase)    | Rollback on smoke-test failure |

Deployment is triggered automatically on push to `main` after all gates pass.
See `docs/DEPLOYMENT.md` for the full deployment guide.

---

## 13. Definition of Done (per sprint)

A sprint is "done" when ALL of the following are true:

- [ ] All acceptance criteria met
- [ ] `bun run lint` passes with 0 errors / 0 warnings
- [ ] `bun run type-check` passes with 0 errors
- [ ] `bun run format:check` passes
- [ ] `bun run test` passes (314 tests)
- [ ] `bun run build` succeeds
- [ ] Dev server boots without errors
- [ ] `docs/CHANGELOG.md` updated
- [ ] All relevant `docs/*.md` files updated
- [ ] Files created / modified list provided to user
- [ ] Engineer STOPS and waits for next assignment

---

_This plan is the engineering contract for StudentOS v1.0.0. Deviations
require explicit approval._
