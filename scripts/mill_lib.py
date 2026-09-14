"""Shared mill paths: app code and plant data live in different houses."""
from __future__ import annotations

import json
import os
import time
from datetime import datetime
from pathlib import Path

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
SKIP_PREFIXES = (
    "node_modules/",
    ".git/",
    ".vercel/",
    "dist/",
    "artifacts/",
    "screenshots/",
    "attachments/",
    "data/",
    ".nitro/",
    ".output/",
    ".data/",
)
SKIP_NAMES = {".env", ".env.local", ".DS_Store", "mill-pack.json"}


def app_root() -> Path:
    env = os.environ.get("MILL_APP")
    if env:
        return Path(env).expanduser().resolve()
    here = Path(__file__).resolve().parent.parent
    cwd = Path.cwd()
    for candidate in (here, cwd):
        if (candidate / "package.json").exists() or (candidate / "src").exists():
            return candidate
    return here


def data_root() -> Path:
    env = os.environ.get("MILL_DATA")
    if env:
        path = Path(env).expanduser().resolve()
        path.mkdir(parents=True, exist_ok=True)
        return path
    app = app_root()
    if str(app).startswith("/opt/breakroom"):
        path = Path("/opt/breakroom-data")
        try:
            path.mkdir(parents=True, exist_ok=True)
            return path
        except OSError:
            pass
    path = app / "data"
    path.mkdir(parents=True, exist_ok=True)
    return path


def ensure_data_layout() -> Path:
    root = data_root()
    for name in ("media", "backups", "updates", "originals", "trash"):
        (root / name).mkdir(parents=True, exist_ok=True)
    app = app_root()
    nested = app / "data"
    if nested.resolve() != root.resolve() and nested.exists():
        for name in ("kiosk-board.json", "kiosk-decks.json"):
            src = nested / name
            dest = root / name
            if src.is_file() and not dest.exists():
                dest.write_bytes(src.read_bytes())
    return root


def mill_skew_ms() -> int:
    path = data_root() / "mill-clock.json"
    try:
        data = json.loads(path.read_text())
        return int(data.get("skewMs") or 0)
    except Exception:
        return 0


def mill_now_ms() -> int:
    return int(time.time() * 1000) + mill_skew_ms()


def mill_now() -> datetime:
    return datetime.fromtimestamp(mill_now_ms() / 1000).astimezone()


def skip_rel(rel: str) -> bool:
    name = os.path.basename(rel)
    if name in SKIP_NAMES or name.endswith(".zip") or name.endswith(".pyc"):
        return True
    if "/__pycache__/" in f"/{rel}/" or rel.startswith("__pycache__/"):
        return True
    return any(rel.startswith(prefix) for prefix in SKIP_PREFIXES)


def app_version(root: Path | None = None) -> str:
    brand = (root or app_root()) / "src/lib/brand.ts"
    try:
        for line in brand.read_text().splitlines():
            if "APP_VERSION" in line and "=" in line:
                return line.split("=", 1)[-1].strip().strip(";").strip("\"'")
    except OSError:
        pass
    return "unknown"


def detect_root(names: list[str]) -> str:
    cleaned = [name.replace("\\", "/").lstrip("/") for name in names]
    markers = ("package.json", "src/router.tsx", "src/components/control/ControlRoom.tsx")
    for marker in markers:
        if marker in cleaned:
            return ""
        for name in cleaned:
            if name.endswith("/" + marker):
                return name[: -len(marker)]
    prefixes = {name.split("/", 1)[0] + "/" for name in cleaned if "/" in name}
    if len(prefixes) == 1:
        return next(iter(prefixes))
    return ""
