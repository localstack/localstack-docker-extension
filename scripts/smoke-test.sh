#!/bin/bash
# Verify a built extension image starts and ships everything metadata.json declares.
# Usage: ./scripts/smoke-test.sh <image>   (or: make smoke-test)

set -euo pipefail

IMAGE="${1:?usage: smoke-test.sh <image>}"
CONTAINER="dde-smoke-$$"
SOCKET="/tmp/extension-LocalStack.sock"

fail() { echo "SMOKE FAIL: $*" >&2; exit 1; }
cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT

echo "==> Smoke-testing $IMAGE"

# The image CMD points at /run/guest-services, which only exists inside Docker Desktop's VM.
docker run -d --name "$CONTAINER" "$IMAGE" /service -socket "$SOCKET" >/dev/null

for _ in $(seq 1 30); do
  if docker exec "$CONTAINER" test -S "$SOCKET" 2>/dev/null; then
    break
  fi
  sleep 1
done

docker exec "$CONTAINER" test -S "$SOCKET" 2>/dev/null \
  || { docker logs "$CONTAINER" >&2 || true; fail "/service did not create $SOCKET within 30s"; }

docker exec "$CONTAINER" pgrep -f '^/service' >/dev/null \
  || { docker logs "$CONTAINER" >&2 || true; fail "/service exited after creating the socket"; }

echo "    ok: /service is listening on $SOCKET"

# Docker Desktop copies these onto the host at install time; a missing one still builds cleanly.
BINARIES=$(docker run --rm "$IMAGE" cat /metadata.json \
  | jq -r '.host.binaries[]? | to_entries[] | .value[]? | .path')

[ -n "$BINARIES" ] || fail "metadata.json declares no host binaries"

while read -r path; do
  [ -n "$path" ] || continue
  docker exec "$CONTAINER" test -x "$path" \
    || fail "host binary missing or not executable: $path"
  echo "    ok: $path"
done <<< "$BINARIES"

for path in /ui/index.html /docker-compose.yaml /metadata.json /localstack.svg; do
  docker exec "$CONTAINER" test -s "$path" \
    || fail "missing or empty: $path"
  echo "    ok: $path"
done

echo "==> Smoke test passed"
