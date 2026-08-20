#!/bin/bash
# Bump the patch component of the extension version across every place it lives.
#
# The version appears in three files that must agree, plus the git tag the
# publish workflow keys off:
#   Makefile      TAG?=<version>
#   Dockerfile    org.opencontainers.image.version=<version>
#   CHANGELOG.md  ## [<version>] — <date>
#
# Usage: ./scripts/bump-version.sh [cleared-cves-file]
# Prints the new version on stdout.

set -euo pipefail

CLEARED_FILE="${1:-}"

CURRENT=$(sed -n 's/^TAG?=\(.*\)$/\1/p' Makefile)
[ -n "$CURRENT" ] || { echo "could not read TAG from Makefile" >&2; exit 1; }

# 2026.8.0 -> 2026.8.1. Security rebuilds only ever move the patch component;
# feature releases set the year.month by hand.
MAJOR_MINOR="${CURRENT%.*}"
PATCH="${CURRENT##*.}"
[[ "$PATCH" =~ ^[0-9]+$ ]] || { echo "unexpected TAG format: $CURRENT" >&2; exit 1; }
NEW="${MAJOR_MINOR}.$((PATCH + 1))"

sed -i "s|^TAG?=${CURRENT}$|TAG?=${NEW}|" Makefile

# This label was stale for several releases before the bump was scripted, so
# rewrite whatever is there rather than matching the previous version.
sed -i "s|org.opencontainers.image.version=[^ ]*|org.opencontainers.image.version=${NEW}|" Dockerfile

NOTE="Security update"
if [ -n "$CLEARED_FILE" ] && [ -s "$CLEARED_FILE" ]; then
  NOTE="Security update — clears $(paste -sd, "$CLEARED_FILE" | sed 's/,/, /g')"
fi

ENTRY="## [${NEW}] — $(date -u +%Y-%m-%d)\n\n### Changed\n\n- ${NOTE}\n"

# Insert above the topmost existing release heading.
awk -v entry="$ENTRY" '
  !done && /^## \[/ { printf "%s\n", entry; done = 1 }
  { print }
' CHANGELOG.md > CHANGELOG.md.tmp && mv CHANGELOG.md.tmp CHANGELOG.md

echo "$NEW"
