#!/bin/bash
# One-time repair if an old updater tries to write /workspace on the Pi.
set -e
APP="${1:-/opt/breakroom-grok}"
if [ ! -f "$APP/package.json" ]; then
  echo "Mill app not found at $APP"
  exit 1
fi
if [ ! -e /workspace ]; then
  sudo ln -sfn "$APP" /workspace
  echo "Linked /workspace -> $APP"
else
  echo "/workspace already exists"
fi
