#!/usr/bin/env python3
"""
Import per-trike accessory galleries (max 4 images each) from the client's Drive.

Drive: "ACCESORIOS PARA TRIKES/ACCESORIOS VANGUARD|NOMADIC/<n>. <NAME>" — the folder
number is the order shown in the configurador (see frontend/lib/trikeConfiguratorAccessories.js).

Fotos adicionales para completar 3–4 por accesorio: ver EXTRA (rutas desde la raíz del Drive).

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

# Fotos adicionales (rutas relativas a la raíz del Drive, o "site:" = imagen ya publicada)
# para completar 3–4 fotos cuando la carpeta del trike trae menos.
ROLL_BAR = "PART & ACCESORES/ACCESORIES/6.PADDED ROLL BAR PROTECTOR  WITH HANDLES"
SUNSHADE = "PART & ACCESORES/ACCESORIES/5.VAGUARD   SUNSHADE NET OR SUNSCREEN/IA"
ALL_IN_ONE = "ACCESORIOS/19. NEW SYSTEM ALL IN ONE LIGHTS, INSTRUMENTS & ELECTRICAL"
EXPLORER_BAG = "ACCESORIOS/21. EXPLORER BAG"
EXTRA: dict[tuple[str, str], list[str]] = {
    ("vanguard", "sun-roof-netting"): [f"{SUNSHADE}/SUNCHADE NET (1).png", f"{SUNSHADE}/SUNCHADE NET (3).png", f"{SUNSHADE}/vanguard azul-V8 (12).jpg"],
    ("vanguard", "front-bar-protection"): [f"{ROLL_BAR}/Vanguard Azul-V8 (7).jpg", "VANGUARD TRIKE/FOTOS VANGUARD/Protector sin fondo.png"],
    ("vanguard", "cockpit-liner"): ["ACCESORIOS/7. PROTECTIVE COVER/cover.jpg", "ACCESORIOS/7. PROTECTIVE COVER/cover 2.jpg", "ACCESORIOS/7. PROTECTIVE COVER/cover 3.jpg"],
    ("vanguard", "cruise-control"): ["site:/images/parts/cruise-control-1.jpg"],
    ("vanguard", "instrument-kit"): ["VANGUARD TRIKE/FOTOS VANGUARD/Panel sin fondo.png", f"{ALL_IN_ONE}/WhatsApp Image 2026-08-31 at 12.11.41 PM (2).jpeg"],
    ("nomadic", "front-bar-protection"): [f"{ROLL_BAR}/padded rol bar protector 2.png", "ACCESORIOS/4. PADDED ROLL BAR PROTECTOR WITH HANDLE/padded roll protector 1.jpeg"],
    ("nomadic", "cockpit-liner"): ["Mini-Vanguard-V7.0/Nomadic-V12.0/New cover.JPG", "Mini-Vanguard-V7.0/Nomadic-V12.0/New cover 2.JPG"],
    ("nomadic", "instrument-kit"): [f"{ALL_IN_ONE}/WhatsApp Image 2026-08-31 at 12.11.41 PM (2).jpeg", f"{ALL_IN_ONE}/WhatsApp Image 2026-08-31 at 12.11.40 PM.jpeg"],
    ("nomadic", "bottom-explorer-bag"): [f"{EXPLORER_BAG}/IMG_E2504.HEIC", f"{EXPLORER_BAG}/IMG_2506.HEIC", f"{EXPLORER_BAG}/IMG_E2512.HEIC", f"{EXPLORER_BAG}/IMG_E2515.HEIC"],
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
    return any(bin(h ^ other).count("1") <= 2 for other in seen)


def folder_candidates(folder: Path | None, slug: str) -> list[Path]:
    if folder is None:
        return []
    files = [p for p in folder.rglob("*") if p.is_file()]
    foreign = FOREIGN_NAME.get(slug)
    if foreign:
        files = [p for p in files if not foreign.search(p.name)]
    web = sorted((p for p in files if p.suffix.lower() in WEB_EXTS), key=natural_key)
    heic = sorted((p for p in files if p.suffix.lower() in HEIC_EXTS), key=natural_key)
    return web + heic


def extra_candidates(drive_root: Path, trike: str, slug: str) -> list[Path]:
    paths = []
    for ref in EXTRA.get((trike, slug), []):
        path = REPO / "frontend/public" / ref[len("site:/"):] if ref.startswith("site:") else drive_root / ref
        if path.is_file():
            paths.append(path)
        else:
            print(f"  missing extra for {trike} {slug}: {ref}")
    return paths


def pick_images(candidates: list[Path]) -> list[Path]:
    # Same shot exported twice (e.g. "X (1).jpg" + "X (1).png"): keep one
    seen: set[str] = set()
    hashes: list[int] = []
    picked: list[Path] = []
    for p in candidates:
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
    parser.add_argument("--drive-root", type=Path, help="Drive download root for EXTRA (default: parent of --source)")
    args = parser.parse_args()
    drive_root = args.drive_root or args.source.parent

    manifest: dict[str, dict[str, list[str]]] = {}
    for trike, (folder_name, by_number) in TRIKES.items():
        root = args.source / folder_name
        manifest[trike] = {}
        folders: dict[str, Path] = {}
        for folder in sorted(root.iterdir(), key=natural_key):
            if not folder.is_dir():
                continue
            slug = by_number.get(folder_number(folder.name))
            if not slug:
                print(f"skip {trike}: {folder.name}")
                continue
            folders[slug] = folder
        slugs = list(folders) + [s for (t, s) in EXTRA if t == trike and s not in folders]
        for slug in slugs:
            candidates = folder_candidates(folders.get(slug), slug) + extra_candidates(drive_root, trike, slug)
            urls = []
            for old in (OUT / trike).glob(f"{slug}-*.jpg"):
                if re.fullmatch(rf"{re.escape(slug)}-\d+\.jpg", old.name):
                    old.unlink()
            for i, src in enumerate(pick_images(candidates), start=1):
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
