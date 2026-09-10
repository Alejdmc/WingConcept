#!/usr/bin/env python3
"""Download trike paraglider images from manufacturer product pages."""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse

REPO = Path(__file__).resolve().parents[2]
OUT = REPO / "frontend/public/images/paragliders"
MANIFEST_OUT = REPO / "frontend/lib/trikeParagliderManifest.json"

# slug -> list of (local_name, url)
DOWNLOADS: dict[str, list[tuple[str, str]]] = {
    "dudek-orca-6": [
        ("tech-weight-ranges.png", "https://dudek.eu/wp-content/uploads/2024/08/zakresy-mas-startowych_Orca6-1920x538.png"),
        ("gallery-1.jpg", "https://dudek.eu/wp-content/uploads/2024/08/DSC0738-1920x1280.jpg"),
        ("gallery-2.jpg", "https://dudek.eu/wp-content/uploads/2024/08/DSC0615-1920x1280.jpg"),
        ("gallery-3.jpg", "https://dudek.eu/wp-content/uploads/2024/08/DSC0448_1-1-1920x1280.jpg"),
        ("petrol-main.png", "https://dudek.eu/wp-content/uploads/2024/08/Orca-6-41_Petrol_S1-e1724070332412-1920x1711.png"),
        ("petrol-2.png", "https://dudek.eu/wp-content/uploads/2024/08/Orca-6-41_Petrol_S2-e1723619736558.png"),
        ("petrol-3.png", "https://dudek.eu/wp-content/uploads/2024/08/Orca-6-41_Petrol_U-e1723619707984.png"),
        ("petrol-thumb.png", "https://dudek.eu/wp-content/uploads/2024/08/Orca-6-41_Petrol_L-e1723619759573.png"),
        ("orange-main.png", "https://dudek.eu/wp-content/uploads/2024/08/Orca-6-41_Orange_S1-e1724071804624-1920x1663.png"),
        ("orange-2.png", "https://dudek.eu/wp-content/uploads/2024/08/Orca-6-41_Orange_S2-e1723620130459.png"),
        ("orange-3.png", "https://dudek.eu/wp-content/uploads/2024/08/Orca-6-41_Orange_U-e1723620104742.png"),
        ("orange-thumb.png", "https://dudek.eu/wp-content/uploads/2024/08/Orca-6-41_Orange_L-e1723620155861.png"),
        ("rubine-main.png", "https://dudek.eu/wp-content/uploads/2024/08/Orca-6-41_Rubine_S1-e1724071862440-1920x1705.png"),
        ("rubine-2.png", "https://dudek.eu/wp-content/uploads/2024/08/Orca-6-41_Rubine_S2-e1723620034646.png"),
        ("rubine-3.png", "https://dudek.eu/wp-content/uploads/2024/08/Orca-6-41_Rubine_U-e1723619893807.png"),
        ("rubine-thumb.png", "https://dudek.eu/wp-content/uploads/2024/08/Orca-6-41_Rubine_L-e1723620064584.png"),
    ],
    "dudek-cabrio": [
        ("gallery-1.jpg", "https://dudek.eu/wp-content/uploads/2021/05/Cabrio-1.jpg"),
        ("gallery-2.jpg", "https://dudek.eu/wp-content/uploads/2021/05/Cabrio-2.jpg"),
        ("gallery-3.jpg", "https://dudek.eu/wp-content/uploads/2021/05/Cabrio-3.jpg"),
        ("boogie-main.png", "https://dudek.eu/wp-content/uploads/2021/05/Cabrio-34_Boogie_S.png"),
        ("boogie-2.png", "https://dudek.eu/wp-content/uploads/2021/05/Cabrio-34_Boogie_U.png"),
        ("boogie-thumb.png", "https://dudek.eu/wp-content/uploads/2021/05/Cabrio-34_Boogie_L.png"),
        ("modern-main.png", "https://dudek.eu/wp-content/uploads/2021/05/Cabrio-34_Modern_S.png"),
        ("modern-2.png", "https://dudek.eu/wp-content/uploads/2021/05/Cabrio-34_Modern_U.png"),
        ("modern-thumb.png", "https://dudek.eu/wp-content/uploads/2021/05/Cabrio-34_Modern_L.png"),
        ("tribal-main.png", "https://dudek.eu/wp-content/uploads/2021/05/Cabrio-34_Tribal_S.png"),
        ("tribal-2.png", "https://dudek.eu/wp-content/uploads/2021/05/Cabrio-34_Tribal_U.png"),
        ("tribal-thumb.png", "https://dudek.eu/wp-content/uploads/2021/05/Cabrio-34_Tribal_L.png"),
    ],
    "dudek-boson": [
        ("tech-weight-ranges.png", "https://dudek.eu/wp-content/uploads/2021/05/Boson-weight-ranges.png"),
        ("gallery-1.jpg", "https://dudek.eu/wp-content/uploads/2021/05/DSC_9031-1920x1282.jpg"),
        ("mambo-main.png", "https://dudek.eu/wp-content/uploads/2021/05/Boson-31_lift_Mambo_S.png"),
        ("mambo-2.png", "https://dudek.eu/wp-content/uploads/2021/05/Boson-31_lift_Mambo_U.png"),
        ("mambo-thumb.png", "https://dudek.eu/wp-content/uploads/2021/05/Boson-31_lift_Mambo_L.png"),
        ("modern-main.png", "https://dudek.eu/wp-content/uploads/2021/05/Boson-31_lift_Modern_S.png"),
        ("modern-2.png", "https://dudek.eu/wp-content/uploads/2021/05/Boson-31_lift_Modern_U.png"),
        ("modern-thumb.png", "https://dudek.eu/wp-content/uploads/2021/05/Boson-31_lift_Modern_L.png"),
        ("rumba-main.png", "https://dudek.eu/wp-content/uploads/2021/05/Boson-31_lift_Rumba_S.png"),
        ("rumba-2.png", "https://dudek.eu/wp-content/uploads/2021/05/Boson-31_lift_Rumba_U.png"),
        ("rumba-thumb.png", "https://dudek.eu/wp-content/uploads/2021/05/Boson-31_lift_Rumba_L.png"),
    ],
    "apco-play-42-ul": [
        ("tech-3d.jpg", "https://www.apcoaviation.com/wp-content/uploads/2017/12/play42_3d.jpg"),
        ("scheme-1-main.jpg", "https://www.apcoaviation.com/wp-content/uploads/2017/12/play42_3.jpg"),
        ("scheme-1-2.jpg", "https://www.apcoaviation.com/wp-content/uploads/2017/12/play42_9.jpg"),
        ("scheme-1-thumb.png", "https://www.apcoaviation.com/wp-content/uploads/2024/11/play42_colors_horizontal_code-01.png"),
        ("scheme-2-main.jpg", "https://www.apcoaviation.com/wp-content/uploads/2017/12/play42_10.jpg"),
        ("scheme-2-2.jpg", "https://www.apcoaviation.com/wp-content/uploads/2017/12/play42_14.jpg"),
        ("scheme-2-thumb.png", "https://www.apcoaviation.com/wp-content/uploads/2024/11/play42_colors_horizontal_code-02.png"),
        ("scheme-3-main.jpg", "https://www.apcoaviation.com/wp-content/uploads/2017/12/play42_16.jpg"),
        ("scheme-3-2.jpg", "https://www.apcoaviation.com/wp-content/uploads/2018/04/apco_crown_stabiliser_reinforcement_1200x800.jpg"),
        ("scheme-3-thumb.png", "https://www.apcoaviation.com/wp-content/uploads/2024/11/play42_colors_horizontal_code-03.png"),
    ],
    "apco-game-mkiii": [
        ("tech-3d.jpg", "https://www.apcoaviation.com/wp-content/uploads/2017/12/game_42_3D.jpg"),
        ("azure-main.jpg", "https://www.apcoaviation.com/wp-content/uploads/2024/02/Game-42_Azure.jpg"),
        ("azure-2.jpg", "https://www.apcoaviation.com/wp-content/uploads/2019/04/Apco_Game42_Leading-edge_shark-nose_1800x1200_2X5A1484.jpg"),
        ("azure-thumb.jpg", "https://www.apcoaviation.com/wp-content/uploads/2018/03/game42.jpg"),
        ("fire-main.jpg", "https://www.apcoaviation.com/wp-content/uploads/2024/02/Game-42_Fire.jpg"),
        ("fire-2.jpg", "https://www.apcoaviation.com/wp-content/uploads/2018/04/trailing_edge_tersioner_game_01_2X5A8768_600x400.jpg"),
        ("fire-thumb.jpg", "https://www.apcoaviation.com/wp-content/uploads/2024/02/Colors.jpg"),
        ("classic-main.jpg", "https://www.apcoaviation.com/wp-content/uploads/2024/02/Game42-MK3-riser-photo-1024x980.jpg"),
        ("classic-2.jpg", "https://www.apcoaviation.com/wp-content/uploads/2018/02/3dcut.jpg"),
        ("classic-thumb.jpg", "https://www.apcoaviation.com/wp-content/uploads/2018/02/3dcut.jpg"),
    ],
    "apco-f3bi-mkii": [
        ("tech-plan.png", "https://www.apcoaviation.com/wp-content/uploads/2026/05/3d_plan_f3_bi_mk2.png"),
        ("red-main.png", "https://www.apcoaviation.com/wp-content/uploads/2026/06/F3_bi_mk2_red5-1.png"),
        ("red-2.jpg", "https://www.apcoaviation.com/wp-content/uploads/2021/02/Apco_F3Bi_3D_Cut_2X5A5794-1.jpg"),
        ("red-thumb.png", "https://www.apcoaviation.com/wp-content/uploads/2026/06/colors_f3_bi_mk2-1.png"),
        ("sky-blue-main.png", "https://www.apcoaviation.com/wp-content/uploads/2026/06/F3_bi_mk2_skyblu14-1.png"),
        ("sky-blue-2.jpg", "https://www.apcoaviation.com/wp-content/uploads/2021/09/Apco_F3Bi_Riser_IMG-.jpg"),
        ("sky-blue-thumb.png", "https://www.apcoaviation.com/wp-content/uploads/2026/06/F3_bi_mk2_skyblu14-1.png"),
    ],
}


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return
    result = subprocess.run(
        ["curl", "-fsSL", "-A", "Mozilla/5.0", "-o", str(dest), url],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"Failed {url}: {result.stderr.strip()}")


def public_path(slug: str, filename: str) -> str:
    return f"/images/paragliders/{slug}/{filename}"


def build_manifest() -> dict:
    wings = {
        "dudek-orca-6": {
            "techImages": ["tech-weight-ranges.png"],
            "galleryImages": ["gallery-1.jpg", "gallery-2.jpg", "gallery-3.jpg"],
            "colors": [
                {"id": "petrol", "name": "Petrol", "thumb": "petrol-thumb.png", "images": ["petrol-main.png", "petrol-2.png", "petrol-3.png"]},
                {"id": "orange", "name": "Orange", "thumb": "orange-thumb.png", "images": ["orange-main.png", "orange-2.png", "orange-3.png"]},
                {"id": "rubine", "name": "Rubine", "thumb": "rubine-thumb.png", "images": ["rubine-main.png", "rubine-2.png", "rubine-3.png"]},
            ],
        },
        "dudek-cabrio": {
            "techImages": [],
            "galleryImages": ["gallery-1.jpg", "gallery-2.jpg", "gallery-3.jpg"],
            "colors": [
                {"id": "boogie", "name": "Boogie", "thumb": "boogie-thumb.png", "images": ["boogie-main.png", "boogie-2.png"]},
                {"id": "modern", "name": "Modern", "thumb": "modern-thumb.png", "images": ["modern-main.png", "modern-2.png"]},
                {"id": "tribal", "name": "Tribal", "thumb": "tribal-thumb.png", "images": ["tribal-main.png", "tribal-2.png"]},
            ],
        },
        "dudek-boson": {
            "techImages": ["tech-weight-ranges.png"],
            "galleryImages": ["gallery-1.jpg"],
            "colors": [
                {"id": "mambo", "name": "Mambo", "thumb": "mambo-thumb.png", "images": ["mambo-main.png", "mambo-2.png"]},
                {"id": "modern", "name": "Modern", "thumb": "modern-thumb.png", "images": ["modern-main.png", "modern-2.png"]},
                {"id": "rumba", "name": "Rumba", "thumb": "rumba-thumb.png", "images": ["rumba-main.png", "rumba-2.png"]},
            ],
        },
        "apco-play-42-ul": {
            "techImages": ["tech-3d.jpg"],
            "galleryImages": ["scheme-1-main.jpg"],
            "colors": [
                {"id": "scheme-1", "name": "Scheme 1", "thumb": "scheme-1-thumb.png", "images": ["scheme-1-main.jpg", "scheme-1-2.jpg"]},
                {"id": "scheme-2", "name": "Scheme 2", "thumb": "scheme-2-thumb.png", "images": ["scheme-2-main.jpg", "scheme-2-2.jpg"]},
                {"id": "scheme-3", "name": "Scheme 3", "thumb": "scheme-3-thumb.png", "images": ["scheme-3-main.jpg", "scheme-3-2.jpg"]},
            ],
        },
        "apco-game-mkiii": {
            "techImages": ["tech-3d.jpg"],
            "galleryImages": ["azure-main.jpg"],
            "colors": [
                {"id": "azure", "name": "Azure", "thumb": "azure-thumb.jpg", "images": ["azure-main.jpg", "azure-2.jpg"]},
                {"id": "fire", "name": "Fire", "thumb": "fire-thumb.jpg", "images": ["fire-main.jpg", "fire-2.jpg"]},
                {"id": "classic", "name": "Classic", "thumb": "classic-thumb.jpg", "images": ["classic-main.jpg", "classic-2.jpg"]},
            ],
        },
        "apco-f3bi-mkii": {
            "techImages": ["tech-plan.png"],
            "galleryImages": ["red-main.png"],
            "colors": [
                {"id": "red", "name": "Red", "thumb": "red-thumb.png", "images": ["red-main.png", "red-2.jpg"]},
                {"id": "sky-blue", "name": "Sky Blue", "thumb": "sky-blue-thumb.png", "images": ["sky-blue-main.png", "sky-blue-2.jpg"]},
            ],
        },
    }

    manifest: dict = {}
    for slug, wing in wings.items():
        manifest[slug] = {
            "techImages": [public_path(slug, f) for f in wing["techImages"]],
            "galleryImages": [public_path(slug, f) for f in wing["galleryImages"]],
            "colors": [
                {
                    **color,
                    "thumb": public_path(slug, color["thumb"]),
                    "images": [public_path(slug, f) for f in color["images"]],
                }
                for color in wing["colors"]
            ],
        }
    return manifest


def main() -> int:
    errors: list[str] = []
    for slug, files in DOWNLOADS.items():
        for filename, url in files:
            dest = OUT / slug / filename
            try:
                download(url, dest)
                print(f"OK  {slug}/{filename}")
            except Exception as exc:  # noqa: BLE001
                errors.append(f"{slug}/{filename}: {exc}")
                print(f"ERR {slug}/{filename}: {exc}", file=sys.stderr)

    manifest = build_manifest()
    MANIFEST_OUT.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"\nWrote manifest -> {MANIFEST_OUT.relative_to(REPO)}")

    if errors:
        print(f"\n{len(errors)} download(s) failed.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
