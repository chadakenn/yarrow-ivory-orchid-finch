#!/usr/bin/env python3
"""Plant-data snapshots, restore, and the mill audit log."""
from __future__ import annotations

import json
import shutil
import sys
import time
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from mill_lib import data_root, ensure_data_layout, mill_now  # noqa: E402

SNAPSHOT_FILES = ("kiosk-board.json", "kiosk-decks.json", "mill-log.jsonl", "mill-clock.json")
EVENT_PREFIX = {
    "snapshot-manual": "manual",
    "pre-restore": "pre-restore",
    "week-locked": "event",
    "week-corrected": "event",
    "production-reset": "event",
    "saturday-book": "event",
    "update-installed": "event",
}
SNAPSHOT_EVENTS = set(EVENT_PREFIX)
DAILY_KEEP = 7
WEEKLY_KEEP = 4
EVENT_KEEP = 12
LOG_KEEP = 400


def _now() -> datetime:
    return mill_now()


def _copy_runtime(dest: Path, include_media: bool = True) -> int:
    dest.mkdir(parents=True, exist_ok=True)
    copied = 0
    root = ensure_data_layout()
    for name in SNAPSHOT_FILES:
        src = root / name
        if src.is_file():
            shutil.copy2(src, dest / name)
            copied += 1
    if include_media:
        media = root / "media"
        if media.exists():
            target = dest / "media"
            if target.exists():
                shutil.rmtree(target, ignore_errors=True)
            shutil.copytree(media, target, dirs_exist_ok=True)
            copied += 1
    return copied


def _prune(prefix: str, keep: int) -> None:
    folder = ensure_data_layout() / "backups"
    rows = sorted([p for p in folder.glob(prefix) if p.is_dir()], key=lambda p: p.name, reverse=True)
    for extra in rows[keep:]:
        shutil.rmtree(extra, ignore_errors=True)


def snapshot(reason: str = "auto") -> dict:
    root = ensure_data_layout()
    now = _now()
    stamp = now.strftime("%Y%m%d-%H%M%S")
    prefix = EVENT_PREFIX.get(reason)
    if prefix:
        name = f"{prefix}-{stamp}"
        dest = root / "backups" / name
        copied = _copy_runtime(dest, include_media=True)
        (dest / "meta.json").write_text(
            json.dumps({"at": now.isoformat(timespec="seconds"), "reason": reason, "copied": copied}, indent=2)
        )
        _prune(f"{prefix}-*", EVENT_KEEP)
        _prune("event-*", EVENT_KEEP)
        _prune("manual-*", EVENT_KEEP)
        _prune("pre-restore-*", EVENT_KEEP)
        return {"ok": True, "name": name, "copied": copied, "reason": reason}

    daily_name = now.strftime("data-daily-%Y%m%d")
    dest = root / "backups" / daily_name
    if dest.exists():
        copied = 0
    else:
        copied = _copy_runtime(dest, include_media=True)
        (dest / "meta.json").write_text(
            json.dumps({"at": now.isoformat(timespec="seconds"), "reason": reason, "copied": copied}, indent=2)
        )
    _prune("data-daily-*", DAILY_KEEP)
    week_name = now.strftime("data-weekly-%G-W%V")
    week_dest = root / "backups" / week_name
    if not week_dest.exists():
        _copy_runtime(week_dest, include_media=True)
        (week_dest / "meta.json").write_text(
            json.dumps({"at": now.isoformat(timespec="seconds"), "reason": f"weekly:{reason}"}, indent=2)
        )
        _prune("data-weekly-*", WEEKLY_KEEP)
    return {"ok": True, "name": daily_name, "weekly": week_name, "copied": copied, "reason": reason}


def list_snapshots() -> list[dict]:
    folder = ensure_data_layout() / "backups"
    rows = []
    if not folder.exists():
        return rows
    for path in sorted(folder.iterdir(), key=lambda p: p.name, reverse=True):
        if not path.is_dir():
            continue
        if path.name.startswith("app-"):
            continue
        meta = {}
        meta_path = path / "meta.json"
        if meta_path.exists():
            try:
                meta = json.loads(meta_path.read_text())
            except json.JSONDecodeError:
                meta = {}
        size = sum(item.stat().st_size for item in path.rglob("*") if item.is_file())
        kind = "daily"
        if "weekly" in path.name:
            kind = "weekly"
        elif path.name.startswith("manual-"):
            kind = "manual"
        elif path.name.startswith("pre-restore-"):
            kind = "pre-restore"
        elif path.name.startswith("event-"):
            kind = "event"
        rows.append({"name": path.name, "kind": kind, "bytes": size, **meta})
    return rows


def restore(name: str) -> dict:
    root = ensure_data_layout()
    src = (root / "backups" / name).resolve()
    backups = (root / "backups").resolve()
    if backups not in src.parents and src != backups:
        return {"ok": False, "message": "That snapshot is not in mill backups."}
    if not src.is_dir():
        return {"ok": False, "message": "Snapshot not found."}
    snapshot("pre-restore")
    restored = []
    for filename in SNAPSHOT_FILES:
        piece = src / filename
        if not piece.is_file():
            continue
        dest = root / filename
        if filename == "kiosk-board.json":
            try:
                payload = json.loads(piece.read_text())
                payload["updatedAt"] = int(time.time() * 1000)
                dest.write_text(json.dumps(payload))
            except json.JSONDecodeError:
                shutil.copy2(piece, dest)
        else:
            shutil.copy2(piece, dest)
        restored.append(filename)
    media_src = src / "media"
    if media_src.exists():
        media_dest = root / "media"
        media_dest.mkdir(parents=True, exist_ok=True)
        shutil.copytree(media_src, media_dest, dirs_exist_ok=True)
        restored.append("media")
    append_log("mill-restored", f"Restored {name}", snap=False)
    return {"ok": True, "name": name, "restored": restored}


def append_log(event: str, detail: str = "", snap: bool | None = None) -> dict:
    root = ensure_data_layout()
    path = root / "mill-log.jsonl"
    row = {
        "at": _now().isoformat(timespec="seconds"),
        "event": event,
        "detail": detail,
    }
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row) + "\n")
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
        if len(lines) > LOG_KEEP:
            path.write_text("\n".join(lines[-LOG_KEEP:]) + "\n", encoding="utf-8")
    except OSError:
        pass
    snapped = None
    should = EVENT_PREFIX.get(event) if snap is None else snap
    if should:
        snapped = snapshot(event)
    return {"ok": True, "entry": row, "snapshot": snapped}


def read_log(limit: int = 80) -> list[dict]:
    path = ensure_data_layout() / "mill-log.jsonl"
    if not path.exists():
        return []
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines()[-limit:]:
        line = line.strip()
        if not line:
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    rows.reverse()
    return rows


def persist_ok() -> dict:
    root = ensure_data_layout()
    probe = root / "updates" / "persist-probe"
    try:
        payload = str(int(time.time() * 1000))
        tmp = probe.with_suffix(".tmp")
        tmp.write_text(payload)
        tmp.replace(probe)
        if probe.read_text() != payload:
            return {"ok": False, "message": "Mill disk wrote the wrong bytes."}
        return {"ok": True, "at": int(time.time() * 1000)}
    except OSError as err:
        return {"ok": False, "message": str(err)}


def main(argv: list[str]) -> int:
    cmd = argv[1] if len(argv) > 1 else ""
    try:
        ensure_data_layout()
        if cmd == "snapshot":
            print(json.dumps(snapshot(argv[2] if len(argv) > 2 else "snapshot-manual")))
            return 0
        if cmd == "list":
            print(json.dumps({"ok": True, "snapshots": list_snapshots(), "data": str(data_root())}))
            return 0
        if cmd == "restore":
            print(json.dumps(restore(argv[2])))
            return 0
        if cmd == "log":
            event = argv[2] if len(argv) > 1 + 1 else "note"
            detail = argv[3] if len(argv) > 3 else ""
            print(json.dumps(append_log(event, detail)))
            return 0
        if cmd == "read-log":
            print(json.dumps({"ok": True, "entries": read_log(int(argv[2]) if len(argv) > 2 else 80)}))
            return 0
        if cmd == "persist":
            print(json.dumps(persist_ok()))
            return 0
    except Exception as err:
        print(json.dumps({"ok": False, "message": str(err)}))
        return 1
    print("usage: mill-data.py snapshot|list|restore|log|read-log|persist", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
