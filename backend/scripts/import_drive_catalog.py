#!/usr/bin/env python3
"""
Download WingConcept media from Google Drive and import into frontend/public/images.

Drive root: https://drive.google.com/drive/folders/1yZl5sDCtwtO3X-ZSJ-aDJ5vaXo8pTOwg

  python3 backend/scripts/import_drive_catalog.py                  # all
  python3 backend/scripts/import_drive_catalog.py --only colors
  python3 backend/scripts/import_drive_catalog.py --only accessories
  python3 backend/scripts/import_drive_catalog.py --skip-download  # reuse /tmp cache

After adding new Drive photos, re-run the matching --only step.
"""
from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
PUBLIC = REPO / "frontend/public/images"
CACHE = Path("/tmp/wingconcept-drive")
MAX_COLOR_IMAGES = 3

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".heic", ".webp", ".JPG", ".JPEG", ".PNG", ".HEIC", ".WEBP"}
SKIP_EXTS = {".mov", ".mp4", ".MP4", ".MOV", ".avi", ".AVI", ".xlsx", ".doc", ".docx", ".pdf", ".pages"}

# Drive folder id → local cache name
DRIVE_FOLDERS: dict[str, str] = {
    "1Yp6C9D2baEKGO4NU-zY95rrIHwTwgJl7": "vanguard-red",
    "1w1f0qXoe9ZDPM3RQE_nZ59i3PooVn5kT": "vanguard-blue",
    "1-ZSaG7N2zozqOo3wRfwb0cZaymDxNMsa": "vanguard-purple",
    "1qonYV6BebOu_cR1niTbWzHKuhS5YrTNv": "nomadic-red",
    "1f3WQ5cFJhYTXqqOAcRkKKNBgpQz7xLFb": "nomadic-blue",
    "1LhGzXK87Ku0x0pvLBkePmLA5uFH_Epsr": "nomadic-purple",
    "1zjMBMyLFt5xvnJGZpYNY3FXwP7OXYGTG": "accessories",
    "1ZPs9jJSyAPsOeYP6FYvEAw5AEdDmdb3G": "vanguard-photos",
}

COLOR_IMPORTS: dict[str, tuple[str, str]] = {
    "vanguard-red": ("vanguard/colors/red", "png"),
    "vanguard-blue": ("vanguard/colors/blue", "png"),
    "vanguard-purple": ("vanguard/colors/purple", "png"),
    "nomadic-red": ("nomadic/colors/red", "jpg"),
    "nomadic-blue": ("nomadic/colors/blue", "jpg"),
    "nomadic-purple": ("nomadic/colors/purple", "jpg"),
}


def run(cmd: list[str]) -> None:
    print(f"  $ {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip() or "command failed")


def download_folder(folder_id: str, dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    url = f"https://drive.google.com/drive/folders/{folder_id}"
    run(["gdown", "--folder", url, "-O", str(dest)])


def convert_image(src: Path, dest: Path, fmt: str) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if fmt == "jpg" and src.suffix.lower() in {".jpg", ".jpeg"}:
        if src.resolve() != dest.resolve():
            shutil.copy2(src, dest)
        return True
    sips_fmt = "jpeg" if fmt == "jpg" else fmt
    result = subprocess.run(
        ["sips", "-s", "format", sips_fmt, str(src), "--out", str(dest)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"  ✗ convert {src.name}: {result.stderr.strip() or result.stdout.strip()}")
    return result.returncode == 0


def _trike_score(path: Path) -> tuple:
    """Prefer large full-product photos over thumbs/WhatsApp."""
    name = path.name.lower()
    size = path.stat().st_size
    penalty = 0
    if "whatsapp" in name and size < 400_000:
        penalty += 50
    if "thumb" in name or "small" in name:
        penalty += 40
    if path.suffix.lower() == ".heic":
        penalty += 5
    nums = [int(n) for n in re.findall(r"\d+", name)]
    order = nums[-1] if nums else 999
    return (penalty, order, -size, name)


def collect_images(folder: Path) -> list[Path]:
    if not folder.is_dir():
        return []
    files: list[Path] = []
    for path in folder.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix in SKIP_EXTS:
            continue
        if path.suffix not in IMAGE_EXTS and path.suffix.lower() not in {e.lower() for e in IMAGE_EXTS}:
            continue
        if path.stat().st_size < 80_000:
            continue
        files.append(path)
    files.sort(key=_trike_score)
    # de-dupe similar stems keeping best format
    seen: dict[str, Path] = {}
    for path in files:
        stem = re.sub(r"[^a-z0-9]+", "", path.stem.lower())
        prev = seen.get(stem)
        if prev is None or path.stat().st_size > prev.stat().st_size:
            seen[stem] = path
    ranked = sorted(seen.values(), key=_trike_score)
    return ranked[:MAX_COLOR_IMAGES]


def import_color_gallery(cache_name: str, rel_dest: str, ext: str) -> int:
    src_dir = CACHE / cache_name
    images = collect_images(src_dir)
    if not images:
        print(f"  ✗ no images in {cache_name}")
        return 0

    slug = Path(rel_dest).name
    out_dir = PUBLIC / rel_dest
    out_dir.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []

    for index, src in enumerate(images, start=1):
        dest = out_dir / f"{slug}-{index}.{ext}"
        if convert_image(src, dest, ext):
            written.append(dest)
            print(f"  ✓ {dest.relative_to(REPO)} ← {src.name}")

    for stale in out_dir.glob(f"{slug}-*.{ext}"):
        if stale not in written:
            stale.unlink()
            print(f"  − removed stale {stale.name}")
    return len(written)


def import_accessories() -> None:
    script = REPO / "backend/scripts/import_drive_accessory_galleries.py"
    source = CACHE / "accessories"
    if not source.is_dir():
        print("  ✗ accessories cache missing")
        return
    run([sys.executable, str(script), "--source", str(source)])
    mirror_part_jpegs()


def mirror_part_jpegs() -> None:
    """Configurador references some *-1.jpg thumbnails alongside PNG galleries."""
    parts_dir = PUBLIC / "parts"
    for png in parts_dir.glob("*-1.png"):
        jpg = png.with_name(png.stem + ".jpg")
        if convert_image(png, jpg, "jpg"):
            print(f"  ✓ {jpg.relative_to(REPO)}")


def import_vanguard_base_photos() -> None:
    """Refresh vanguard/1..N.png from Drive FOTOS VANGUARD when available."""
    src_dir = CACHE / "vanguard-photos"
    images = collect_images(src_dir)
    if len(images) < 3:
        print("  ✗ not enough vanguard base photos in Drive cache")
        return
    # Take up to 10 largest distinct product shots
    pool = sorted(
        {p for p in src_dir.rglob("*") if p.is_file() and p.suffix.lower() in {".png", ".jpg", ".jpeg", ".heic"}},
        key=lambda p: (-p.stat().st_size, p.name),
    )
    selected: list[Path] = []
    for path in pool:
        if path.suffix in SKIP_EXTS or path.stat().st_size < 200_000:
            continue
        if any(path.stat().st_size == s.stat().st_size and path.name == s.name for s in selected):
            continue
        selected.append(path)
        if len(selected) >= 10:
            break
    if len(selected) < 3:
        selected = images

    out_dir = PUBLIC / "vanguard"
    out_dir.mkdir(parents=True, exist_ok=True)
    for index, src in enumerate(selected[:10], start=1):
        dest = out_dir / f"{index}.png"
        if convert_image(src, dest, "png"):
            print(f"  ✓ {dest.relative_to(REPO)} ← {src.name}")


def build_listing_jpeg() -> None:
    hero = PUBLIC / "vanguard/3.png"
    listing = PUBLIC / "vanguard/listing.jpg"
    if not hero.is_file():
        print("  ✗ skip listing.jpg — vanguard/3.png missing")
        return
    result = subprocess.run(
        [
            "sips", "-s", "format", "jpeg", "-s", "formatOptions", "82",
            "--resampleWidth", "1400", str(hero), "--out", str(listing),
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        print(f"  ✓ {listing.relative_to(REPO)} ({listing.stat().st_size // 1024} KB)")


def folders_for_steps(steps: set[str]) -> dict[str, str]:
    wanted: dict[str, str] = {}
    for folder_id, name in DRIVE_FOLDERS.items():
        if name in COLOR_IMPORTS and "colors" in steps:
            wanted[folder_id] = name
        elif name == "accessories" and "accessories" in steps:
            wanted[folder_id] = name
        elif name == "vanguard-photos" and "vanguard-photos" in steps:
            wanted[folder_id] = name
    return wanted


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-download", action="store_true")
    parser.add_argument(
        "--only",
        nargs="*",
        choices=["colors", "accessories", "vanguard-photos"],
        help="Limit import steps",
    )
    args = parser.parse_args()

    steps = set(args.only or ["colors", "accessories", "vanguard-photos"])

    if not args.skip_download:
        CACHE.mkdir(parents=True, exist_ok=True)
        print("── Downloading Drive folders ──")
        for folder_id, name in folders_for_steps(steps).items():
            dest = CACHE / name
            print(name)
            try:
                download_folder(folder_id, dest)
            except RuntimeError as exc:
                print(f"  ⚠ download issue: {exc}")

    if "colors" in steps:
        print("\n── Color galleries ──")
        for cache_name, (rel_dest, ext) in COLOR_IMPORTS.items():
            print(cache_name)
            import_color_gallery(cache_name, rel_dest, ext)

    if "accessories" in steps:
        print("\n── Accessories / parts ──")
        import_accessories()

    if "vanguard-photos" in steps:
        print("\n── Vanguard base gallery (1–10) ──")
        import_vanguard_base_photos()
        build_listing_jpeg()

    print("\nImport complete.")


if __name__ == "__main__":
    main()
