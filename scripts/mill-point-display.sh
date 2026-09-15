#!/bin/bash
# Make http://display.local/ the Breakroom Display (port 80 → mill TV).
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
NGINX_SRC="$HERE/scripts/mill-nginx.conf"
if [ -d /etc/nginx/sites-available ] && [ -f "$NGINX_SRC" ]; then
  cp "$NGINX_SRC" /etc/nginx/sites-available/mill-display
  if [ -d /etc/nginx/sites-enabled ]; then
    for old in /etc/nginx/sites-enabled/*; do
      [ -e "$old" ] || continue
      name="$(basename "$old" | tr 'A-Z' 'a-z')"
      case "$name" in
        mill-display) ;;
        default|000-default|*breakroom*|*flask*|*python*) rm -f "$old" ;;
      esac
    done
    if [ ! -e /etc/nginx/sites-enabled/mill-display ]; then
      ln -sf /etc/nginx/sites-available/mill-display /etc/nginx/sites-enabled/mill-display
    fi
  fi
  nginx -t >/dev/null 2>&1 || true
  systemctl reload nginx >/dev/null 2>&1 || true
fi
if [ -d /etc/avahi/services ] && [ -f "$HERE/scripts/mill-avahi.service" ]; then
  cp "$HERE/scripts/mill-avahi.service" /etc/avahi/services/breakroom-display.service
  systemctl reload avahi-daemon >/dev/null 2>&1 || true
fi
echo "http://display.local/ now fronts the Breakroom Display."
