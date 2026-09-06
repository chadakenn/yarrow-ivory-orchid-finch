#!/usr/bin/env python3
"""Pack or install the North Baltimore mill workspace zip."""
from __future__ import annotations

import json
import os
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

SKIP_DIRS = {
    "node_modules",
    ".git",
    ".vercel",
    ".grok",
    "dist",
    "screenshots",
    "artifacts",
    "attachments",
    "data",
    ".nitro",
    "Cache",
}
SKIP_FILES = {".ds_store", "thumbs.db"}
ALLOWED_TOP = {
    "src",
    "public",
    "scripts",
    "server",
    "migrations",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
    "eslint.config.mjs",
    "startup.sh",
    "AGENTS.md",
    "index.html",
}
MARKERS = (
    "src/lib/production.ts",
    "src/components/display/TvDisplay.tsx",
    "src/routes/index.tsx",
)


def skip_dir(name: str) -> bool:
    return name in SKIP_DIRS or name.startswith(".")


def collect_root(names: list[str]) -> str:
    tops = {n.split("/", 1)[0] for n in names if n and not n.endswith("/")}
    if len(tops) == 1:
        only = next(iter(tops))
        prefixed = [n[len(only) + 1 :] for n in names if n.startswith(only + "/")]
        if any(n == "package.json" or n.startswith("src/") for n in prefixed):
            return only + "/"
    return ""


def is_mill(names: list[str]) -> bool:
    return any(n == m or n.endswith("/" + m) for n in names for m in MARKERS) or (
        "package.json" in names and any(n.startswith("src/") for n in names)
    )


def pack(root: Path, dest: Path) -> int:
    count = 0
    dest.parent.mkdir(parents=True, exist_ok=True)
    prefix = "north-baltimore-mill-workspace/"
    with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED) as zf:
        for dirpath, dirnames, filenames in os.walk(root):
            rel_dir = Path(dirpath).relative_to(root)
            dirnames[:] = [d for d in dirnames if not skip_dir(d)]
            if any(part in SKIP_DIRS for part in rel_dir.parts):
                continue
            for name in filenames:
                if name.lower() in SKIP_FILES:
                    continue
                full = Path(dirpath) / name
                rel = full.relative_to(root).as_posix()
                top = rel.split("/", 1)[0]
                if top not in ALLOWED_TOP and rel not in ALLOWED_TOP:
                    continue
                zf.write(full, prefix + rel)
                count += 1
        meta = {
            "name": "north-baltimore-mill-workspace",
            "kind": "grok-workspace",
            "version": "1.13",
            "poweredBy": "chadak47",
            "files": count,
        }
        zf.writestr(prefix + "mill-workspace.json", json.dumps(meta))
    return count


def install(zip_path: Path, root: Path) -> dict:
    with zipfile.ZipFile(zip_path) as zf:
        names = [n.replace("\\", "/") for n in zf.namelist() if n and not n.endswith("/")]
        if any(".." in n.split("/") for n in names):
            raise SystemExit("That zip has invalid folders.")
        prefix = collect_root(names)
        stripped = [(n, n[len(prefix) :] if prefix and n.startswith(prefix) else n) for n in names]
        inner = [inner_name for _, inner_name in stripped]
        if any(n == "mill-pack.json" for n in inner) and not any(n == "package.json" for n in inner):
            raise SystemExit("That is a TV snapshot zip. Upload the grok-workspace zip instead.")
        if not is_mill(inner):
            raise SystemExit("That zip is not a mill workspace.")
        written = 0
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            for original, inner_name in stripped:
                if not inner_name or inner_name.endswith("/"):
                    continue
                top = inner_name.split("/", 1)[0]
                if top not in ALLOWED_TOP and inner_name not in ALLOWED_TOP:
                    continue
                if inner_name.startswith("data/"):
                    continue
                target = (tmp_path / inner_name).resolve()
                if not str(target).startswith(str(tmp_path.resolve())):
                    continue
                target.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(original) as src, open(target, "wb") as out:
                    shutil.copyfileobj(src, out)
                written += 1
            for dirpath, dirnames, filenames in os.walk(tmp_path):
                for name in filenames:
                    src = Path(dirpath) / name
                    rel = src.relative_to(tmp_path)
                    dest = (root / rel).resolve()
                    if not str(dest).startswith(str(root.resolve())):
                        continue
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(src, dest)
        return {"files": written, "name": prefix.rstrip("/") or "mill-workspace"}


DIR_PREFIXES = ("mill-pack-", "mill-install-", "mill-out")
ZIP_NAMES = {
    "north-baltimore-mill-workspace.zip",
    "upload.zip",
    "from-api.zip",
    "fake-pack.zip",
    "mill-test.zip",
}


def leftover_name(name: str) -> bool:
    lower = name.lower()
    if name.startswith(DIR_PREFIXES) or name.startswith("mill-out"):
        return True
    if lower.endswith(".zip") and (
        lower in ZIP_NAMES
        or "mill-workspace" in lower
        or "grok-workspace" in lower
        or lower.startswith("mill-")
    ):
        return True
    if lower in {"install-res.txt"}:
        return True
    return False


def folder_bytes(path: Path) -> int:
    if path.is_file():
        return path.stat().st_size
    total = 0
    for child in path.rglob("*"):
        if child.is_file():
            try:
                total += child.stat().st_size
            except OSError:
                pass
    return total


def scan_leftovers(root: Path) -> list[dict]:
    seen: set[str] = set()
    items: list[dict] = []
    roots = [Path(tempfile.gettempdir()), Path("/tmp"), Path("/var/tmp"), root, root / "attachments"]
    for base in roots:
        try:
            resolved = base.resolve()
        except OSError:
            continue
        if not resolved.exists() or not resolved.is_dir():
            continue
        try:
            children = list(resolved.iterdir())
        except OSError:
            continue
        for child in children:
            key = str(child)
            if key in seen:
                continue
            if not leftover_name(child.name):
                if not (resolved.name == "attachments" and child.suffix.lower() == ".zip"):
                    continue
            if child.is_dir() and not child.name.startswith(("mill-pack-", "mill-install-", "mill-out")):
                continue
            seen.add(key)
            try:
                size = folder_bytes(child)
            except OSError:
                continue
            items.append(
                {
                    "name": child.name,
                    "where": "workspace" if str(resolved).startswith(str(root.resolve())) else "temp",
                    "bytes": size,
                    "path": str(child),
                }
            )
    items.sort(key=lambda row: row["name"])
    return items


def clean_leftovers(root: Path) -> dict:
    items = scan_leftovers(root)
    removed = []
    bytes_ = 0
    for item in items:
        target = Path(item["path"])
        try:
            if target.is_dir():
                shutil.rmtree(target, ignore_errors=True)
            elif target.is_file():
                target.unlink(missing_ok=True)
            if not target.exists():
                removed.append({"name": item["name"], "where": item["where"], "bytes": item["bytes"]})
                bytes_ += int(item["bytes"])
        except OSError:
            continue
    return {"count": len(removed), "bytes": bytes_, "items": removed}


def list_leftovers(root: Path) -> dict:
    items = [{"name": row["name"], "where": row["where"], "bytes": row["bytes"]} for row in scan_leftovers(root)]
    return {"count": len(items), "bytes": sum(row["bytes"] for row in items), "items": items}


def main() -> None:
    cmd = sys.argv[1]
    if cmd == "pack":
        root = Path(sys.argv[2])
        dest = Path(sys.argv[3])
        count = pack(root, dest)
        print(json.dumps({"files": count, "path": str(dest)}))
        return
    if cmd == "install":
        zip_path = Path(sys.argv[2])
        root = Path(sys.argv[3])
        print(json.dumps(install(zip_path, root)))
        return
    if cmd == "list-temp":
        print(json.dumps(list_leftovers(Path(sys.argv[2]))))
        return
    if cmd == "clean-temp":
        print(json.dumps(clean_leftovers(Path(sys.argv[2]))))
        return
    raise SystemExit("unknown command")


if __name__ == "__main__":
    main()
