#!/usr/bin/env bash
# StudentOS — Production ZIP Packager v0.7.0
set -euo pipefail

PROJECT_ROOT="/home/z/my-project"
OUTPUT_DIR="${PROJECT_ROOT}/download"
OUTPUT_FILE="${OUTPUT_DIR}/StudentOS_v0.7.0_Source.zip"
WORK_DIR="$(mktemp -d)"
STAGING_DIR="${WORK_DIR}/studentos"

echo "[1/5] Preparing staging directory..."
mkdir -p "${STAGING_DIR}"

INCLUDE_PATHS=(
  "apps" "packages" "docs" "public" "prisma" "scripts" "src"
  "components.json" "eslint.config.mjs" "next.config.ts" "package.json"
  "bun.lock" "postcss.config.mjs" "tailwind.config.ts" "tsconfig.json"
  "README.md" ".prettierrc" ".prettierignore" ".gitignore"
  ".env.local.example" ".firebaserc" "firebase.json"
  "firestore.rules" "firestore.indexes.json" "storage.rules" "middleware.ts"
)

echo "[2/5] Copying project files..."
for path in "${INCLUDE_PATHS[@]}"; do
  if [ -e "${PROJECT_ROOT}/${path}" ]; then
    cp -r "${PROJECT_ROOT}/${path}" "${STAGING_DIR}/"
    echo "  ✓ ${path}"
  fi
done

echo "[3/5] Cleaning staging directory..."
rm -rf "${STAGING_DIR}/node_modules" "${STAGING_DIR}/.next" "${STAGING_DIR}/.git" \
       "${STAGING_DIR}/.zscripts" "${STAGING_DIR}/examples" "${STAGING_DIR}/mini-services" \
       "${STAGING_DIR}/skills" "${STAGING_DIR}/download" "${STAGING_DIR}/db" \
       "${STAGING_DIR}/upload" "${STAGING_DIR}/.claude" "${STAGING_DIR}/.z-ai-config" 2>/dev/null || true
rm -f "${STAGING_DIR}/dev.log" "${STAGING_DIR}/server.log" "${STAGING_DIR}/.env" \
      "${STAGING_DIR}/.env.local" "${STAGING_DIR}/Caddyfile" "${STAGING_DIR}/next-env.d.ts" 2>/dev/null || true
find "${STAGING_DIR}" -name ".DS_Store" -delete 2>/dev/null || true
find "${STAGING_DIR}" -name "Thumbs.db" -delete 2>/dev/null || true
find "${STAGING_DIR}" -name "*.log" -delete 2>/dev/null || true
find "${STAGING_DIR}" -name "*.tsbuildinfo" -delete 2>/dev/null || true
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

# Verify no secrets leaked
SECRETS=$(unzip -l "${OUTPUT_FILE}" | grep -E "\.env\.local$|\.env$|dev\.log|server\.log|Caddyfile|node_modules|\.next/" | head -5)
if [ -z "$SECRETS" ]; then
  echo "  ✓ No secrets or excluded files found in ZIP"
else
  echo "  ⚠️ WARNING: Found excluded files in ZIP:"
  echo "$SECRETS"
fi

rm -rf "${WORK_DIR}"
echo ""
echo "[done]"
