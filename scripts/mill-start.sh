#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export MILL_APP="${MILL_APP:-$ROOT}"
if [ -z "${MILL_DATA:-}" ]; then
  if [ -d /opt/breakroom-data ]; then
    export MILL_DATA=/opt/breakroom-data
  else
    export MILL_DATA="$ROOT/data"
  fi
fi
chmod +x "$ROOT/scripts/mill-set-clock.sh" "$ROOT/scripts/mill-reboot.sh" "$ROOT/scripts/mill-start.sh" 2>/dev/null || true
if [ "$(id -u)" = "0" ] && [ -d /etc/sudoers.d ] && [ -f "$ROOT/scripts/mill-clock.sudoers" ]; then
  cp "$ROOT/scripts/mill-clock.sudoers" /etc/sudoers.d/mill-clock
  chmod 440 /etc/sudoers.d/mill-clock
fi

# Install the rescue watchdog once, outside the app folder. Later zips must not replace it.
WATCH_DIR="/opt/breakroom-watchdog"
if mkdir -p "$WATCH_DIR" 2>/dev/null; then
  if [ ! -f "$WATCH_DIR/mill-watchdog.py" ] && [ -f "$ROOT/scripts/mill-watchdog.py" ]; then
    cp "$ROOT/scripts/mill-watchdog.py" "$WATCH_DIR/mill-watchdog.py"
    chmod +x "$WATCH_DIR/mill-watchdog.py" || true
  fi
  if [ "$(id -u)" = "0" ] && command -v systemctl >/dev/null 2>&1 && [ -f "$ROOT/scripts/mill-watchdog.service" ]; then
    cp "$ROOT/scripts/mill-watchdog.service" /etc/systemd/system/mill-watchdog.service
    systemctl daemon-reload >/dev/null 2>&1 || true
    systemctl enable --now mill-watchdog.service >/dev/null 2>&1 || true
  fi
fi

# Vite is the mill TV until a real `npm run build:pi` lands at dist/client.
if [ "${MILL_PROD:-}" = "1" ] && [ -f "$ROOT/dist/client/index.html" ]; then
  exec node "$ROOT/scripts/mill-server.mjs"
fi
exec npm run dev
