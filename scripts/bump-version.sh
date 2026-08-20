#!/bin/bash
# Bump the patch version across the Makefile, the Dockerfile label and the CHANGELOG.
# Usage: ./scripts/bump-version.sh [cleared-cves-file]   Prints the new version.

set -euo pipefail

CLEARED_FILE="${1:-}"

CURRENT=$(sed -n 's/^TAG?=\(.*\)$/\1/p' Makefile)
[ -n "$CURRENT" ] || { echo "could not read TAG from Makefile" >&2; exit 1; }

# Security rebuilds only move the patch component; feature releases set year.month by hand.
MAJOR_MINOR="${CURRENT%.*}"
PATCH="${CURRENT##*.}"
[[ "$PATCH" =~ ^[0-9]+$ ]] || { echo "unexpected TAG format: $CURRENT" >&2; exit 1; }
NEW="${MAJOR_MINOR}.$((PATCH + 1))"

sed -i "s|^TAG?=${CURRENT}$|TAG?=${NEW}|" Makefile

# Rewrite whatever is there — this label was stale for several releases.
sed -i "s|org.opencontainers.image.version=[^ ]*|org.opencontainers.image.version=${NEW}|" Dockerfile

NOTE="Security update"
if [ -n "$CLEARED_FILE" ] && [ -s "$CLEARED_FILE" ]; then
  NOTE="Security update — clears $(paste -sd, "$CLEARED_FILE" | sed 's/,/, /g')"
fi

ENTRY="## [${NEW}] — $(date -u +%Y-%m-%d)\n\n### Changed\n\n- ${NOTE}\n"

awk -v entry="$ENTRY" '
  !done && /^## \[/ { printf "%s\n", entry; done = 1 }
  { print }
' CHANGELOG.md > CHANGELOG.md.tmp && mv CHANGELOG.md.tmp CHANGELOG.md

echo "$NEW"
