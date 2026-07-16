#!/usr/bin/env bash
# StudentOS — Release Packager v0.7.0
# Creates a clean ZIP excluding all non-essential files.

set -euo pipefail

PROJECT_ROOT="/home/z/my-project"
OUTPUT_DIR="${PROJECT_ROOT}/download"
OUTPUT_FILE="${OUTPUT_DIR}/StudentOS-v0.7.0-JunovaAI-Foundation.zip"
WORK_DIR="$(mktemp -d)"
STAGING_DIR="${WORK_DIR}/studentos"

echo "[1/6] Preparing staging directory..."
mkdir -p "${STAGING_DIR}"

# Files/dirs to INCLUDE
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
  ".env.local.example"
  ".firebaserc"
  "firebase.json"
  "firestore.rules"
  "firestore.indexes.json"
  "storage.rules"
  "middleware.ts"
)

echo "[2/6] Copying project files to staging..."
for path in "${INCLUDE_PATHS[@]}"; do
  if [ -e "${PROJECT_ROOT}/${path}" ]; then
    cp -r "${PROJECT_ROOT}/${path}" "${STAGING_DIR}/"
    echo "  ✓ ${path}"
  else
    echo "  ! skipped (not found): ${path}"
  fi
done

echo "[3/6] Cleaning staging directory..."
# Defensive cleanup — make sure nothing sneaked in
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
rm -f "${STAGING_DIR}/.env.local" 2>/dev/null || true
rm -f "${STAGING_DIR}/Caddyfile" 2>/dev/null || true
rm -f "${STAGING_DIR}/next-env.d.ts" 2>/dev/null || true
find "${STAGING_DIR}" -name ".DS_Store" -delete 2>/dev/null || true
find "${STAGING_DIR}" -name "Thumbs.db" -delete 2>/dev/null || true
find "${STAGING_DIR}" -name "*.log" -delete 2>/dev/null || true
find "${STAGING_DIR}" -name "*.tsbuildinfo" -delete 2>/dev/null || true
echo "  ✓ clean"

echo "[4/6] Creating ZIP archive..."
mkdir -p "${OUTPUT_DIR}"
rm -f "${OUTPUT_FILE}"
cd "${WORK_DIR}" && zip -r -q "${OUTPUT_FILE}" studentos/
echo "  ✓ ${OUTPUT_FILE}"

echo "[5/6] Verifying ZIP contents..."
FILE_COUNT=$(unzip -l "${OUTPUT_FILE}" | tail -1 | awk '{print $2}')
SIZE=$(du -h "${OUTPUT_FILE}" | cut -f1)
echo "  ✓ ${FILE_COUNT} files, ${SIZE} total"

echo ""
echo "=== Top-level contents ==="
unzip -l "${OUTPUT_FILE}" | awk 'NR>3 && NR<40 {print "  "$4}' | head -35

echo ""
echo "=== Folder summary ==="
unzip -l "${OUTPUT_FILE}" | awk '{print $4}' | grep -oP '^studentos/[^/]+' | sort -u | head -30

# Cleanup
rm -rf "${WORK_DIR}"
echo ""
echo "[6/6] Done."
