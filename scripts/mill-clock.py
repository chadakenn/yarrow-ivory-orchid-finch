#!/usr/bin/env python3
"""Phone-to-Pi clock sync for birthdays, announcements, and week handling."""
from __future__ import annotations

import json
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from mill_lib import ensure_data_layout  # noqa: E402


def clock_file() -> Path:
    return ensure_data_layout() / "mill-clock.json"


def read_clock() -> dict:
    path = clock_file()
    if not path.exists():
        now = int(time.time() * 1000)
        return {"ok": True, "piEpoch": now, "skewMs": 0, "syncedAt": None, "systemSet": False}
    try:
        data = json.loads(path.read_text())
    except json.JSONDecodeError:
        now = int(time.time() * 1000)
        return {"ok": True, "piEpoch": now, "skewMs": 0, "syncedAt": None, "systemSet": False}
    data["ok"] = True
    data["piEpoch"] = int(time.time() * 1000)
    data["millEpoch"] = data["piEpoch"] + int(data.get("skewMs") or 0)
    return data


def try_set_system(epoch_ms: int) -> bool:
    seconds = max(0, int(epoch_ms / 1000))
    helper = Path(__file__).resolve().parent / "mill-set-clock.sh"
    cmds: list[list[str]] = []
    if helper.is_file():
        cmds.append(["sudo", "-n", str(helper), str(seconds)])
        cmds.append([str(helper), str(seconds)])
    stamp = datetime.fromtimestamp(seconds).strftime("%Y-%m-%d %H:%M:%S")
    cmds.extend(
        [
            ["sudo", "-n", "timedatectl", "set-ntp", "false"],
            ["sudo", "-n", "timedatectl", "set-time", stamp],
            ["timedatectl", "set-ntp", "false"],
            ["timedatectl", "set-time", stamp],
            ["sudo", "-n", "date", "-s", stamp],
            ["date", "-s", stamp],
        ]
    )
    saw_set_time = False
    for cmd in cmds:
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
            if result.returncode == 0 and any(part in {"set-time", "-s"} or str(part).endswith("mill-set-clock.sh") for part in cmd):
                saw_set_time = True
                if abs(int(time.time()) - seconds) < 8:
                    return True
        except Exception:
            continue
    return saw_set_time and abs(int(time.time()) - seconds) < 8


def sync(epoch_ms: int) -> dict:
    phone = int(epoch_ms)
    pi = int(time.time() * 1000)
    system_set = try_set_system(phone)
    pi_after = int(time.time() * 1000)
    skew = 0 if system_set else phone - pi_after
    payload = {
        "ok": True,
        "phoneEpoch": phone,
        "piEpoch": pi_after,
        "skewMs": skew,
        "syncedAt": datetime.fromtimestamp(phone / 1000).astimezone().isoformat(timespec="seconds"),
        "systemSet": system_set,
    }
    clock_file().write_text(json.dumps(payload, indent=2))
    return payload


def main(argv: list[str]) -> int:
    cmd = argv[1] if len(argv) > 1 else "status"
    try:
        ensure_data_layout()
        if cmd == "status":
            print(json.dumps(read_clock()))
            return 0
        if cmd == "sync":
            print(json.dumps(sync(int(argv[2]))))
            return 0
    except Exception as err:
        print(json.dumps({"ok": False, "message": str(err)}))
        return 1
    print("usage: mill-clock.py status|sync <epochMs>", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
