# StudentOS — ARCHITECTURE

**Version:** 1.0.0 — Production-Ready (2026-07-13)

---

## 0. Module Architecture (READ FIRST)

StudentOS is a **modular platform** built around **Junova AI** — the Core
Intelligence Layer. Every module integrates with Junova where appropriate.
Modules are NOT isolated features; they are designed to work together through
clean, scalable, production-ready architecture.

```
StudentOS
├── 🤖 Junova AI (Core Intelligence Layer)   ← THE HEART
│   │
│   │  Every module below calls Junova via a typed service layer:
│   │    junovaService.summarizeNote(...)
│   │    junovaService.generateExamQuestions(...)
│   │    junovaService.suggestCareerPath(...)
│   │    junovaService.matchScholarships(...)
│   │    ...etc
│   │
├── 🏠 Dashboard           — module launcher, today's overview
├── 📚 Exam Center         — mock exams, AI question generation
├── 📝 Notes Hub           — capture, organize, AI-summarize
├── 👥 Study Groups        — collaborative learning
├── 🎯 Career Planner      — AI-personalized career roadmap
├── 💰 Scholarship Finder  — AI-curated scholarship matching
├── 💼 Student Freelancing — skill marketplace
├── 🌍 Student Community   — forums, mentorship, knowledge base
├── ⚙️ Settings            — account, preferences, Junova config
├── 📊 Progress Analytics  — XP, levels, achievements, streaks
└── 🛠️ AI Tools + 💎 Premium — 12 tools + 8-provider registry + 3-tier subs
```

### Module integration contract

Every feature module follows the same internal structure:

```
src/features/<module>/
├── services/      # Business logic — calls Junova + Firebase
├── components/    # UI components for this module
├── hooks/         # Module-specific React hooks
├── store/         # Zustand store (if state is module-local)
├── schemas/       # Zod schemas for module inputs
├── types.ts       # Module-level TypeScript types
├── constants.ts   # Module constants (statuses, tabs, etc.)
└── index.ts       # Public barrel — only exports the public API
```

Modules import from each other ONLY through the public barrel (`@/features/<module>`).
Cross-module imports reaching into `services/` or `components/` directly are
forbidden and enforced by ESLint boundary rules.

---

## 1. Tech Stack

| Layer           | Technology                                      |
| --------------- | ----------------------------------------------- |
| Framework       | Next.js 16 (App Router) + React 19              |
| Language        | TypeScript 5 (strict)                           |
| Styling         | Tailwind CSS 4 + shadcn/ui (Radix UI)           |
| State (client)  | Zustand                                         |
| State (server)  | TanStack Query                                  |
| Auth            | Firebase Authentication                         |
| Database        | Cloud Firestore                                 |
| Storage         | Firebase Storage                                |
| Server logic    | Next.js API Routes (server-only)                |
| AI              | Junova AI via z-ai-web-dev-sdk (server-only)    |
| AI Registry     | 8 pluggable providers (ZAI default + 7 BYO-key) |
| Validation      | Zod                                             |
| Forms           | React Hook Form                                 |
| Notifications   | Sonner                                          |
| Math            | KaTeX (rehype-katex + remark-math)              |
| Charts          | Recharts                                        |
| Markdown        | react-markdown                                  |
| Testing         | Vitest + Testing Library + jsdom                |
| Linting         | ESLint 9 + Prettier 3                           |
| Package manager | Bun                                             |

---

## 2. The 4-Layer Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  1. UI Layer         React components (shadcn/ui + custom)   │
│                       No direct Firebase/AI calls.           │
├──────────────────────────────────────────────────────────────┤
│  2. Hooks Layer      Custom React hooks                      │
│                       use-streaming-chat, use-quizzes, ...   │
│                       Orchestrates services + state.         │
├──────────────────────────────────────────────────────────────┤
│  3. Services Layer   Service modules                         │
│                       teacher.service.ts, quiz.service.ts... │
│                       Wraps Firestore helpers + API calls.   │
├──────────────────────────────────────────────────────────────┤
│  4. AI Provider      ai-provider-registry.ts                 │
│     Layer            8 pluggable providers.                  │
│                       Server-only (`import 'server-only'`).  │
└──────────────────────────────────────────────────────────────┘
```

### Layer responsibilities

| Layer         | Knows about                          | Does NOT know about           |
| ------------- | ------------------------------------ | ----------------------------- |
| UI Components | Hooks, types, design tokens          | Services, Firebase, AI, fetch |
| Hooks         | Services, state, UI shape            | Firestore internals, AI SDK   |
| Services      | Firestore helpers, API routes, types | AI SDK internals, UI          |
| AI Provider   | z-ai-web-dev-sdk, registry           | Firestore, UI, hooks          |

### Data flow: Firestore read / write

```
User action
   │
   ▼
UI Component  ──uses──▶  Hook (e.g. useQuizzes)
                              │
                              ▼
                          Service (e.g. quiz.service.ts)
                              │
                              ▼
                          Firestore helper (getDocument / setDocument / ...)
                              │
                              ▼
                          Firestore (junova_conversations, exam_quizzes, ...)
```

### Data flow: AI request

```
User action
   │
   ▼
UI Component  ──uses──▶  Hook (e.g. useStreamingChat)
                              │
                              ▼
                          authedFetch('/api/...')  ── adds Firebase ID token
                              │
                              ▼
                          API Route (server-only)
                              │
                              ▼
                          verifyAuthToken(req)  ─── verifies Firebase ID token
                              │
                              ▼
                          Zod safeParse(body)   ─── validates request shape
                              │
                              ▼
                          AI Provider (junova/services/ai-provider.ts)
                              │
                              ▼
                          z-ai-web-dev-sdk  ────  Junova AI
                              │
                              ▼
                          Response (JSON or SSE stream)
```

---

## 3. Folder Structure

```
studentos/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # Auth route group (login, signup, forgot)
│   │   ├── (app)/               # Protected app route group (12 feature pages + dashboard)
│   │   ├── api/                 # 14 server-only API routes
│   │   ├── globals.css          # Tailwind + dark theme tokens
│   │   ├── layout.tsx           # Root layout (AuthProvider + OfflineIndicator)
│   │   ├── error.tsx            # Global error boundary
│   │   ├── not-found.tsx        # 404
│   │   └── loading.tsx          # Global loading
│   ├── components/
│   │   ├── ui/                  # 50+ shadcn/ui primitives
│   │   ├── layout/              # AppShell, Sidebar, Header, MobileNav
│   │   └── OfflineIndicator.tsx
│   ├── features/                # 12 feature modules (see Section 0)
│   │   ├── analytics/  auth/  career/  community/  dashboard/
│   │   ├── exam/       freelance/  groups/  junova/  notes/
│   │   ├── planner/    premium/  scholarships/  settings/  tools/
│   ├── firebase/                # Firebase SDK (client + admin)
│   │   ├── app.ts               # initializeApp + HMR-safe getApps() guard
│   │   ├── auth.ts              # getAuth(app) + emulator wiring
│   │   ├── firestore.ts         # getFirestore(app) + emulator wiring
│   │   ├── storage.ts           # getStorage(app) + emulator wiring
│   │   ├── admin.ts             # Server-only Admin SDK (server-only guard)
│   │   ├── config.ts            # Pure config from NEXT_PUBLIC_* env vars
│   │   ├── constants.ts         # COLLECTIONS + STORAGE_PATHS + USER_ROLES
│   │   ├── error-handler.ts     # normalizeFirebaseError()
│   │   ├── firestore-helpers.ts # 8 CRUD primitives
│   │   ├── storage-helpers.ts   # upload / download / delete / validate
│   │   ├── types.ts             # UserProfile, FirestoreDocument, etc.
│   │   └── index.ts             # Barrel (admin NOT re-exported)
│   ├── hooks/                   # Cross-feature hooks (use-toast, use-mobile)
│   ├── lib/                     # Framework-aware infra
│   │   ├── api-auth.ts          # verifyAuthToken() — server-only
│   │   ├── api-client.ts        # authedFetch() — client-only
│   │   ├── config.ts            # featureFlags + app config
│   │   ├── constants.ts
│   │   ├── db.ts                # Prisma client (dev-only)
│   │   ├── nav.ts               # Sidebar nav items
│   │   └── utils.ts             # cn()
│   ├── types/                   # Cross-feature TypeScript types
│   └── utils/                   # Pure framework-agnostic helpers (format, validation)
├── tests/                       # Vitest test suite (23 files, 314 tests)
├── docs/                        # All documentation (11 files)
├── public/                      # Static assets (logo.svg, robots.txt)
├── scripts/                     # gen-error-pages, validate-env, packaging scripts
├── firestore.rules              # Firestore security rules
├── firestore.indexes.json       # Composite indexes
├── storage.rules                # Firebase Storage rules
├── firebase.json                # Emulator config + hosting config
├── middleware.ts                # Guest-only route redirects
├── next.config.ts               # Standalone build + optimizePackageImports
├── tailwind.config.ts
├── eslint.config.mjs
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

---

## 4. AI Provider Registry (pluggable strategy pattern)

The `ai-provider-registry.ts` module exposes a uniform interface that every
AI-powered service in StudentOS calls. The active provider is selected per
request based on user settings (default: ZAI).

```
┌─────────────────────────────────────────────────────────┐
│  ai-provider-registry.ts                                │
│                                                          │
│  interface AIProvider {                                  │
│    generateChat(messages, opts): AsyncIterable<string>  │
│    generateSuggestions(ctx): Promise<string[]>          │
│    generateRecommendations(memory): Promise<Recs>       │
│    generateStudyPlan(input): Promise<Plan>              │
│    generateExamQuestions(spec): Promise<Question[]>     │
│    // ... 12 more methods                               │
│  }                                                       │
│                                                          │
│  registry.register('zai',      new ZAIProvider())       │
│  registry.register('openai',   new OpenAIProvider())    │
│  registry.register('gemini',   new GeminiProvider())    │
│  registry.register('claude',   new ClaudeProvider())    │
│  registry.register('grok',     new GrokProvider())      │
│  registry.register('deepseek', new DeepSeekProvider())  │
│  registry.register('glm-4',    new GLM4Provider())      │
│  registry.register('local',    new LocalProvider())     │
│                                                          │
│  registry.get(providerName) → AIProvider                │
└─────────────────────────────────────────────────────────┘
```

### Why a registry?

- **Single integration point** — every feature module calls the registry; no
  feature reaches into the SDK directly.
- **BYO-key providers** — users on Premium tier can switch providers from
  Settings. Each non-default provider reads its API key from a server-side
  env var.
- **Testability** — tests register a mock provider instead of mocking the SDK
  at every call site.
- **Server-only** — every provider file starts with `import 'server-only'`.
  The registry itself is server-only; client code never imports it.

### Provider list

| Provider | Status     | Notes                                    |
| -------- | ---------- | ---------------------------------------- |
| ZAI      | ✅ Default | Connected via z-ai-web-dev-sdk           |
| OpenAI   | Available  | Bring-your-own-key (`OPENAI_API_KEY`)    |
| Gemini   | Available  | Bring-your-own-key (`GEMINI_API_KEY`)    |
| Claude   | Available  | Bring-your-own-key (`ANTHROPIC_API_KEY`) |
| Grok     | Available  | Bring-your-own-key                       |
| DeepSeek | Available  | Bring-your-own-key                       |
| GLM-4    | Available  | Bring-your-own-key                       |
| Local    | Available  | Custom local endpoint                    |

---

## 5. Auth Flow

StudentOS uses Firebase Auth on the client and verifies every server-side
request with the Firebase Admin SDK.

```
┌─────────────────────────────────────────────────────────────┐
│  Client (browser)                                           │
│                                                              │
│   AuthProvider (src/features/auth/provider/auth-provider.tsx)│
│     │ onAuthStateChanged → user.uid, user.getIdToken()      │
│     ▼                                                        │
│   useAuth() hook → React context                            │
│     │                                                        │
│     ▼                                                        │
│   authedFetch('/api/...', { body })                         │
│     │ adds: Authorization: Bearer <firebase-id-token>       │
│     ▼                                                        │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Server (Next.js API route, server-only)                    │
│                                                              │
│   verifyAuthToken(req)                                      │
│     │ reads Authorization header                            │
│     │ adminAuth.verifyIdToken(token) → DecodedIdToken       │
│     ▼                                                        │
│   Zod safeParse(body)                                       │
│     │ validates request body shape                          │
│     ▼                                                        │
│   Business logic (service layer)                            │
│     │ uses auth.uid (NOT body.uid — IDOR fix)               │
│     ▼                                                        │
│   Response (JSON or SSE)                                    │
└─────────────────────────────────────────────────────────────┘
```

### Auth lifecycle

1. App boots → `AuthProvider` mounts → `setPersistence('local')`.
2. `onAuthStateChanged` fires → `user` state updates.
3. If `user` exists → `authService.getUserProfile(uid)` fetches Firestore profile.
4. State propagated to React (Context) AND to non-React code (Zustand mirror).
5. `<ProtectedRoute>` reads `isAuthenticated` and either renders children or
   redirects to `/login?redirect=<path>`.
6. Every client fetch to `/api/*` goes through `authedFetch`, which injects
   `Authorization: Bearer <id-token>`.
7. Every API route calls `verifyAuthToken(req)` first — returns 401 if the
   token is missing, malformed, expired, or revoked.

### Server-only guard

`src/firebase/admin.ts` and every AI provider file start with
`import 'server-only'`. If client code accidentally imports them, the build
fails fast. The Admin SDK credentials (`FIREBASE_CLIENT_EMAIL`,
`FIREBASE_PRIVATE_KEY`) are never exposed to the browser bundle.

---

## 6. Streaming SSE Flow

Junova chat streams responses token-by-token via Server-Sent Events.

```
Client                          Server
  │                               │
  │  POST /api/junova/chat        │
  │  Authorization: Bearer <tok>  │
  │  Accept: text/event-stream    │
  │  ───────────────────────────▶ │
  │                               │
  │                               │ verifyAuthToken(req)
  │                               │ Zod safeParse(body)
  │                               │ create AI stream
  │                               │
  │  ◀─── data: {"type":"delta",  │
  │         "content":"H"}        │ for each token...
  │  ◀─── data: {"type":"delta",  │
  │         "content":"i"}        │
  │  ◀─── ...                     │
  │  ◀─── data: {"type":"done"}   │
  │                               │ stream ends
  │                               │
```

### Implementation

- **Server side** (`src/app/api/junova/chat/route.ts`):
  - Auth + Zod validation happen BEFORE the stream starts (so 401 / 400 are
    JSON, not SSE — the stream hasn't begun).
  - Returns `new Response(readableStream, { headers: { 'Content-Type':
'text/event-stream', ... } })`.
  - Inside `ReadableStream.start`, the AI provider's async iterator is
    consumed; each chunk is written as `data: <json>\n\n`.
  - On error inside the stream, an SSE `error` event is sent with a sanitized
    message (generic in production).
- **Client side** (`src/features/junova/hooks/use-streaming-chat.ts`):
  - Reads `response.body.getReader()` + `TextDecoder` + line-buffered loop.
  - Parses each `data: <json>` line; if `type === 'delta'`, appends to the
    streaming message state.
  - If `type === 'done'`, finalizes the message and persists to Firestore.
  - On network error or aborted request, the partial response is preserved.

### Why SSE (not WebSockets)?

- SSE works over plain HTTP — no upgrade negotiation, no special infra.
- One-way server → client is exactly the data flow for chat streaming.
- Auto-reconnects via the browser's `EventSource` semantics (we use `fetch`
  for finer-grained control, but the wire format is identical).
- Plays nicely with Next.js Edge / Node runtimes.

---

## 7. Firestore Helpers (8 CRUD primitives)

All Firestore reads / writes go through `src/firebase/firestore-helpers.ts`.
No feature code calls `getDoc` / `setDoc` / `onSnapshot` directly.

| Helper                | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| `getDocument`         | Read a single doc by path                       |
| `setDocument`         | Set a doc (overwrite)                           |
| `updateDocument`      | Partial update (merge)                          |
| `deleteDocument`      | Delete a doc                                    |
| `queryDocuments`      | Query a collection with where / orderBy / limit |
| `subscribeToDocument` | Realtime listener on a single doc               |
| `subscribeToQuery`    | Realtime listener on a query                    |
| `createDocument`      | Add a doc with auto-generated ID                |

Each helper returns a typed `StudentOSResult<T>` envelope (`{ success: true,
data } | { success: false, error }`). Errors are normalized through
`normalizeFirebaseError()` so callers see consistent, user-friendly messages.

---

## 8. Single-Document Pattern

For per-user state that should never have duplicates (memory, settings,
recommendations), StudentOS uses the user's UID as the document ID:

| Collection                       | Doc ID | Why                              |
| -------------------------------- | ------ | -------------------------------- |
| `junova_memory/{uid}`            | uid    | One memory doc per user          |
| `junova_recommendations/{uid}`   | uid    | One recs doc per user            |
| `junova_voice_preferences/{uid}` | uid    | One voice config per user        |
| `junova_live_sessions/{uid}`     | uid    | One live-session config per user |
| `user_settings/{uid}`            | uid    | One settings doc per user        |

This pattern means writes are idempotent (set vs add) and reads are O(1).

---

## 9. Key Architectural Decisions

1. **Modular feature folders** — `src/features/<module>/{services,hooks,components,store,types}`.
2. **Single-document pattern** — memory / settings / recommendations use
   `{uid}` as doc ID (prevents duplicates, idempotent writes).
3. **HMR-safe Firebase singleton** — `getApps()` guard in `src/firebase/app.ts`
   prevents "app already initialized" errors during Next.js HMR.
4. **Centralized error handling** — `normalizeFirebaseError()` maps all
   Firebase errors to user-friendly messages with a `code`, `message`,
   `field` (for form binding), and `service` tag.
5. **Reusable Firestore helpers** — 8 CRUD primitives (Section 7).
6. **Server-only AI** — `import 'server-only'` at the top of every AI service
   file and at the top of `src/firebase/admin.ts`.
7. **Streaming SSE** — Junova chat uses Server-Sent Events via ReadableStream
   for token-by-token streaming (Section 6).
8. **API auth hardening** — every API route verifies the Firebase ID token
   via `verifyAuthToken()` and validates the body via Zod. The verified
   `auth.uid` is used in place of any client-sent `body.uid` (IDOR fix).

---

## 10. Build & Bundle

- **Output mode:** `standalone` (self-contained `.next/standalone/` for
  Firebase Hosting or any Node container).
- **TypeScript:** strict mode, `ignoreBuildErrors: false` (flipped in
  Sprint 13.0 — build fails fast on type regressions).
- **`experimental.optimizePackageImports`:** `lucide-react`, `framer-motion`,
  `recharts`, `react-markdown`, `date-fns` — tree-shakes barrel imports.
- **`images.remotePatterns`:** `lh3.googleusercontent.com` (Google avatars),
  `firebasestorage.googleapis.com` (Firebase Storage URLs).
- **Dynamic imports:** 12 feature route pages use `next/dynamic` with
  `ssr: false` + `<Skeleton>` fallback to reduce initial bundle size.
- **`React.memo`:** `NoteCard`, `PostCard`, `TeacherCard`, `ChatMessage`,
  `MarkdownRenderer` — list-item components with stable callback props.

---

_This document is the canonical architecture reference for StudentOS v1.0.0.
Cross-reference with `docs/DATABASE.md` for collection schemas and
`docs/DEVELOPMENT_PLAN.md` for the engineering process._
