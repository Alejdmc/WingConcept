#!/usr/bin/env python3
"""
Import per-trike accessory galleries (max 4 images each) from the client's Drive.

Drive: "ACCESORIOS PARA TRIKES/ACCESORIOS VANGUARD|NOMADIC/<n>. <NAME>" — the folder
number is the order shown in the configurador (see frontend/lib/trikeConfiguratorAccessories.js).

Usage (download only that folder, skipping videos):
  gdown --folder 'https://drive.google.com/drive/folders/1yZl5sDCtwtO3X-ZSJ-aDJ5vaXo8pTOwg' -O /tmp/wc
  python3 backend/scripts/import_trike_accessory_galleries.py --source "/tmp/wc/ACCESORIOS PARA TRIKES"

Writes frontend/public/images/parts/trikes/<trike>/<slug>-<n>.jpg and
frontend/lib/trikeAccessoryGalleries.json.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parents[2]
OUT = REPO / "frontend/public/images/parts/trikes"
MANIFEST = REPO / "frontend/lib/trikeAccessoryGalleries.json"
MAX_IMAGES = 4
MAX_SIDE = 1400

WEB_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
HEIC_EXTS = {".heic"}

# Drive folder number → configurador accessory id
TRIKES: dict[str, tuple[str, dict[int, str]]] = {
    "vanguard": ("ACCESORIOS VANGUARD", {
        1: "reserve-chute",
        2: "parachute-container",
        3: "sun-roof-netting",
        4: "front-bar-protection",
        5: "front-brake",
        6: "rear-mirror",
        8: "lateral-bag",
        9: "cruise-control",
        10: "fuel-gauge-vanguard",
        11: "auxiliary-lights",
        12: "instrument-kit",
        13: "electrical-kit",
        14: "carabiners",
        16: "phone-holder",
        17: "line-protector",
    }),
    "nomadic": ("ACCESORIOS NOMADIC", {
        1: "reserve-chute",
        2: "parachute-container",
        3: "rock-guard",
        4: "sun-roof-netting",
        5: "front-bar-protection",
        6: "front-brake",
        7: "rear-mirror",
        8: "cockpit-liner",
        11: "auxiliary-lights",
        12: "instrument-kit",
        13: "electrical-kit",
        14: "carabiners",
        16: "phone-holder",
        17: "line-protector",
    }),
}

# Archivos sueltos que en Drive quedaron en la carpeta equivocada
FOREIGN_NAME = {
    "rear-mirror": re.compile(r"sunshade", re.I),
}


def natural_key(path: Path):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", path.as_posix())]


def folder_number(name: str) -> int | None:
    m = re.match(r"\s*(\d+)", name)
    return int(m.group(1)) if m else None


def image_hash(path: Path) -> int:
    """Average hash 8x8 — detecta la misma foto exportada en otro formato/tamaño."""
    im = open_image(path).convert("L").resize((8, 8))
    px = list(im.tobytes())
    avg = sum(px) / len(px)
    return sum(1 << i for i, v in enumerate(px) if v > avg)


def is_duplicate(h: int, seen: list[int]) -> bool:
    return any(bin(h ^ other).count("1") <= 6 for other in seen)


def pick_images(folder: Path, slug: str) -> list[Path]:
    files = [p for p in folder.rglob("*") if p.is_file()]
    foreign = FOREIGN_NAME.get(slug)
    if foreign:
        files = [p for p in files if not foreign.search(p.name)]
    web = sorted((p for p in files if p.suffix.lower() in WEB_EXTS), key=natural_key)
    heic = sorted((p for p in files if p.suffix.lower() in HEIC_EXTS), key=natural_key)
    # Same shot exported twice (e.g. "X (1).jpg" + "X (1).png"): keep one
    seen: set[str] = set()
    hashes: list[int] = []
    picked: list[Path] = []
    for p in web + heic:
        stem = p.stem.lower().strip()
        if stem in seen:
            continue
        h = image_hash(p)
        if is_duplicate(h, hashes):
            continue
        seen.add(stem)
        hashes.append(h)
        picked.append(p)
        if len(picked) == MAX_IMAGES:
            break
    return picked


def open_image(path: Path) -> Image.Image:
    if path.suffix.lower() in HEIC_EXTS:
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "img.jpg"
            subprocess.run(["sips", "-s", "format", "jpeg", str(path), "--out", str(out)],
                           check=True, capture_output=True)
            return Image.open(out).copy()
    return Image.open(path)


def save_jpg(src: Path, dest: Path) -> None:
    im = open_image(src)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
        bg.alpha_composite(im)
        im = bg
    im = im.convert("RGB")
    im.thumbnail((MAX_SIDE, MAX_SIDE))
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=85, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, type=Path, help='"ACCESORIOS PARA TRIKES" folder')
    args = parser.parse_args()

    manifest: dict[str, dict[str, list[str]]] = {}
    for trike, (folder_name, by_number) in TRIKES.items():
        root = args.source / folder_name
        manifest[trike] = {}
        for folder in sorted(root.iterdir(), key=natural_key):
            if not folder.is_dir():
                continue
            slug = by_number.get(folder_number(folder.name))
            if not slug:
                print(f"skip {trike}: {folder.name}")
                continue
            urls = []
            for i, src in enumerate(pick_images(folder, slug), start=1):
                dest = OUT / trike / f"{slug}-{i}.jpg"
                save_jpg(src, dest)
                urls.append(f"/images/parts/trikes/{trike}/{dest.name}")
            if urls:
                manifest[trike][slug] = urls
                print(f"{trike} {slug}: {len(urls)}")

    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"wrote {MANIFEST.relative_to(REPO)}")


if __name__ == "__main__":
    main()
