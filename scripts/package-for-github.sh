#!/usr/bin/env bash
# StudentOS — Project Packager
# Packages the complete StudentOS project into a clean ZIP file
# suitable for uploading to GitHub.
#
# Excludes: node_modules, .next, .git, sandbox infra, logs, env files,
#           local DBs, build artifacts, sandbox examples/mini-services.

set -euo pipefail

PROJECT_ROOT="/home/z/my-project"
OUTPUT_DIR="${PROJECT_ROOT}/download"
OUTPUT_FILE="${OUTPUT_DIR}/studentos-sprint-1.1.zip"
WORK_DIR="$(mktemp -d)"
STAGING_DIR="${WORK_DIR}/studentos"

echo "[1/5] Preparing staging directory..."
mkdir -p "${STAGING_DIR}"

# Files/dirs to INCLUDE (relative to project root)
INCLUDE_PATHS=(
  "apps"
  "packages"
  "docs"
  "public"
  "prisma"
  "scripts"
  "src"
  "components.json"
  "eslint.config.mjs"
  "next.config.ts"
  "package.json"
  "bun.lock"
  "postcss.config.mjs"
  "tailwind.config.ts"
  "tsconfig.json"
  "README.md"
  ".prettierrc"
  ".prettierignore"
  ".gitignore"
)

echo "[2/5] Copying project files to staging..."
for path in "${INCLUDE_PATHS[@]}"; do
  if [ -e "${PROJECT_ROOT}/${path}" ]; then
    cp -r "${PROJECT_ROOT}/${path}" "${STAGING_DIR}/"
    echo "  ✓ ${path}"
  else
    echo "  ! skipped (not found): ${path}"
  fi
done

# Add a .env.example so the user knows what env vars Sprint 1.2 will need
# (without exposing any actual secrets — there are none yet)
cat > "${STAGING_DIR}/.env.example" << 'EOF'
# StudentOS Environment Variables
#
# Copy this file to `.env.local` and fill in real values.
# NEVER commit `.env.local` — it is already in .gitignore.
#
# These are NOT used in Sprint 1.1. They will be wired up in Sprint 1.2
# (Firebase Configuration).

# Firebase Client SDK (safe to expose — protected by Firestore rules)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (server-only — NEVER prefix with NEXT_PUBLIC)
# Used by Cloud Functions
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# App
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF
echo "  ✓ .env.example (generated)"

# Add a fresh .gitignore tailored for the repo (the sandbox one is fine,
# but let's make sure it covers everything we need)
cat > "${STAGING_DIR}/.gitignore" << 'EOF'
# Dependencies
node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build
/dist

# Misc
.DS_Store
*.pem
Thumbs.db

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Env files (never commit secrets)
.env
.env.local
.env.*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Logs
*.log
dev.log
server.log

# IDE
.idea
.vscode
*.swp
*.swo

# OS
.DS_Store
EOF
echo "  ✓ .gitignore (refreshed)"

# Write a setup script for the user
cat > "${STAGING_DIR}/SETUP.md" << 'EOF'
# StudentOS — Local Setup Guide

## Prerequisites

- **Node.js** ≥ 20  (or **Bun** ≥ 1.1 — recommended)
- A modern OS (macOS, Linux, Windows with WSL2)

## Installation

```bash
# 1. Extract the ZIP (if you haven't already)
unzip studentos-sprint-1.1.zip
cd studentos

# 2. Initialize a fresh git repo (the ZIP ships without .git history)
git init
git add .
git commit -m "feat(m1): sprint 1.1 — project initialization"

# 3. Install dependencies
bun install
#   (or: npm install / pnpm install / yarn install)

# 4. Start the dev server
bun run dev
#   (or: npm run dev / pnpm dev / yarn dev)

# 5. Open http://localhost:3000
```

## Pushing to GitHub

### Option A — Brand-new repo (recommended)

```bash
# Create an empty repo on GitHub first (https://github.com/new)
# Do NOT initialize it with README/license/gitignore — leave it empty.

git remote add origin https://github.com/<your-username>/studentos.git
git branch -M main
git push -u origin main
```

### Option B — Existing empty repo

```bash
git remote add origin https://github.com/<your-username>/studentos.git
git push -u origin main
```

### Option C — GitHub Web UI (no CLI needed)

1. Go to https://github.com/new
2. Create an empty repo (no README, no license, no .gitignore)
3. Use the "uploading an existing file" link in the repo's empty state
4. Drag the **contents** of the `studentos/` folder (not the folder itself) into the uploader
5. Commit directly to `main`

> Note: GitHub's web uploader has a 100-file limit per upload. The project
> has ~105 files. If you hit the limit, upload in two batches, or use one
> of the CLI options above.

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start dev server on port 3000 |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run lint:fix` | Run ESLint with auto-fix |
| `bun run format` | Format with Prettier |
| `bun run format:check` | Check formatting |
| `bun run type-check` | TypeScript type check |

## Documentation

See the `docs/` folder for complete project documentation:
- `VISION.md` — the problem and north-star
- `ROADMAP.md` — 13-milestone roadmap
- `ARCHITECTURE.md` — high-level architecture and folder rules
- `DATABASE.md` — target Firestore schema
- `UI_GUIDELINES.md` — design language and tokens
- `DEVELOPMENT_PLAN.md` — engineering principles and workflow
- `CHANGELOG.md` — release history

## Next Sprint

**Sprint 1.2 — Firebase Configuration** will wire up Firebase Auth, Firestore,
Storage, and Cloud Functions. See `docs/ROADMAP.md` for the full plan.
EOF
echo "  ✓ SETUP.md (generated)"

echo "[3/5] Removing any stray sandbox artifacts from staging..."
# Defensive cleanup — make sure nothing sandbox-specific sneaked in
rm -rf "${STAGING_DIR}/node_modules" 2>/dev/null || true
rm -rf "${STAGING_DIR}/.next" 2>/dev/null || true
rm -rf "${STAGING_DIR}/.git" 2>/dev/null || true
rm -rf "${STAGING_DIR}/.zscripts" 2>/dev/null || true
rm -rf "${STAGING_DIR}/examples" 2>/dev/null || true
rm -rf "${STAGING_DIR}/mini-services" 2>/dev/null || true
rm -rf "${STAGING_DIR}/skills" 2>/dev/null || true
rm -rf "${STAGING_DIR}/download" 2>/dev/null || true
rm -rf "${STAGING_DIR}/db" 2>/dev/null || true
rm -rf "${STAGING_DIR}/upload" 2>/dev/null || true
rm -rf "${STAGING_DIR}/.claude" 2>/dev/null || true
rm -rf "${STAGING_DIR}/.z-ai-config" 2>/dev/null || true
rm -f "${STAGING_DIR}/dev.log" 2>/dev/null || true
rm -f "${STAGING_DIR}/server.log" 2>/dev/null || true
rm -f "${STAGING_DIR}/.env" 2>/dev/null || true
rm -f "${STAGING_DIR}/Caddyfile" 2>/dev/null || true
echo "  ✓ clean"

echo "[4/5] Creating ZIP archive..."
mkdir -p "${OUTPUT_DIR}"
rm -f "${OUTPUT_FILE}"
cd "${WORK_DIR}" && zip -r -q "${OUTPUT_FILE}" studentos/
echo "  ✓ ${OUTPUT_FILE}"

echo "[5/5] Verifying ZIP contents..."
FILE_COUNT=$(unzip -l "${OUTPUT_FILE}" | tail -1 | awk '{print $2}')
SIZE=$(du -h "${OUTPUT_FILE}" | cut -f1)
echo "  ✓ ${FILE_COUNT} files, ${SIZE} total"

echo ""
echo "=== ZIP ready ==="
echo "  Path:  ${OUTPUT_FILE}"
echo "  Size:  ${SIZE}"
echo "  Files: ${FILE_COUNT}"
echo ""
echo "=== Top-level contents ==="
unzip -l "${OUTPUT_FILE}" | awk 'NR>3 && NR<40 {print "  "$4}' | head -35

# Cleanup
rm -rf "${WORK_DIR}"
echo ""
echo "[done]"
