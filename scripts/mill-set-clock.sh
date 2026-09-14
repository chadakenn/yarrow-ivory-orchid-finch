#!/bin/bash
# Set the Pi system clock from a phone epoch (seconds or milliseconds).
set -euo pipefail
EPOCH="${1:-}"
if ! [[ "${EPOCH}" =~ ^[0-9]{9,13}$ ]]; then
  echo "bad epoch" >&2
  exit 1
fi
if [ "${#EPOCH}" -gt 10 ]; then
  EPOCH=$((EPOCH / 1000))
fi
if command -v timedatectl >/dev/null 2>&1; then
  timedatectl set-ntp false >/dev/null 2>&1 || true
fi
STAMP=""
if date -d "@${EPOCH}" "+%Y-%m-%d %H:%M:%S" >/dev/null 2>&1; then
  STAMP="$(date -d "@${EPOCH}" "+%Y-%m-%d %H:%M:%S")"
elif date -r "${EPOCH}" "+%Y-%m-%d %H:%M:%S" >/dev/null 2>&1; then
  STAMP="$(date -r "${EPOCH}" "+%Y-%m-%d %H:%M:%S")"
fi
if [ -n "${STAMP}" ] && command -v timedatectl >/dev/null 2>&1; then
  timedatectl set-time "${STAMP}" && exit 0
fi
date -s "@${EPOCH}"
