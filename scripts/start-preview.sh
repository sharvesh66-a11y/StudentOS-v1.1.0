#!/usr/bin/env bash
# Starts the StudentOS standalone production server with .env.local loaded.
# Used for test-mode preview deployments.
set -euo pipefail
cd /home/z/my-project

# Load .env.local into the environment (standalone server doesn't auto-load it).
if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.local
  set +a
fi

export PORT=${PORT:-3000}
export HOSTNAME=${HOSTNAME:-0.0.0.0}
export NODE_ENV=production

exec node .next/standalone/server.js
