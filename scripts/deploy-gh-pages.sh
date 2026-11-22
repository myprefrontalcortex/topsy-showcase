#!/usr/bin/env bash
set -euo pipefail

# Build production bundle and publish dist/ + .nojekyll to orphan gh-pages branch.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REMOTE_URL="${1:-origin}"
STAGE_DIR="/tmp/topsy-gh-pages-$$"

cd "$REPO_DIR"
npm run typecheck
npm run build

trap 'rm -rf "$STAGE_DIR"' EXIT
mkdir -p "$STAGE_DIR"
cp -a dist/. "$STAGE_DIR"/
touch "$STAGE_DIR/.nojekyll"

RESOLVED_URL="$REMOTE_URL"
if git remote get-url "$REMOTE_URL" >/dev/null 2>&1; then
  RESOLVED_URL="$(git remote get-url "$REMOTE_URL")"
fi

git -C "$STAGE_DIR" init -b gh-pages >/dev/null
git -C "$STAGE_DIR" remote add origin "$RESOLVED_URL"
git -C "$STAGE_DIR" add -A
TS="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
git -C "$STAGE_DIR" \
  -c user.name="Topsy Sentinel Bot" \
  -c user.email="topsy-bot@users.noreply.github.com" \
  commit -m "deploy: TOP5Y Sentinel public showcase ($TS)" >/dev/null
git -C "$STAGE_DIR" push --force origin gh-pages

echo "Deployed dist/ to gh-pages ($RESOLVED_URL)"
