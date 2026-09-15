#!/bin/bash
# Put the mill TV back on this Pi. Does not touch tons, slides, or people.
# Usage:
#   unzip the mill zip
#   sudo bash scripts/mill-reinstall.sh
#   or: sudo bash scripts/mill-reinstall.sh /path/to/mill.zip
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
if [ "$(id -u)" != "0" ]; then
  echo "On the Pi, run: sudo bash $HERE/scripts/mill-reinstall.sh"
  exit 1
fi
export MILL_APP="${MILL_APP:-/opt/breakroom-grok}"
export MILL_DATA="${MILL_DATA:-/opt/breakroom-data}"
chmod +x "$HERE/scripts/mill-start.sh" "$HERE/scripts/mill-reboot.sh" "$HERE/scripts/mill-set-clock.sh" "$HERE/scripts/mill-reinstall.sh" "$HERE/scripts/mill-point-display.sh" 2>/dev/null || true
python3 "$HERE/scripts/mill-workspace.py" reinstall "${1:-}"
bash "$HERE/scripts/mill-point-display.sh" || true
echo
echo "Give the TV two minutes. Open display.local on your phone."
echo "Tons, slides, and people stay. http://display.local/ is the Breakroom Display."
