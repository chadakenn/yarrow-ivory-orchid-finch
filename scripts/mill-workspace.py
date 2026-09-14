#!/usr/bin/env python3
"""Pack mill zips and apply them with backup, health, and rollback."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import time
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from mill_lib import (  # noqa: E402
    PACK_DIRS,
    PACK_FILES,
    app_root,
    app_version,
    data_root,
    detect_root,
    ensure_data_layout,
    skip_rel,
)


HEALTH_WAIT_MS = 90000


def write_status(payload: dict) -> None:
    root = ensure_data_layout()
    payload = {**payload, "at": int(time.time() * 1000)}
    (root / "updates" / "status.json").write_text(json.dumps(payload, indent=2))


def read_status() -> dict:
    path = ensure_data_layout() / "updates" / "status.json"
    if not path.exists():
        return {"phase": "idle"}
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError:
        return {"phase": "idle"}


def pack(dest: str | None = None) -> str:
    stamp = time.strftime("%Y%m%d-%H%M%S")
    data = ensure_data_layout()
    out = Path(dest or data / "updates" / f"mill-pack-{stamp}.zip")
    out.parent.mkdir(parents=True, exist_ok=True)
    root = app_root()
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
        for folder in PACK_DIRS:
            base = root / folder
            if not base.exists():
                continue
            for path in base.rglob("*"):
                if not path.is_file():
                    continue
                rel = str(path.relative_to(root)).replace("\\", "/")
                if skip_rel(rel):
                    continue
                try:
                    zf.write(path, rel)
                except OSError:
                    continue
        for name in PACK_FILES:
            path = root / name
            if path.is_file():
                zf.write(path, name)
        meta = {
            "app": "breakroom-display",
            "packedAt": int(time.time() * 1000),
            "root": str(root),
            "version": app_version(root),
        }
        zf.writestr("mill-pack.json", json.dumps(meta, indent=2))
    return str(out)


def resolve_dest(dest: str | None) -> Path:
    if dest:
        path = Path(dest).expanduser().resolve()
    else:
        path = app_root()
    if str(path) == "/workspace" and not (path / "package.json").exists():
        path = app_root()
    if not os.access(path, os.W_OK):
        raise PermissionError(f"Cannot write the mill app at {path}.")
    return path


def unpack_zip(zip_path: str, dest_path: Path) -> tuple[int, int]:
    dest_resolved = dest_path.resolve()
    copied = 0
    skipped = 0
    dest_path.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path) as zf:
        names = zf.namelist()
        root = detect_root(names)
        for info in zf.infolist():
            if info.is_dir():
                continue
            raw = info.filename.replace("\\", "/").lstrip("/")
            rel = raw[len(root) :] if root and raw.startswith(root) else raw
            rel = rel.lstrip("/")
            if rel.startswith("workspace/"):
                rel = rel[len("workspace/") :]
            if not rel or skip_rel(rel):
                skipped += 1
                continue
            target = (dest_path / rel).resolve()
            if target != dest_resolved and dest_resolved not in target.parents:
                skipped += 1
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            with zf.open(info) as src, open(target, "wb") as out:
                shutil.copyfileobj(src, out)
            copied += 1
    return copied, skipped


def install(zip_path: str, dest: str | None = None) -> dict:
    dest_path = resolve_dest(dest)
    copied, skipped = unpack_zip(zip_path, dest_path)
    if copied <= 0:
        return {
            "ok": False,
            "copied": 0,
            "skipped": skipped,
            "dest": str(dest_path),
            "message": "That zip did not contain mill app files.",
        }
    return {"ok": True, "copied": copied, "skipped": skipped, "dest": str(dest_path)}


def copy_tree_files(src: Path, dest: Path) -> int:
    copied = 0
    for folder in PACK_DIRS:
        base = src / folder
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if not path.is_file():
                continue
            rel = path.relative_to(src)
            target = dest / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, target)
            copied += 1
    for name in PACK_FILES:
        path = src / name
        if path.is_file():
            shutil.copy2(path, dest / name)
            copied += 1
    return copied


def prune_removed(staging: Path, dest: Path) -> int:
    removed = 0
    for folder in PACK_DIRS:
        dest_base = dest / folder
        if not dest_base.exists():
            continue
        for path in list(dest_base.rglob("*")):
            if not path.is_file():
                continue
            rel = path.relative_to(dest)
            if not (staging / rel).exists():
                path.unlink()
                removed += 1
    return removed


def backup_app(dest: Path) -> Path:
    stamp = time.strftime("%Y%m%d-%H%M%S")
    folder = ensure_data_layout() / "backups" / f"app-{stamp}"
    folder.mkdir(parents=True, exist_ok=True)
    copy_tree_files(dest, folder)
    keep = sorted((ensure_data_layout() / "backups").glob("app-*"), key=lambda p: p.name, reverse=True)
    for extra in keep[8:]:
        shutil.rmtree(extra, ignore_errors=True)
    return folder


def swap_node_modules(staging: Path, dest: Path) -> bool:
    src = staging / "node_modules"
    if not src.exists():
        return False
    live = dest / "node_modules"
    nxt = dest / ".node_modules.next"
    old = dest / ".node_modules.old"
    shutil.rmtree(nxt, ignore_errors=True)
    shutil.move(str(src), str(nxt))
    if old.exists() and live.exists():
        shutil.rmtree(old, ignore_errors=True)
    if live.exists():
        live.rename(old)
    nxt.rename(live)
    return True


def restore_node_modules(dest: Path) -> bool:
    old = dest / ".node_modules.old"
    live = dest / "node_modules"
    if not old.exists():
        return False
    nxt = dest / ".node_modules.bad"
    shutil.rmtree(nxt, ignore_errors=True)
    if live.exists():
        live.rename(nxt)
    old.rename(live)
    shutil.rmtree(nxt, ignore_errors=True)
    return True


def clear_old_modules(dest: Path) -> None:
    shutil.rmtree(dest / ".node_modules.old", ignore_errors=True)
    shutil.rmtree(dest / ".node_modules.next", ignore_errors=True)
    shutil.rmtree(dest / ".node_modules.bad", ignore_errors=True)


def copy_dist(staging: Path, dest: Path) -> bool:
    src = staging / "dist"
    if not src.exists():
        return False
    target = dest / "dist"
    if target.exists():
        shutil.rmtree(target, ignore_errors=True)
    shutil.copytree(src, target)
    return True


def npm(args: list[str], cwd: Path, timeout: int = 240) -> None:
    bin_npm = shutil.which("npm") or "npm"
    result = subprocess.run([bin_npm, *args], cwd=str(cwd), capture_output=True, text=True, timeout=timeout)
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "npm failed").strip()[-500:]
        raise RuntimeError(detail)


def heal_installer(staging: Path, dest: Path) -> None:
    folder = dest / "scripts"
    folder.mkdir(parents=True, exist_ok=True)
    for name in (
        "mill-workspace.py",
        "mill_lib.py",
        "mill-http.mjs",
        "mill-data.py",
        "mill-media.py",
        "mill-zip-plugin.mjs",
    ):
        src = staging / "scripts" / name
        if src.is_file():
            shutil.copy2(src, folder / name)


def lock_changed(staging: Path, dest: Path) -> bool:
    """Compare the NEW zip lock to the LIVE lock. Call this before copy_tree_files()."""
    if not (dest / "node_modules").exists():
        return True
    for name in ("package-lock.json", "package.json"):
        a = staging / name
        b = dest / name
        if not a.exists():
            continue
        if not b.exists() or a.read_bytes() != b.read_bytes():
            return True
    return False


def full_update_mode(dest: Path) -> bool:
    if os.environ.get("MILL_UPDATE_FULL") == "1":
        return True
    if os.environ.get("MILL_UPDATE_FULL") == "0":
        return False
    return str(dest).startswith("/opt/breakroom")


def apply(zip_path: str, dest: str | None = None) -> dict:
    dest_path = resolve_dest(dest)
    data = ensure_data_layout()
    staging = data / "updates" / "next"
    if staging.exists():
        shutil.rmtree(staging, ignore_errors=True)
    staging.mkdir(parents=True, exist_ok=True)
    write_status({"phase": "staging", "message": "Unpacking the new mill app…"})
    copied, skipped = unpack_zip(zip_path, staging)
    if copied <= 0 or not (staging / "package.json").exists():
        shutil.rmtree(staging, ignore_errors=True)
        write_status({"phase": "error", "message": "That zip did not contain mill app files."})
        return {"ok": False, "copied": copied, "skipped": skipped, "message": "That zip did not contain mill app files."}

    healer = staging / "scripts" / "mill-workspace.py"
    if os.environ.get("MILL_APPLY_SELF") != "1" and healer.is_file():
        if healer.read_bytes() != Path(__file__).read_bytes():
            write_status({"phase": "staging", "message": "Using the installer from the zip…"})
            env = os.environ.copy()
            env["MILL_APPLY_SELF"] = "1"
            result = subprocess.run(
                [sys.executable, str(healer), "apply", zip_path, str(dest_path)],
                cwd=str(dest_path),
                capture_output=True,
                text=True,
                timeout=900,
                env=env,
            )
            payload = (result.stdout or "").strip()
            line = payload.splitlines()[-1] if payload else ""
            try:
                parsed = json.loads(line)
            except json.JSONDecodeError:
                parsed = {
                    "ok": False,
                    "message": (result.stderr or payload or "Installer from zip failed")[-500:],
                }
            return parsed

    # Compare the live lock BEFORE copy_tree_files overwrites it.
    needs_deps = full_update_mode(dest_path) and lock_changed(staging, dest_path)
    modules = False
    if needs_deps:
        write_status({"phase": "deps", "message": "Installing new mill packages…"})
        try:
            npm(["ci", "--no-audit", "--no-fund"], staging, timeout=420)
            modules = (staging / "node_modules").exists()
        except Exception as err:
            write_status({"phase": "deps", "message": f"Kept the running packages. {str(err)[:160]}"})
            modules = False

    heal_installer(staging, dest_path)

    write_status({"phase": "backup", "message": "Saving a restore copy of the running mill…"})
    backup = backup_app(dest_path)

    write_status({"phase": "swap", "message": "Putting the new mill app in place…", "backup": str(backup)})
    copied = copy_tree_files(staging, dest_path)
    pruned = prune_removed(staging, dest_path)
    built = copy_dist(staging, dest_path)
    swapped = False
    if modules:
        swapped = swap_node_modules(staging, dest_path)
    shutil.rmtree(staging, ignore_errors=True)

    pending = {
        "backup": str(backup),
        "dest": str(dest_path),
        "at": int(time.time() * 1000),
        "waitMs": HEALTH_WAIT_MS,
    }
    (data / "updates" / "pending-health.json").write_text(json.dumps(pending))
    write_status(
        {
            "phase": "health",
            "message": "Restarting the mill TV…",
            "backup": str(backup),
            "copied": copied,
            "pruned": pruned,
        }
    )
    try:
        subprocess.run(
            [
                "python3",
                str(Path(__file__).resolve().parent / "mill-data.py"),
                "log",
                "update-installed",
                f"Installed {copied} files",
            ],
            cwd=str(app_root()),
            capture_output=True,
            timeout=20,
        )
    except Exception:
        pass
    return {
        "ok": True,
        "copied": copied,
        "pruned": pruned,
        "skipped": skipped,
        "dest": str(dest_path),
        "data": str(data),
        "backup": str(backup),
        "full": full_update_mode(dest_path),
        "modules": swapped,
        "built": built,
        "restart": True,
        "message": f"Installed {copied} files. Mill data stayed in {data}.",
    }


def rollback(backup: str | None = None) -> dict:
    dest = app_root()
    data = ensure_data_layout()
    folder = Path(backup) if backup else None
    if folder is None:
        backups = sorted((data / "backups").glob("app-*"), key=lambda p: p.name, reverse=True)
        folder = backups[0] if backups else None
    if folder is None or not folder.exists():
        return {"ok": False, "message": "No mill backup to restore."}
    write_status({"phase": "rollback", "message": f"Restoring {folder.name}…", "backup": str(folder)})
    copied = copy_tree_files(folder, dest)
    pruned = prune_removed(folder, dest)
    restore_node_modules(dest)
    copy_dist(folder, dest)
    pending = data / "updates" / "pending-health.json"
    if pending.exists():
        pending.unlink()
    write_status({"phase": "rolled-back", "message": f"Restored {folder.name}.", "backup": str(folder), "copied": copied, "pruned": pruned})
    return {"ok": True, "copied": copied, "pruned": pruned, "backup": str(folder), "dest": str(dest), "restart": True}


def health_ok(url: str = "http://127.0.0.1:8080/") -> bool:
    for _ in range(3):
        try:
            result = subprocess.run(
                ["curl", "-sf", "-o", "/dev/null", "--max-time", "5", url],
                check=False,
                capture_output=True,
                timeout=8,
            )
            if result.returncode == 0:
                return True
        except Exception:
            pass
        time.sleep(2)
    return False


def finish_health() -> dict:
    data = ensure_data_layout()
    pending_path = data / "updates" / "pending-health.json"
    if not pending_path.exists():
        status = read_status()
        if status.get("phase") == "health":
            write_status({**status, "phase": "done", "message": "Mill TV is running."})
        return {"ok": True, "pending": False, "status": read_status()}
    pending = json.loads(pending_path.read_text())
    age = int(time.time() * 1000) - int(pending.get("at") or 0)
    wait_for = int(pending.get("waitMs") or HEALTH_WAIT_MS)
    if health_ok():
        pending_path.unlink(missing_ok=True)
        clear_old_modules(app_root())
        write_status({"phase": "done", "message": "Mill TV is running.", "backup": pending.get("backup")})
        return {"ok": True, "pending": False, "status": read_status()}
    if age < wait_for:
        write_status(
            {
                "phase": "health",
                "message": "Waiting for the mill TV to come back…",
                "backup": pending.get("backup"),
            }
        )
        return {"ok": True, "pending": True, "wait": True, "age": age, "status": read_status()}
    rolled = rollback(pending.get("backup"))
    return {"ok": False, "rolledBack": True, "result": rolled, "status": read_status()}


def list_backups() -> list[dict]:
    rows = []
    folder = ensure_data_layout() / "backups"
    if not folder.exists():
        return rows
    for path in sorted(folder.glob("app-*"), key=lambda p: p.name, reverse=True):
        size = 0
        for item in path.rglob("*"):
            if item.is_file():
                size += item.stat().st_size
        rows.append({"name": path.name, "path": str(path), "bytes": size})
    return rows


def list_temp() -> list[dict]:
    rows = []
    for folder in (Path("/tmp"), app_root() / "attachments", ensure_data_layout() / "updates"):
        if not folder.exists():
            continue
        for path in folder.glob("*"):
            name = path.name
            if not path.is_file():
                continue
            if not (
                name.startswith("mill-pack-")
                or name.startswith("mill-upload-")
                or name.endswith("-grok-workspace.zip")
                or name.endswith("grok-workspace.zip")
                or name.startswith("ControlRoom-")
            ):
                continue
            stat = path.stat()
            rows.append({"path": str(path), "name": name, "bytes": stat.st_size, "mtime": int(stat.st_mtime)})
    return rows


def clean_temp() -> dict:
    removed = []
    bytes_freed = 0
    for row in list_temp():
        path = Path(row["path"])
        try:
            bytes_freed += path.stat().st_size
            path.unlink()
            removed.append(row["name"])
        except OSError:
            continue
    for path in Path("/tmp").glob("mill-*"):
        try:
            if path.is_file():
                bytes_freed += path.stat().st_size
                path.unlink()
                removed.append(path.name)
            elif path.is_dir() and path.name.startswith("mill-"):
                shutil.rmtree(path, ignore_errors=True)
                removed.append(path.name)
        except OSError:
            continue
    staging = ensure_data_layout() / "updates" / "next"
    if staging.exists():
        shutil.rmtree(staging, ignore_errors=True)
        removed.append("updates/next")
    return {"ok": True, "removed": removed, "bytes": bytes_freed}


def main(argv: list[str]) -> int:
    cmd = argv[1] if len(argv) > 1 else ""
    try:
        ensure_data_layout()
        if cmd == "pack":
            dest = argv[2] if len(argv) > 2 else None
            print(pack(dest))
            return 0
        if cmd == "install":
            zip_path = argv[2]
            dest = argv[3] if len(argv) > 3 else None
            print(json.dumps(apply(zip_path, dest)))
            return 0
        if cmd == "apply":
            print(json.dumps(apply(argv[2], argv[3] if len(argv) > 3 else None)))
            return 0
        if cmd == "rollback":
            print(json.dumps(rollback(argv[2] if len(argv) > 2 else None)))
            return 0
        if cmd == "status":
            print(
                json.dumps(
                    {
                        "ok": True,
                        "app": str(app_root()),
                        "data": str(data_root()),
                        "status": read_status(),
                        "backups": list_backups(),
                    }
                )
            )
            return 0
        if cmd == "health":
            print(json.dumps(finish_health()))
            return 0
        if cmd == "list-temp":
            print(json.dumps(list_temp()))
            return 0
        if cmd == "clean-temp":
            print(json.dumps(clean_temp()))
            return 0
        if cmd == "root":
            print(json.dumps({"app": str(app_root()), "data": str(data_root())}))
            return 0
    except Exception as err:
        write_status({"phase": "error", "message": str(err)})
        print(json.dumps({"ok": False, "message": str(err)}))
        return 1
    print("usage: mill-workspace.py pack|install|apply|rollback|status|health|clean-temp", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
