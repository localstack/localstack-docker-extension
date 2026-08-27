#!/bin/bash
# Bump the version across the Makefile, the Dockerfile label and the CHANGELOG.
# Versions are calendar-based: <year>.<month>.<patch>, e.g. 2026.8.1. A release in
# the same month as the last one takes the next patch; the first release of a new
# month moves the date forward and restarts the patch at 0.
# Usage: ./scripts/bump-version.sh [cleared-cves-file]   Prints the new version.

set -euo pipefail

CLEARED_FILE="${1:-}"

CURRENT=$(sed -n 's/^TAG?=\(.*\)$/\1/p' Makefile)
[ -n "$CURRENT" ] || { echo "could not read TAG from Makefile" >&2; exit 1; }

# Split 2026.8.1 into the date part (2026.8) and the patch (1).
CURRENT_DATE="${CURRENT%.*}"
CURRENT_PATCH="${CURRENT##*.}"
[[ "$CURRENT_PATCH" =~ ^[0-9]+$ ]] || { echo "unexpected TAG format: $CURRENT" >&2; exit 1; }

# 10# forces base 10, so a zero-padded month such as 08 is not read as octal.
TODAY_DATE="$(date -u +%Y).$((10#$(date -u +%m)))"

if [ "$CURRENT_DATE" = "$TODAY_DATE" ]; then
  NEW="${TODAY_DATE}.$((CURRENT_PATCH + 1))"
else
  NEW="${TODAY_DATE}.0"
fi

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
