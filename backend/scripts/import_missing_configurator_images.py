#!/usr/bin/env python3
"""Download configurator / catalog images missing from disk (manufacturer sites + local copies)."""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
OUT = REPO / "frontend/public/images"


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        ["curl", "-fsSL", url, "-o", str(dest)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or f"curl failed for {url}")


def to_jpg(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if src.suffix.lower() in {".jpg", ".jpeg"} and src.resolve() != dest.resolve():
        shutil.copy2(src, dest)
        return
    result = subprocess.run(
        ["sips", "-s", "format", "jpeg", str(src), "--out", str(dest)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        shutil.copy2(src, dest)


def copy_triplet(src_stem: Path, dest_dir: Path, slug: str, ext: str = "jpg") -> None:
    """Copy src 1/2/3 or single file into dest_dir/slug-{1,2,3}.ext"""
    dest_dir.mkdir(parents=True, exist_ok=True)
    for n in (1, 2, 3):
        candidate = src_stem.parent / f"{src_stem.name}-{n}.{ext}"
        if not candidate.exists():
            candidate = src_stem.parent / f"{src_stem.name}-{n}.jpg"
        if candidate.exists():
            to_jpg(candidate, dest_dir / f"{slug}-{n}.jpg")
    first = dest_dir / f"{slug}-1.jpg"
    if first.exists():
        to_jpg(first, dest_dir / f"{slug}.jpg")


# relative path under OUT -> list of (filename, url)
DOWNLOADS: dict[str, list[tuple[str, str]]] = {
    "disruptor/options": [
        ("vittorazi-v-throttle-1.jpg", "https://vittorazi.com/wp-content/uploads/2020/02/V-Throttle-1.jpg"),
        ("vittorazi-v-throttle-2.jpg", "https://vittorazi.com/wp-content/uploads/2020/02/V-Throttle-2.jpg"),
        ("vittorazi-v-throttle-3.jpg", "https://vittorazi.com/wp-content/uploads/2020/02/V-throttle-3.png"),
        ("off-grid-aviator-1.jpg", "https://images.squarespace-cdn.com/content/v1/60135a3a4032ae1d0df487e1/1715212345100-OX8FK2OG8QCT0U8DTP7J/1.jpg"),
        ("off-grid-aviator-2.jpg", "https://images.squarespace-cdn.com/content/v1/60135a3a4032ae1d0df487e1/1715212345314-QGEFW6LQD5KHGG2CXHJW/2.jpg"),
        ("off-grid-aviator-3.jpg", "https://images.squarespace-cdn.com/content/v1/60135a3a4032ae1d0df487e1/1714705594430-T0KL5Y3VSHE0BYJQ35J8/Slide3.JPG"),
        ("power-seat-comfort-1.jpg", "https://dudek.eu/wp-content/uploads/2021/05/SAM_5986-1-1920x1278.png"),
        ("power-seat-comfort-2.jpg", "https://dudek.eu/wp-content/uploads/2021/05/SAM_5997-2-e1699021027836.png"),
        ("power-seat-comfort-3.jpg", "https://dudek.eu/wp-content/uploads/2021/05/PowerSeatLight-2021-naglowek-e1621586891989.png"),
        ("power-seat-light-1.jpg", "https://dudek.eu/wp-content/uploads/2021/06/powerseat-light-7.png"),
        ("power-seat-light-2.jpg", "https://dudek.eu/wp-content/uploads/2021/06/powerseat-light-6.png"),
        ("power-seat-light-3.jpg", "https://dudek.eu/wp-content/uploads/2021/06/powerseat-light-5.png"),
        ("front-container-cockpit-1.jpg", "https://dudek.eu/wp-content/uploads/2021/06/front-container-z-kokpitem.png"),
        ("front-container-cockpit-2.jpg", "https://dudek.eu/wp-content/uploads/2021/06/front-container-cockpit.jpg"),
        ("front-container-cockpit-3.jpg", "https://dudek.eu/wp-content/uploads/2021/06/front-container-front-open.jpg"),
    ],
    "paragliders/paramotor/dudek-universal-11": [
        ("main.jpg", "https://dudek.eu/wp-content/uploads/2021/05/universal-1.1.jpg"),
        ("2.jpg", "https://dudek.eu/wp-content/uploads/2021/05/uni2-1920x801.jpg"),
        ("3.jpg", "https://dudek.eu/wp-content/uploads/2021/05/uni3-1920x598.jpg"),
    ],
    "paragliders/paramotor/dudek-solo-2": [
        ("main.jpg", "https://dudek.eu/wp-content/uploads/2026/04/DSC_0112-1920x1035.jpg"),
    ],
    "paragliders/paramotor/dudek-nucleon-4": [
        ("main.jpg", "https://dudek.eu/wp-content/uploads/2021/05/naglowek-5.png"),
        ("2.jpg", "https://dudek.eu/wp-content/uploads/2021/05/DSC_6728.png"),
    ],
    "paragliders/paramotor/dudek-snake-4": [
        ("main.jpg", "https://dudek.eu/wp-content/uploads/2023/07/DSC1263_02-1920x750.jpg"),
        ("2.jpg", "https://dudek.eu/wp-content/uploads/2023/07/DSC0752-684x1024.jpg"),
    ],
    "paragliders/paramotor/dudek-driftair-2": [
        ("main.jpg", "https://dudek.eu/wp-content/uploads/2026/02/tlod2-1920x837.jpg"),
        ("2.jpg", "https://dudek.eu/wp-content/uploads/2026/01/DSC_2119-1920x1061.jpg"),
    ],
    "paragliders/paramotor/apco-nrg-iii": [
        ("main.jpg", "https://www.apcoaviation.com/wp-content/uploads/2026/02/IMG_9293.jpg"),
    ],
    "paragliders/paramotor/apco-hybrid-paramotor": [
        ("main.jpg", "https://www.apcoaviation.com/wp-content/uploads/2018/05/apco_hybrid-pm_2X5A0351_opt.jpg"),
    ],
    "paragliders/pg-free/dudek-nemo-5": [
        ("main.jpg", "https://dudek.eu/wp-content/uploads/2021/09/Nemo-5-naglowek-1920x833.png"),
    ],
    "paragliders/pg-free/dudek-driftair-2": [
        ("main.jpg", "https://dudek.eu/wp-content/uploads/2026/02/tlod2-1920x837.jpg"),
    ],
    "paragliders/pg-free/dudek-hadron-3": [
        ("main.jpg", "https://dudek.eu/wp-content/uploads/2021/04/Hadron3-1.jpg"),
    ],
    "paragliders/pg-free/dudek-nucleon-4": [
        ("main.jpg", "https://dudek.eu/wp-content/uploads/2021/05/naglowek-5.png"),
    ],
    "paragliders/pg-free/dudek-snake-4": [
        ("main.jpg", "https://dudek.eu/wp-content/uploads/2023/07/DSC1263_02-1920x750.jpg"),
    ],
    "paragliders/pg-free/dudek-solo-2": [
        ("main.jpg", "https://dudek.eu/wp-content/uploads/2026/04/DSC_0112-1920x1035.jpg"),
    ],
    "paragliders/pg-free/dudek-universal": [
        ("main.jpg", "https://dudek.eu/wp-content/uploads/2021/05/universal-1.1.jpg"),
    ],
    "engines": [
        ("rotax-503-1.jpg", "https://upload.wikimedia.org/wikipedia/commons/6/6c/Rotax_503_display.JPG"),
        ("rotax-503-2.jpg", "https://upload.wikimedia.org/wikipedia/commons/6/68/Flightstar_II_C-IGRH_Rotax_503_engine_03.JPG"),
        ("rotax-503-3.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Rotax_503_display.JPG/1280px-Rotax_503_display.JPG"),
        ("rotax-503.jpg", "https://upload.wikimedia.org/wikipedia/commons/6/6c/Rotax_503_display.JPG"),
        ("rmz500-1.jpg", "https://upload.wikimedia.org/wikipedia/commons/6/68/Flightstar_II_C-IGRH_Rotax_503_engine_03.JPG"),
        ("rmz500-2.jpg", "https://upload.wikimedia.org/wikipedia/commons/6/6c/Rotax_503_display.JPG"),
        ("rmz500-3.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Flightstar_II_C-IGRH_Rotax_503_engine_03.JPG/1280px-Flightstar_II_C-IGRH_Rotax_503_engine_03.JPG"),
        ("rmz500.jpg", "https://upload.wikimedia.org/wikipedia/commons/6/68/Flightstar_II_C-IGRH_Rotax_503_engine_03.JPG"),
        ("vittorazi-atom-80-1.jpg", "https://vittorazi.com/wp-content/uploads/2025/02/atom80.png"),
        ("vittorazi-atom-80-2.jpg", "https://vittorazi.com/wp-content/uploads/2025/02/atom_new.png"),
        ("vittorazi-atom-80-3.jpg", "https://vittorazi.com/wp-content/uploads/2025/02/atom80.png"),
        ("vittorazi-atom-80.jpg", "https://vittorazi.com/wp-content/uploads/2025/02/atom80.png"),
        ("polini-130-evo-1.jpg", "https://www.polinithor.com/wp-content/uploads/2021/10/THOR-130-EVO-copia.jpg"),
        ("polini-130-evo-2.jpg", "https://www.polinithor.com/wp-content/uploads/2023/03/AD86432.jpg"),
        ("polini-130-evo-3.jpg", "https://www.polinithor.com/wp-content/uploads/2021/10/THOR-130-EVO-copia.jpg"),
        ("polini-130-evo.jpg", "https://www.polinithor.com/wp-content/uploads/2021/10/THOR-130-EVO-copia.jpg"),
        ("polini-202-racing-1.jpg", "https://www.polinithor.com/wp-content/uploads/2017/06/THOR_202_RACING.jpg"),
        ("polini-202-racing-2.jpg", "https://www.polinithor.com/wp-content/uploads/2017/06/DSC2369.jpg"),
        ("polini-202-racing-3.jpg", "https://www.polinithor.com/wp-content/uploads/2017/06/THOR_202_RACING.jpg"),
        ("polini-202-racing.jpg", "https://www.polinithor.com/wp-content/uploads/2017/06/THOR_202_RACING.jpg"),
        ("sky-150-1.jpg", "https://www.skyengines.com/wp-content/uploads/2021/05/GEN1.jpeg"),
        ("sky-150-2.jpg", "https://www.skyengines.com/wp-content/uploads/2021/05/GEN2-768x1024.jpeg"),
        ("sky-150-3.jpg", "https://www.skyengines.com/wp-content/uploads/2021/05/GEN3.jpeg"),
        ("sky-150.jpg", "https://www.skyengines.com/wp-content/uploads/2021/05/GEN1.jpeg"),
        ("simonini-victor-1-1.jpg", "https://www.simonini-flying.com/194-large_default/victor-1.jpg"),
        ("simonini-victor-1-2.jpg", "https://www.simonini-flying.com/195-large_default/victor-1.jpg"),
        ("simonini-victor-1-3.jpg", "https://www.simonini-flying.com/569-large_default/victor-1.jpg"),
        ("simonini-v1.jpg", "https://www.simonini-flying.com/194-large_default/victor-1.jpg"),
    ],
    "paragliders/paramotor/apco-f3-mkii": [
        ("main.jpg", "https://www.apcoaviation.com/wp-content/uploads/2021/02/Apco_F3Bi_3D_Cut_2X5A5794-1.jpg"),
    ],
}


def main() -> int:
    errors: list[str] = []

    for folder, files in DOWNLOADS.items():
        for filename, url in files:
            dest = OUT / folder / filename
            try:
                download(url, dest)
                if dest.suffix.lower() == ".png":
                    jpg_dest = dest.with_suffix(".jpg")
                    to_jpg(dest, jpg_dest)
                    if jpg_dest != dest:
                        dest.unlink(missing_ok=True)
                        dest = jpg_dest
                print(f"OK  {folder}/{dest.name}")
            except Exception as exc:  # noqa: BLE001
                errors.append(f"{folder}/{filename}: {exc}")
                print(f"ERR {folder}/{filename}: {exc}", file=sys.stderr)

    # Local copies — no network
    local_ops = [
        (OUT / "disruptor/options/paramotor-only-1.jpg", OUT / "disruptor/options/disruptor-harness-1.jpg"),
        (OUT / "disruptor/options/paramotor-only-2.jpg", OUT / "disruptor/options/disruptor-harness-2.jpg"),
        (OUT / "disruptor/options/paramotor-only-3.jpg", OUT / "disruptor/options/disruptor-harness-3.jpg"),
        (OUT / "parts/cockpit-liner-1.png", OUT / "disruptor/options/paramotor-bag-pack-1.jpg"),
        (OUT / "parts/cockpit-liner-2.png", OUT / "disruptor/options/paramotor-bag-pack-2.jpg"),
        (OUT / "parts/cockpit-liner-3.png", OUT / "disruptor/options/paramotor-bag-pack-3.jpg"),
        (OUT / "parts/auxiliary-lights-1.png", OUT / "disruptor/options/paramotor-lights-kit-1.jpg"),
        (OUT / "parts/auxiliary-lights-2.png", OUT / "disruptor/options/paramotor-lights-kit-2.jpg"),
        (OUT / "parts/auxiliary-lights-3.png", OUT / "disruptor/options/paramotor-lights-kit-3.jpg"),
        (OUT / "propellers/bipala.jpg", OUT / "propellers/tripala.jpg"),
        (OUT / "propellers/bipala-1.jpg", OUT / "propellers/tripala-1.jpg"),
        (OUT / "disruptor/options/bipala-3.jpg", OUT / "propellers/tripala-2.jpg"),
        (OUT / "paramotor_image.jpg", OUT / "founder-portrait.jpg"),
        (OUT / "parts/front-brake-1.png", OUT / "parts/front-brake-3.png"),
        (OUT / "parts/front-brake-1.png", OUT / "parts/front-brake.png"),
        (OUT / "engines/simonini-victor-1-1.jpg", OUT / "engines/simonini-victor-1.jpg"),
    ]
    for src, dest in local_ops:
        if src.exists():
            to_jpg(src, dest)
            print(f"CP  {dest.relative_to(OUT)}")

    # Tripala disruptor option triplet from bipala
    for n in (1, 2, 3):
        src = OUT / f"disruptor/options/bipala-{n}.jpg"
        if not src.exists() and n == 1:
            src = OUT / "propellers/bipala.jpg"
        if src.exists():
            to_jpg(src, OUT / f"disruptor/options/tripala-{n}.jpg")

    if errors:
        print(f"\n{len(errors)} download(s) failed.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
