"""Canonical accessory thumbnails for configurador / catalog (slug → static path)."""
from __future__ import annotations

import re
import uuid
from typing import Optional

NOMADIC_PRODUCT_ID = uuid.UUID("d1e2f3a4-b5c6-7890-1234-567890abcdef")

ACCESSORY_IMAGE_BY_SLUG = {
    "cruise-control": "/images/parts/front-bar-protection.png",
    "camel-back": "/images/parts/passenger-harness.png",
    "sun-roof-netting": "/images/parts/sun-roof-netting.png",
    "front-bar-protection": "/images/parts/front-bar-protection.png",
    "front-brake": "/images/parts/front-fork.png",
    "rear-mirror": "/images/parts/instrument-kit-vanguard.png",
    "mirror": "/images/parts/instrument-kit-vanguard.png",
    "cockpit-liner": "/images/parts/cockpit-liner.png",
    "parachute-container": "/images/parts/parachute-container.png",
    "lateral-bag": "/images/parts/lateral-bag-explorer.png",
    "lateral-bag-explorer": "/images/parts/lateral-bag-explorer.png",
    "bottom-explorer-bag": "/images/parts/bottom-explorer-bag.png",
    "fuel-gauge-vanguard": "/images/parts/instrument-kit-vanguard.png",
    "auxiliary-lights": "/images/parts/instrument-kit-vanguard.png",
    "carabiners": "/images/parts/front-axle.png",
    "propeller-guard": "/images/parts/pilot-dynamic-cage.png",
    "ballistic-parachute": "/images/parts/parachute-container.png",
}

GENERIC_IMAGES = {
    "/images/parts/cockpit-liner.png",
}


def normalize_accessory_slug(slug: str) -> str:
    if not slug:
        return ""
    return re.sub(r"^(vanguard|nomadic|acc)-", "", slug)


def _is_generic_image(src: Optional[str]) -> bool:
    if not src or not str(src).strip():
        return True
    normalized = str(src).strip().split("?")[0]
    return normalized in GENERIC_IMAGES or "cockpit-liner" in normalized


def resolve_accessory_image(
    slug: str,
    cms_image: Optional[str],
    producto_id: uuid.UUID,
) -> Optional[str]:
    key = normalize_accessory_slug(slug)

    if key in ("instrument-kit", "electrical-kit"):
        if producto_id == NOMADIC_PRODUCT_ID:
            return "/images/parts/instrument-kit-nomadic.png"
        return "/images/parts/instrument-kit-vanguard.png"

    if key in ACCESSORY_IMAGE_BY_SLUG:
        return ACCESSORY_IMAGE_BY_SLUG[key]

    cms = (cms_image or "").strip()
    if cms and not _is_generic_image(cms):
        return cms
    return cms or None
