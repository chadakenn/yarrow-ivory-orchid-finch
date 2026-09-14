#!/usr/bin/env python3
"""One mill update watchdog. Lives in /opt/breakroom-watchdog so an app zip cannot replace it."""
from __future__ import annotations

import json
import os
import shutil
import signal
import subprocess
import sys
import time
from pathlib import Path

WAIT_MS = 90000
LOOP_SEC = 8
PACK_DIRS = ("src", "public", "scripts", "server", "migrations")
PACK_FILES = (
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "tsconfig.json",
    "eslint.config.mjs",
    "startup.sh",
    "AGENTS.md",
)


def app_root() -> Path:
    env = os.environ.get("MILL_APP")
    if env:
        return Path(env).expanduser().resolve()
    return Path("/opt/breakroom-grok")


def data_root() -> Path:
    env = os.environ.get("MILL_DATA")
    if env:
        return Path(env).expanduser().resolve()
    if Path("/opt/breakroom-data").is_dir():
        return Path("/opt/breakroom-data")
    return app_root() / "data"


def pending_path() -> Path:
    return data_root() / "updates" / "pending-health.json"


def pid_path() -> Path:
    folder = data_root() / "updates"
    folder.mkdir(parents=True, exist_ok=True)
    return folder / "watchdog.pid"


def stop_other_watchdogs() -> int:
    """Kill leftover mill-watchdog.py processes from old Node/start.sh spawns."""
    mine = os.getpid()
    killed = 0
    proc = Path("/proc")
    if not proc.is_dir():
        return 0
    for entry in proc.iterdir():
        if not entry.name.isdigit():
            continue
        pid = int(entry.name)
        if pid == mine:
            continue
        try:
            cmd = (entry / "cmdline").read_bytes().replace(b"\x00", b" ").decode("utf-8", "ignore")
        except OSError:
            continue
        if "mill-watchdog.py" not in cmd:
            continue
        try:
            os.kill(pid, signal.SIGTERM)
            killed += 1
        except OSError:
            continue
    return killed


def curl_ok(url: str = "http://127.0.0.1:8080/") -> bool:
    try:
        result = subprocess.run(
            ["curl", "-sf", "-o", "/dev/null", "--max-time", "5", url],
            check=False,
            capture_output=True,
            timeout=8,
        )
        return result.returncode == 0
    except Exception:
        return False


def copy_tree(src: Path, dest: Path) -> int:
    copied = 0
    for folder in PACK_DIRS:
        base = src / folder
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if not path.is_file():
                continue
            target = dest / path.relative_to(src)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, target)
            copied += 1
    for name in PACK_FILES:
        path = src / name
        if path.is_file():
            shutil.copy2(path, dest / name)
            copied += 1
    return copied


def restore_modules(dest: Path) -> None:
    old = dest / ".node_modules.old"
    live = dest / "node_modules"
    if not old.exists():
        return
    bad = dest / ".node_modules.bad"
    shutil.rmtree(bad, ignore_errors=True)
    if live.exists():
        live.rename(bad)
    old.rename(live)
    shutil.rmtree(bad, ignore_errors=True)


def rollback_backup(backup: str | None, dest: str | None) -> dict:
    folder = Path(backup) if backup else None
    if folder is None or not folder.exists():
        backups = sorted((data_root() / "backups").glob("app-*"), key=lambda p: p.name, reverse=True)
        folder = backups[0] if backups else None
    target = Path(dest) if dest else app_root()
    if folder is None or not folder.exists():
        return {"ok": False, "message": "No mill backup to restore."}
    copied = copy_tree(folder, target)
    restore_modules(target)
    pending = pending_path()
    if pending.exists():
        pending.unlink()
    status = data_root() / "updates" / "status.json"
    status.parent.mkdir(parents=True, exist_ok=True)
    status.write_text(
        json.dumps(
            {
                "phase": "rolled-back",
                "message": f"Restored {folder.name}.",
                "backup": str(folder),
                "copied": copied,
                "at": int(time.time() * 1000),
            },
            indent=2,
        )
    )
    return {"ok": True, "rolledBack": True, "copied": copied, "backup": str(folder)}


def run_app_health() -> dict | None:
    work = app_root() / "scripts" / "mill-workspace.py"
    if not work.is_file():
        return None
    try:
        result = subprocess.run(
            ["python3", str(work), "health"],
            cwd=str(app_root()),
            capture_output=True,
            text=True,
            timeout=180,
            env={
                **os.environ,
                "MILL_APP": os.environ.get("MILL_APP", str(app_root())),
                "MILL_DATA": os.environ.get("MILL_DATA", str(data_root())),
            },
        )
        text = (result.stdout or "").strip() or (result.stderr or "").strip()
        return json.loads(text.splitlines()[-1])
    except Exception:
        return None


def check_once() -> dict:
    path = pending_path()
    if not path.exists():
        return {"ok": True, "pending": False}
    try:
        pending = json.loads(path.read_text())
    except json.JSONDecodeError:
        path.unlink(missing_ok=True)
        return {"ok": True, "pending": False}
    age = int(time.time() * 1000) - int(pending.get("at") or 0)
    wait_for = int(pending.get("waitMs") or WAIT_MS)
    if age < wait_for:
        return {"ok": True, "pending": True, "wait": True, "age": age}

    health = run_app_health()
    if health:
        if health.get("wait") or (health.get("ok") and not health.get("rolledBack")):
            return {"ok": True, "pending": health.get("pending", False), "health": health}
        if health.get("rolledBack"):
            return {"ok": False, "rolledBack": True, "health": health}

    if curl_ok():
        path.unlink(missing_ok=True)
        return {"ok": True, "pending": False, "curl": True}

    rolled = rollback_backup(pending.get("backup"), pending.get("dest"))
    return {"ok": False, "rolledBack": True, "result": rolled}


def loop() -> None:
    stop_other_watchdogs()
    pid_path().write_text(str(os.getpid()))
    while True:
        try:
            check_once()
        except Exception:
            pass
        time.sleep(LOOP_SEC)


def main(argv: list[str]) -> int:
    cmd = argv[1] if len(argv) > 1 else "loop"
    if cmd == "once":
        print(json.dumps(check_once()))
        return 0
    loop()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
