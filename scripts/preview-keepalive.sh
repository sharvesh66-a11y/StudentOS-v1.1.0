#!/usr/bin/env bash
# StudentOS preview server keep-alive wrapper.
# Restarts the dev server if it exits.
set -u
cd /home/z/my-project

while true; do
  echo "[$(date)] Starting Next.js dev server..."
  bun run dev 2>&1
  EXIT=$?
  echo "[$(date)] Dev server exited with status $EXIT. Restarting in 3s..."
  sleep 3
done
