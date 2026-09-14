#!/usr/bin/env python3
"""Turn phone photos, PowerPoint, and PDF into TV-sized JPEG slides on disk."""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from mill_lib import data_root, ensure_data_layout

MAX_W = 1920
MAX_H = 1080
MAX_PAGES = 80
JPEG_QUALITY = 85


def which(*names: str) -> str | None:
    for name in names:
        found = shutil.which(name)
        if found:
            return found
    for path in names:
        if path.startswith("/") and Path(path).exists():
            return path
    extra = (
        "/usr/bin/soffice",
        "/usr/bin/libreoffice",
        "/usr/lib/libreoffice/program/soffice",
        "/usr/bin/pdftoppm",
        "/usr/bin/gs",
        "/usr/bin/ffmpeg",
    )
    for path in extra:
        if Path(path).exists():
            return path
    return None


def run(cmd: list[str], timeout: int = 180) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=timeout)


def save_jpeg(src: Path, dest: Path) -> None:
    from PIL import Image, ImageOps

    dest.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as image:
        image = ImageOps.exif_transpose(image)
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")
        elif image.mode == "L":
            image = image.convert("RGB")
        image.thumbnail((MAX_W, MAX_H))
        image.save(dest, "JPEG", quality=JPEG_QUALITY, optimize=True)


def soffice_bin() -> str | None:
    return which("soffice", "libreoffice", "/usr/bin/soffice", "/usr/lib/libreoffice/program/soffice")


def to_pdf(src: Path, work: Path) -> Path:
    office = soffice_bin()
    if not office:
        raise RuntimeError("This mill needs LibreOffice to turn PowerPoint into slides.")
    env = os.environ.copy()
    env.setdefault("HOME", str(work))
    result = subprocess.run(
        [office, "--headless", "--norestore", "--nolockcheck", "--convert-to", "pdf", "--outdir", str(work), str(src)],
        check=False,
        capture_output=True,
        text=True,
        timeout=180,
        env=env,
        cwd=str(work),
    )
    pdfs = sorted(work.glob("*.pdf"))
    if not pdfs:
        detail = (result.stderr or result.stdout or "").strip()[-300:]
        raise RuntimeError(detail or "LibreOffice could not read that PowerPoint.")
    return pdfs[0]


def pdf_to_jpegs(pdf: Path, dest_dir: Path) -> list[Path]:
    dest_dir.mkdir(parents=True, exist_ok=True)
    prefix = dest_dir / "page"
    pdftoppm = which("pdftoppm")
    if pdftoppm:
        result = run([pdftoppm, "-jpeg", "-r", "144", "-l", str(MAX_PAGES), str(pdf), str(prefix)], timeout=180)
        pages = sorted(dest_dir.glob("page*.jpg"))
        if pages:
            return pages
        raise RuntimeError((result.stderr or "pdftoppm failed").strip()[-300:])
    gs = which("gs", "ghostscript")
    if gs:
        result = run(
            [
                gs,
                "-dSAFER",
                "-dBATCH",
                "-dNOPAUSE",
                "-sDEVICE=jpeg",
                "-dJPEGQ=85",
                "-r144",
                f"-dLastPage={MAX_PAGES}",
                f"-sOutputFile={dest_dir / 'page-%02d.jpg'}",
                str(pdf),
            ],
            timeout=180,
        )
        pages = sorted(dest_dir.glob("page*.jpg"))
        if pages:
            return pages
        raise RuntimeError((result.stderr or "Ghostscript failed").strip()[-300:])
    ffmpeg = which("ffmpeg")
    if ffmpeg:
        result = run(
            [ffmpeg, "-y", "-i", str(pdf), "-frames:v", str(MAX_PAGES), str(dest_dir / "page-%02d.jpg")],
            timeout=180,
        )
        pages = sorted(dest_dir.glob("page*.jpg"))
        if pages:
            return pages
        raise RuntimeError((result.stderr or "ffmpeg could not read that PDF").strip()[-300:])
    raise RuntimeError("This mill needs LibreOffice or pdftoppm to turn PDF pages into slides.")


def write_slides(pages: list[Path], deck_id: str) -> list[dict]:
    media = ensure_data_layout() / "media" / deck_id
    if media.exists():
        shutil.rmtree(media, ignore_errors=True)
    media.mkdir(parents=True, exist_ok=True)
    slides = []
    for index, page in enumerate(pages[:MAX_PAGES], start=1):
        name = f"slide-{index:03d}.jpg"
        dest = media / name
        save_jpeg(page, dest)
        slides.append({"src": f"/media/{deck_id}/{name}"})
    return slides


def ingest(path: str, deck_id: str, name: str) -> dict:
    src = Path(path)
    ext = src.suffix.lower().lstrip(".")
    kind = "image"
    if ext in {"pptx", "ppt"}:
        kind = "pptx"
    elif ext == "pdf":
        kind = "pdf"
    work = Path(tempfile.mkdtemp(prefix="mill-media-"))
    try:
        if kind == "image":
            slides = write_slides([src], deck_id)
        elif kind == "pdf":
            pages = pdf_to_jpegs(src, work / "pages")
            if not pages:
                raise RuntimeError("That PDF had no pages.")
            slides = write_slides(pages, deck_id)
        else:
            pdf = to_pdf(src, work)
            pages = pdf_to_jpegs(pdf, work / "pages")
            if not pages:
                raise RuntimeError("That PowerPoint had no slides.")
            slides = write_slides(pages, deck_id)
            originals = ensure_data_layout() / "originals" / deck_id
            originals.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, originals / src.name)
        return {
            "ok": True,
            "deck": {
                "id": deck_id,
                "name": name or src.name,
                "kind": kind,
                "enabled": True,
                "slides": slides,
            },
        }
    finally:
        shutil.rmtree(work, ignore_errors=True)


def remove_deck(deck_id: str) -> dict:
    root = ensure_data_layout()
    safe = re.sub(r"[^A-Za-z0-9._-]", "_", deck_id)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    dest = root / "trash" / f"{safe}-{stamp}"
    dest.mkdir(parents=True, exist_ok=True)
    moved = []
    for folder in ("media", "originals"):
        src = root / folder / safe
        if src.exists():
            shutil.move(str(src), str(dest / folder))
            moved.append(folder)
    decks_file = root / "kiosk-decks.json"
    if decks_file.exists():
        try:
            decks = json.loads(decks_file.read_text())
            if isinstance(decks, list):
                decks_file.write_text(json.dumps([row for row in decks if row.get("id") != deck_id]))
        except json.JSONDecodeError:
            pass
    return {"ok": True, "trashed": str(dest), "moved": moved}


def ingest_person(path: str, person_id: str) -> dict:
    src = Path(path)
    safe = re.sub(r"[^A-Za-z0-9._-]", "_", person_id) or "person"
    dest = ensure_data_layout() / "media" / "people"
    dest.mkdir(parents=True, exist_ok=True)
    out = dest / f"{safe}.jpg"
    save_jpeg(src, out)
    return {"ok": True, "src": f"/media/people/{out.name}"}


def purge_trash(days: int = 14) -> dict:
    root = ensure_data_layout() / "trash"
    cutoff = time.time() - days * 86400
    removed = 0
    if not root.exists():
        return {"ok": True, "removed": 0}
    for path in list(root.iterdir()):
        try:
            if path.stat().st_mtime < cutoff:
                if path.is_dir():
                    shutil.rmtree(path, ignore_errors=True)
                else:
                    path.unlink()
                removed += 1
        except OSError:
            continue
    return {"ok": True, "removed": removed}


def migrate_base64(decks: list[dict]) -> list[dict]:
    changed = False
    for deck in decks:
        slides = []
        for index, slide in enumerate(deck.get("slides") or [], start=1):
            src = str((slide or {}).get("src") or "")
            if not src.startswith("data:"):
                slides.append(slide)
                continue
            changed = True
            header, _, blob = src.partition(",")
            import base64

            raw = base64.b64decode(blob)
            work = Path(tempfile.mkdtemp(prefix="mill-b64-"))
            ext = "png" if "png" in header else "jpg"
            tmp = work / f"in.{ext}"
            tmp.write_bytes(raw)
            media = ensure_data_layout() / "media" / deck["id"]
            media.mkdir(parents=True, exist_ok=True)
            dest = media / f"slide-{index:03d}.jpg"
            try:
                save_jpeg(tmp, dest)
            except Exception:
                dest.write_bytes(raw)
            slides.append({"src": f"/media/{deck['id']}/{dest.name}"})
            shutil.rmtree(work, ignore_errors=True)
        deck["slides"] = slides
    return decks if changed else decks


def main(argv: list[str]) -> int:
    cmd = argv[1] if len(argv) > 1 else ""
    try:
        ensure_data_layout()
        if cmd == "ingest":
            path = argv[2]
            deck_id = argv[3]
            name = argv[4] if len(argv) > 4 else Path(path).name
            print(json.dumps(ingest(path, deck_id, name)))
            return 0
        if cmd == "remove":
            print(json.dumps(remove_deck(argv[2])))
            return 0
        if cmd == "person":
            print(json.dumps(ingest_person(argv[2], argv[3])))
            return 0
        if cmd == "purge-trash":
            print(json.dumps(purge_trash(int(argv[2]) if len(argv) > 2 else 14)))
            return 0
        if cmd == "migrate":
            decks_file = Path(argv[2] if len(argv) > 2 else data_root() / "kiosk-decks.json")
            if not decks_file.exists():
                print(json.dumps({"ok": True, "changed": False, "decks": []}))
                return 0
            decks = json.loads(decks_file.read_text())
            if not isinstance(decks, list):
                print(json.dumps({"ok": True, "changed": False, "decks": []}))
                return 0
            next_decks = migrate_base64(decks)
            decks_file.write_text(json.dumps(next_decks))
            print(json.dumps({"ok": True, "changed": True, "count": len(next_decks)}))
            return 0
        if cmd == "root":
            print(json.dumps({"app": str(data_root()), "data": str(data_root())}))
            return 0
    except Exception as err:
        print(json.dumps({"ok": False, "message": str(err)}))
        return 1
    print("usage: mill-media.py ingest|remove|migrate", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
