<div align="center">

# StudentOS

### Learn. Grow. Achieve.

**An AI-powered operating system for students.**
One app to replace many — powered by **Junova AI**.

[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore%20%2B%20Storage-ffca28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Bun](https://img.shields.io/badge/Bun-runtime-000000?logo=bun&logoColor=white)](https://bun.sh/)
[![Vitest](https://img.shields.io/badge/Vitest-323_tests-6e9f18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-7c3aed)](#license)

**v1.3.0 — Production-Ready** · Build date 2026-07-15

</div>

---

## Overview

StudentOS is a production-grade, AI-first operating system for students.
Instead of juggling 8–15 disconnected apps — calendars, note apps, quiz tools,
exam-prep PDFs, browser-tab to-do lists, and chat-based AI helpers — students
use one application with one identity and one memory-aware AI (**Junova AI**)
that orchestrates every learning task on their behalf.

This repository is the canonical source for the StudentOS web application.

> **Status:** v1.3.0 — all sprints complete. Type-safe, lint-clean, fully
> tested (314 tests), security-audited, accessibility-audited,
> performance-optimized, and ready to deploy. See
> [`docs/VERSION.md`](./docs/VERSION.md) for the full statistics table.

---

## Tech Stack

| Layer           | Technology                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Framework       | Next.js 16 (App Router) + React 19                                                               |
| Language        | TypeScript 5 (strict)                                                                            |
| Styling         | Tailwind CSS 4 + shadcn/ui (Radix UI)                                                            |
| State (client)  | Zustand                                                                                          |
| State (server)  | TanStack Query                                                                                   |
| Auth            | Firebase Authentication                                                                          |
| Database        | Cloud Firestore                                                                                  |
| Storage         | Firebase Storage                                                                                 |
| Server logic    | Next.js API Routes (server-only, `'server-only'` guard)                                          |
| AI              | Junova AI via z-ai-web-dev-sdk (server-only)                                                     |
| AI Registry     | 8 pluggable providers (ZAI default + OpenAI / Gemini / Claude / Grok / DeepSeek / GLM-4 / Local) |
| Validation      | Zod                                                                                              |
| Forms           | React Hook Form                                                                                  |
| Notifications   | Sonner                                                                                           |
| Math            | KaTeX                                                                                            |
| Charts          | Recharts                                                                                         |
| Markdown        | react-markdown                                                                                   |
| Testing         | Vitest + Testing Library + jsdom                                                                 |
| Linting         | ESLint 9 + Prettier 3                                                                            |
| Package manager | Bun                                                                                              |

---

## Feature Modules (12)

| Module                 | Description                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 🤖 Junova AI           | AI Teacher with 11-trait Teacher DNA, streaming chat (SSE), long-term memory, recommendations, voice teacher, live classroom, smart planner |
| 🏠 Dashboard           | App Shell + 9 widgets + mobile nav                                                                                                          |
| 📚 Exam Center         | AI quiz generator (5 question types), practice mode, mistake analysis, memory integration                                                   |
| 📝 Notes Hub           | AI note generation, flashcards, doubt solver, folders, export                                                                               |
| 👥 Study Groups        | Realtime chat, member roles, study sessions, file sharing                                                                                   |
| 🎯 Career Planner      | AI counselor, goals / milestones, skills, college planning, timeline                                                                        |
| 💰 Scholarship Finder  | AI recommendations, application tracking, deadlines                                                                                         |
| 💼 Student Freelancing | Job marketplace, AI proposals, projects, portfolio, earnings                                                                                |
| 🌍 Student Community   | Social feed, 5 reactions, comments, communities, follow system, AI posts                                                                    |
| ⚙️ Settings            | Account, personalization, notifications, privacy, accessibility, AI preferences                                                             |
| 📊 Progress Analytics  | XP, levels, achievements, badges, streaks, weekly challenges                                                                                |
| 🛠️ AI Tools            | 12 tools (summarizer, translator, paraphraser, etc.) + 8-provider registry + 3-tier premium subscriptions                                   |

---

## Quick Start

### Prerequisites

- **Bun** ≥ 1.1 (recommended) or **Node.js** ≥ 20
- A Firebase project (Auth + Firestore + Storage enabled) — see
  [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for setup

### Installation

```bash
# Clone
git clone <your-repo-url> studentos
cd studentos

# Install dependencies
bun install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your real Firebase credentials

# Start the dev server (port 3000)
bun run dev
```

Open <http://localhost:3000> to see the app.

### Available Scripts

| Script                 | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `bun run dev`          | Start dev server on port 3000                     |
| `bun run build`        | Production build (standalone output)              |
| `bun run start`        | Start production server (after build)             |
| `bun run lint`         | Run ESLint                                        |
| `bun run lint:fix`     | Run ESLint with auto-fix                          |
| `bun run format`       | Format all files with Prettier                    |
| `bun run format:check` | Check formatting without writing                  |
| `bun run type-check`   | Run TypeScript compiler in `--noEmit` mode        |
| `bun run test`         | Run Vitest test suite (314 tests across 23 files) |

---

## Testing

StudentOS ships with a comprehensive Vitest test suite covering unit,
integration, component, service, hook, and flow tests. All Firebase / AI /
network calls are mocked — tests are hermetic and run in ~22 seconds.

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test -- --watch

# Run a specific test file
bun run test tests/features/junova/ai-provider.test.ts
```

| Metric             | Value |
| ------------------ | ----- |
| Test files         | 23    |
| Test lines of code | 4,163 |
| Tests passing      | 314   |
| Test runtime       | ~22s  |

Test layout:

```
tests/
├── lib/                  # Utility unit tests
├── firebase/             # Firestore helper + error-handling tests
├── components/           # UI component tests
├── features/             # Feature service + component tests
├── hooks/                # Hook tests
└── flows/                # End-to-end flow tests
```

---

## Documentation

All project documentation lives in [`docs/`](./docs/):

| Document                                            | Purpose                                                      |
| --------------------------------------------------- | ------------------------------------------------------------ |
| [`VISION.md`](./docs/VISION.md)                     | The problem, the north-star, four pillars, design principles |
| [`ROADMAP.md`](./docs/ROADMAP.md)                   | 13-sprint history (all ✅) + future v1.x ideas               |
| [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md)         | 4-layer architecture, folder rules, data flow, AI registry   |
| [`DATABASE.md`](./docs/DATABASE.md)                 | 60+ Firestore collections, indexes, security rules           |
| [`UI_GUIDELINES.md`](./docs/UI_GUIDELINES.md)       | Design language, color tokens, components, a11y              |
| [`DEVELOPMENT_PLAN.md`](./docs/DEVELOPMENT_PLAN.md) | Engineering principles, conventions, sprint history, CI/CD   |
| [`PROJECT_STATUS.md`](./docs/PROJECT_STATUS.md)     | Current status, final stats, quality gates, known limits     |
| [`VERSION.md`](./docs/VERSION.md)                   | Canonical version reference + module status table            |
| [`CHANGELOG.md`](./docs/CHANGELOG.md)               | Notable changes per release (v0.1.0 → v1.0.0)                |
| [`DEPLOYMENT.md`](./docs/DEPLOYMENT.md)             | Env vars, Vercel / Firebase Hosting deploy, post-deploy      |
| [`SECURITY_AUDIT.md`](./docs/SECURITY_AUDIT.md)     | 18 findings, severities, remediations                        |

For deployment instructions, see [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

---

## Project Structure

```
studentos/
├── docs/                    # 11 documentation files
├── public/                  # Static assets (logo.svg, robots.txt)
├── scripts/                 # gen-error-pages, validate-env, packaging scripts
├── src/
│   ├── app/                 # Next.js App Router (17 pages, 14 API routes)
│   │   ├── (auth)/          # Auth route group (login, signup, forgot-password)
│   │   ├── (app)/           # Protected app route group (12 features + dashboard)
│   │   └── api/             # Server-only API routes
│   ├── components/
│   │   ├── ui/              # 50+ shadcn/ui primitives
│   │   ├── layout/          # AppShell, Sidebar, Header, MobileNav
│   │   └── OfflineIndicator.tsx
│   ├── features/            # 12 feature modules
│   │   └── <module>/{services,hooks,components,store,types}
│   ├── firebase/            # Firebase SDK (client + admin, HMR-safe)
│   ├── hooks/               # Cross-feature hooks (use-toast, use-mobile)
│   ├── lib/                 # api-auth, api-client, config, utils, nav
│   ├── types/               # Cross-feature TypeScript types
│   └── utils/               # Pure framework-agnostic helpers (format, validation)
├── tests/                   # Vitest test suite (23 files, 314 tests)
├── firestore.rules          # Firestore security rules (60+ collections)
├── firestore.indexes.json   # Composite indexes
├── storage.rules            # Firebase Storage rules
├── firebase.json            # Emulator + hosting config
├── middleware.ts            # Guest-only route redirects
├── next.config.ts           # Standalone build + optimizePackageImports
├── tailwind.config.ts
├── eslint.config.mjs
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for folder
responsibility rules and the 4-layer architecture diagram.

---

## Quality Gates

| Gate                | Result                                       |
| ------------------- | -------------------------------------------- |
| TypeScript strict   | 0 errors                                     |
| ESLint              | 0 errors / 0 warnings                        |
| Vitest              | 314 tests passing across 23 files            |
| Next.js build       | 20 static pages + 14 API routes              |
| Security audit      | 18 findings — all Critical / High remediated |
| Accessibility audit | 19 files improved; 4 documented follow-ups   |

---

## Contributing

StudentOS uses a sprint-based development workflow:

1. User assigns a sprint explicitly (e.g. "Start Sprint X.Y").
2. Engineer posts a **pre-coding brief** (what / files / why / expected output).
3. Engineer implements.
4. Engineer verifies (`bun run lint`, `bun run type-check`, `bun run test`,
   `bun run build`).
5. Engineer posts a **post-coding report** (files created / modified, docs
   updated, next sprint).
6. Engineer **STOPS** and waits for the next assignment. Sprints never
   auto-advance.

See [`docs/DEVELOPMENT_PLAN.md`](./docs/DEVELOPMENT_PLAN.md) for the full
engineering contract: naming conventions, code-review checklist, CI/CD
pipeline, and definition of done.

### Commit conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(junova): add streaming chat
fix(exam): handle timeout gracefully
docs(roadmap): mark sprint 13 complete
chore(deps): bump next to 16.1.1
```

---

## Design Language

| Property        | Value                                        |
| --------------- | -------------------------------------------- |
| Theme           | Dark (primary)                               |
| Primary color   | Purple                                       |
| Secondary color | Blue                                         |
| Color space     | oklch (CSS Color 4)                          |
| Style           | Modern · Futuristic · Minimal · Premium SaaS |
| Responsive      | Mobile-first, fully responsive               |
| Animations      | Smooth, subtle, purposeful                   |

> **CRITICAL:** UI designs are already approved. Do NOT redesign. Engineers
> implement approved designs pixel-perfect. See
> [`docs/UI_GUIDELINES.md`](./docs/UI_GUIDELINES.md).

---

## License

Proprietary — © StudentOS. All rights reserved.

A formal `LICENSE` file will be added before the first public release. Until
then, this codebase is shared with contributors under a confidential
evaluation agreement.

---

<div align="center">

**Learn. Grow. Achieve.**

Built with discipline for millions of students. 🌍

</div>
