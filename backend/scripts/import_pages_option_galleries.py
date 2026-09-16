#!/usr/bin/env python3
"""Import option gallery images (up to 3 per product) from Pages document."""
from __future__ import annotations

import subprocess
import shutil
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
PAGES = REPO / "archivos/imagenes ajustes wingconcept.pages"
OUT = REPO / "frontend/public/images"

# Explicit video IDs per accessory — verified against .pages media (Sep 2026).
# When only one clip is correct, repeat it for all three gallery slots.
PART_VIDEO_MAP: dict[str, list[int]] = {
    "accelerator-pedal": [26, 28, 24],
    "cruise-control": [32, 34, 30],
    "sun-roof-netting": [36, 38, 42],
    "sunroof-canopy": [44, 46, 50],
    # 52/54 are full-trike shots; only 58 is the carabiners product photo.
    "carabiners": [58, 58, 58],
    "fuel-gauge-vanguard": [60, 62, 64],
    "auxiliary-lights": [66, 68, 56],
    # 70 is the wiring-harness photo; 78/80 were mirror shots, not electrical.
    "electrical-kit": [70, 70, 70],
    "rear-mirror": [72, 74, 76],
    "cockpit-liner": [108, 110, 112],
}

ENGINE_GROUPS = {
    "rotax-912": [94, 96, 98],
    "hirth-3503": [82, 84, 86],
    "simonini-v2": [88, 90, 92],
    "polini-260": [114, 116, 118],
    "polini-303": [120, 122, 124],
    "vittorazi-300-my25": [126, 128, 130],
    "zeus-300": [132, 134, 136],
}

PARACHUTE_TIFFS = [102, 104, 106]


def convert(src: Path, dest: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    fmt = "png" if dest.suffix.lower() == ".png" else "jpeg"
    result = subprocess.run(
        ["sips", "-s", "format", fmt, str(src), "--out", str(dest)],
        capture_output=True,
        text=True,
    )
    return result.returncode == 0


def find_video(src_dir: Path, vid: int) -> Path | None:
    for ext in ("heic", "png", "jpg", "jpeg"):
        path = src_dir / f"video pegado-{vid}.{ext}"
        if path.exists():
            return path
    return None


def find_tiff(src_dir: Path, vid: int) -> Path | None:
    path = src_dir / f"imagen pegada-{vid}.tiff"
    return path if path.exists() else None


def import_part_videos(src_dir: Path, slug: str, ids: list[int]) -> None:
    for index, vid in enumerate(ids[:3], start=1):
        src = find_video(src_dir, vid)
        if not src:
            continue
        convert(src, OUT / "parts" / f"{slug}-{index}.png")
    first = OUT / "parts" / f"{slug}-1.png"
    main = OUT / "parts" / f"{slug}.png"
    if first.exists():
        shutil.copy2(first, main)


def main() -> None:
    import zipfile
    import tempfile

    if not PAGES.exists():
        raise SystemExit(f"Missing source document: {PAGES}")

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        with zipfile.ZipFile(PAGES) as zf:
            zf.extractall(tmp_path)
        src_dir = tmp_path / "Data"

        for slug, ids in PART_VIDEO_MAP.items():
            import_part_videos(src_dir, slug, ids)

        for slug, ids in ENGINE_GROUPS.items():
            for index, vid in enumerate(ids[:3], start=1):
                src = find_tiff(src_dir, vid) or find_video(src_dir, vid)
                if not src:
                    continue
                convert(src, OUT / "engines" / f"{slug}-{index}.jpg")
            first = OUT / "engines" / f"{slug}-1.jpg"
            main = OUT / "engines" / f"{slug}.jpg"
            if first.exists():
                shutil.copy2(first, main)

        if find_tiff(src_dir, 100):
            convert(find_tiff(src_dir, 100), OUT / "propellers/bipala.jpg")
            convert(find_tiff(src_dir, 100), OUT / "propellers/bipala-1.jpg")
        for index, vid in enumerate(PARACHUTE_TIFFS, start=1):
            src = find_tiff(src_dir, vid)
            if src:
                convert(src, OUT / f"parts/parachute-container-{index}.png")
                convert(src, OUT / f"parts/reserve-chute-{index}.jpg")

        main = OUT / "parts/parachute-container-1.png"
        if main.exists():
            shutil.copy2(main, OUT / "parts/parachute-container.png")
        main = OUT / "parts/reserve-chute-1.jpg"
        if main.exists():
            shutil.copy2(main, OUT / "parts/reserve-chute-deployed.jpg")

    print(f"Imported option galleries into {OUT}")


if __name__ == "__main__":
    main()
