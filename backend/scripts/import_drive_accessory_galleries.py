#!/usr/bin/env python3
"""
Import accessory galleries (max 3 related images each) from a local Drive download.

Usage:
  gdown --folder 'https://drive.google.com/drive/folders/...' -O /tmp/wingconcept-accessories
  cd backend && python3 scripts/import_drive_accessory_galleries.py \\
    --source /tmp/wingconcept-accessories
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
OUT = REPO / "frontend/public/images/parts"
MAX_IMAGES = 3

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".heic", ".webp", ".JPG", ".JPEG", ".PNG", ".HEIC"}
SKIP_EXTS = {".mov", ".mp4", ".MP4", ".MOV", ".avi", ".AVI"}

# Drive folder name (prefix match) → product slug(s)
FOLDER_TO_SLUGS: dict[str, list[str]] = {
    "1 PARACHUTE CONTAINER": ["parachute-container"],
    "2 NEW PHONE HOLDER": ["phone-holder"],
    "3 SUNSHADE NET OR SUNSCREEN": ["sun-roof-netting"],
    "4. PADDED ROLL BAR": ["front-bar-protection"],
    "5. FRONT BRAKE": ["front-brake"],
    "6. REAR MIRROW": ["rear-mirror"],
    "7. PROTECTIVE COVER": ["cockpit-liner"],
    "8. TWO EXPLORER LATERAL CASE": ["lateral-bag-explorer", "lateral-bag"],
    "10. AUXILIARY LIGHTS": ["auxiliary-lights"],
    "11. ANALOG FUEL GAUGE": ["fuel-gauge-vanguard"],
    "12. BASIC INSTRUMENTS KIT": ["instrument-kit-vanguard", "instrument-kit"],
    "13. COMPLETE ELECTRICAL": ["electrical-kit"],
    "14. TWO CARAVINERS": ["carabiners"],
    "19. NEW SYSTEM ALL IN ONE": ["instrument-kit-nomadic"],
    "20. ROCK GUARD": ["rock-guard"],
    "21. EXPLORER BAG": ["bottom-explorer-bag"],
}


def convert_to_png(src: Path, dest: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        ["sips", "-s", "format", "png", str(src), "--out", str(dest)],
        capture_output=True,
        text=True,
    )
    return result.returncode == 0


def _format_score(path: Path) -> int:
    ext = path.suffix.lower()
    if ext in (".jpg", ".jpeg", ".png", ".webp"):
        return 30
    if ext == ".heic":
        return 20
    return 0


def _name_order(path: Path) -> tuple:
    name = path.stem.lower()
    nums = [int(n) for n in re.findall(r"\d+", name)]
    trailing = nums[-1] if nums else 9999
    # Prefer explicitly numbered product shots (1, 2, 3)
    if re.search(r"\b[123]\b", name) or re.search(r"\s[123]$", name):
        trailing = min(trailing, 10)
    return (trailing, -path.stat().st_size, name)


def pick_images(folder: Path, limit: int = MAX_IMAGES) -> list[Path]:
    candidates: list[Path] = []
    for path in sorted(folder.iterdir()):
        if not path.is_file():
            continue
        if path.suffix in SKIP_EXTS:
            continue
        if path.suffix not in IMAGE_EXTS and path.suffix.lower() not in {
            e.lower() for e in IMAGE_EXTS
        }:
            continue
        candidates.append(path)

    if not candidates:
        return []

    # Prefer jpeg/png over heic when same stem exists
    by_stem: dict[str, Path] = {}
    for path in candidates:
        stem = path.stem.lower().replace("_jpeg", "").replace("-jpeg", "")
        score = _format_score(path)
        prev = by_stem.get(stem)
        if prev is None or score > _format_score(prev):
            by_stem[stem] = path

    deduped = list(by_stem.values())
    deduped.sort(key=_name_order)

    # Skip tiny WhatsApp thumbs if we have larger product photos
    large = [p for p in deduped if p.stat().st_size > 200_000]
    pool = large if len(large) >= limit else deduped

    return pool[:limit]


def match_folder(name: str) -> list[str] | None:
    for key, slugs in FOLDER_TO_SLUGS.items():
        if name.startswith(key) or key in name:
            return slugs
    return None


def export_slug(slug: str, images: list[Path], dry_run: bool) -> int:
    written = 0
    for index, src in enumerate(images, start=1):
        dest = OUT / f"{slug}-{index}.png"
        if dry_run:
            print(f"  [dry-run] {src.name} → {dest.name}")
            written += 1
            continue
        if convert_to_png(src, dest):
            print(f"  ✓ {dest.relative_to(REPO)}")
            written += 1
            if index == 1:
                convert_to_png(src, OUT / f"{slug}.png")
        else:
            print(f"  ✗ failed {src} → {dest}")
    return written


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--source",
        default="/tmp/wingconcept-accessories",
        help="Local folder from gdown --folder",
    )
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    source = Path(args.source)
    if not source.is_dir():
        sys.exit(f"Source not found: {source}")

    total = 0
    for folder in sorted(source.iterdir()):
        if not folder.is_dir():
            continue
        slugs = match_folder(folder.name)
        if not slugs:
            print(f"Skip (unmapped): {folder.name}")
            continue

        images = pick_images(folder)
        if not images:
            print(f"Skip (no images): {folder.name}")
            continue

        print(f"\n{folder.name} → {', '.join(slugs)} ({len(images)} imgs)")
        for slug in slugs:
            total += export_slug(slug, images, args.dry_run)

    print(f"\nDone — {total} files {'planned' if args.dry_run else 'written'}.")


if __name__ == "__main__":
    main()
