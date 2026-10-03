#!/usr/bin/env python3
"""Sync Vanguard color folders from numbered photos in frontend/public/images/vanguard/.

Mapping mirrors frontend/lib/vanguardContent.js → VANGUARD_COLOR_SOURCE_PHOTOS.
Run after adding or replacing vanguard/N.png source photos:

    python3 backend/scripts/sync_vanguard_color_galleries.py
"""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SRC_DIR = REPO / "frontend/public/images/vanguard"
OUT_DIR = REPO / "frontend/public/images/vanguard/colors"

# slug → list of source photo numbers (1–10); only photos that match that color
COLOR_SOURCES: dict[str, list[int]] = {
    "red": [3, 2, 4],
    "purple": [6, 10],
    "blue": [1],
}


def sync_color(slug: str, photo_nums: list[int]) -> None:
    dest_dir = OUT_DIR / slug
    dest_dir.mkdir(parents=True, exist_ok=True)
    synced: list[Path] = []
    for index, num in enumerate(photo_nums[:3], start=1):
        src = SRC_DIR / f"{num}.png"
        dest = dest_dir / f"{slug}-{index}.png"
        if not src.is_file():
            print(f"  ✗ missing source {src.name} for {slug}-{index}")
            continue
        shutil.copy2(src, dest)
        synced.append(dest)
        print(f"  ✓ {slug}-{index}.png ← {num}.png")
    for stale in dest_dir.glob(f"{slug}-*.png"):
        if stale not in synced:
            stale.unlink()
            print(f"  − removed stale {stale.name}")


def build_listing_jpeg() -> None:
    hero = SRC_DIR / "3.png"
    listing = SRC_DIR / "listing.jpg"
    if not hero.is_file():
        print("  ✗ cannot build listing.jpg — 3.png missing")
        return
    result = subprocess.run(
        [
            "sips",
            "-s", "format", "jpeg",
            "-s", "formatOptions", "82",
            "--resampleWidth", "1400",
            str(hero),
            "--out",
            str(listing),
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"  ✗ listing.jpg: {result.stderr.strip()}")
        return
    size_kb = listing.stat().st_size // 1024
    print(f"  ✓ listing.jpg ({size_kb} KB) ← 3.png")


def main() -> None:
    if not SRC_DIR.is_dir():
        print(f"ERROR: {SRC_DIR} not found")
        sys.exit(1)

    print("── Vanguard color galleries ──")
    for slug, nums in COLOR_SOURCES.items():
        print(slug)
        sync_color(slug, nums)

    print("\n── Listing thumbnail ──")
    build_listing_jpeg()
    print("\nDone.")


if __name__ == "__main__":
    main()
