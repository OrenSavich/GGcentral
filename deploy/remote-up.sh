#!/bin/sh
# Update the running stack on the Oracle host. The production .env file stays on the server.
# GHCR credentials arrive on stdin and are removed after the pull.

set -eu

cd "$(CDPATH= cd -- "$(dirname "$0")" && pwd)"

if [ -z "${IMAGE_TAG:-}" ] || [ -z "${GHCR_ACTOR:-}" ]; then
  echo "IMAGE_TAG and GHCR_ACTOR are required" >&2
  exit 1
fi

if [ ! -f .env ]; then
  echo "Production environment file is missing at $(pwd)/.env" >&2
  exit 1
fi

for key in POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB WEB_ORIGIN API_IMAGE WEB_IMAGE LOG_LEVEL; do
  if ! grep -Eq "^${key}=.+" .env; then
    echo "Production environment is missing ${key}" >&2
    exit 1
  fi
done

umask 077
tmp="$(mktemp)"
awk -v tag="$IMAGE_TAG" '
  BEGIN { updated = 0 }
  /^IMAGE_TAG=/ { print "IMAGE_TAG=" tag; updated = 1; next }
  { print }
  END { if (!updated) print "IMAGE_TAG=" tag }
' .env >"$tmp"
mv "$tmp" .env

docker login ghcr.io --username "$GHCR_ACTOR" --password-stdin

cleanup() {
  docker logout ghcr.io >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker compose pull
docker compose up -d --remove-orphans --wait --wait-timeout 180
docker image prune -af
