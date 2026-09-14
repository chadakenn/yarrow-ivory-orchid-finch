#!/bin/bash
# Reboot the mill Pi from Admin. Keep this tiny so sudoers can allow it.
set -euo pipefail
if command -v systemctl >/dev/null 2>&1; then
  exec systemctl reboot
fi
exec /sbin/reboot
