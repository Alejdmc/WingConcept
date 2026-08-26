"""Canonical accessory thumbnails for configurador / catalog (slug → static path)."""
from __future__ import annotations

import re
import uuid
from typing import Optional

NOMADIC_PRODUCT_ID = uuid.UUID("d1e2f3a4-b5c6-7890-1234-567890abcdef")
VANGUARD_PRODUCT_ID = uuid.UUID("c1a2b3d4-e5f6-7890-1234-567890abcdef")

VANGUARD_HERO_IMAGE = "/images/vanguard/3.png"
NOMADIC_HERO_IMAGE = "/images/nomadic/2.jpg"

SLUG_ALIASES = {
    "mirror": "rear-mirror",
    "rear-view-mirror": "rear-mirror",
}

PART_IMAGE_BY_SLUG = {
    "front-axle": "/images/parts/front-axle.png",
    "front-fork": "/images/parts/front-fork.png",
    "front-bar-protection": "/images/parts/front-bar-protection.png",
    "parachute-container": "/images/parts/parachute-container.png",
    "pilot-harness": "/images/parts/pilot-harness.png",
    "passenger-harness": "/images/parts/passenger-harness.png",
    "pilot-dynamic-cage": "/images/parts/pilot-dynamic-cage.png",
    "pilot-hunter-cage": "/images/parts/pilot-hunter-cage.png",
    "back-axle": "/images/parts/back-axle.png",
    "rock-guard": "/images/parts/rock-guard.png",
}

ACCESSORY_IMAGE_BY_SLUG = {
    "accelerator-pedal": "/images/parts/accelerator-pedal.png",
    "cruise-control": "/images/parts/cruise-control.png",
    "camel-back": "/images/parts/passenger-harness.png",
    "sun-roof-netting": "/images/parts/sun-roof-netting.png",
    "front-bar-protection": "/images/parts/front-bar-protection.png",
    "front-brake": "/images/parts/front-fork.png",
    "rear-mirror": "/images/parts/rear-mirror.png",
    "cockpit-liner": "/images/parts/cockpit-liner.png",
    "parachute-container": "/images/parts/parachute-container.png",
    "reserve-chute": "/images/parts/parachute-container.png",
    "lateral-bag": "/images/parts/lateral-bag-explorer.png",
    "lateral-bag-explorer": "/images/parts/lateral-bag-explorer.png",
    "bottom-explorer-bag": "/images/parts/bottom-explorer-bag.png",
    "fuel-gauge-vanguard": "/images/parts/fuel-gauge-vanguard.png",
    "auxiliary-lights": "/images/parts/auxiliary-lights.png",
    "instrument-kit-vanguard": "/images/parts/instrument-kit-vanguard.png",
    "instrument-kit": "/images/parts/instrument-kit-vanguard.png",
    "instrument-kit-nomadic": "/images/parts/instrument-kit-nomadic.png",
    "electrical-kit": "/images/parts/electrical-kit.png",
    "carabiners": "/images/parts/carabiners.png",
    "propeller-guard": "/images/parts/pilot-dynamic-cage.png",
    "ballistic-parachute": "/images/parts/parachute-container.png",
}

PROPELLER_IMAGE_BY_SLUG = {
    "bipala": "/images/propellers/bipala.jpg",
    "tripala": "/images/propellers/bipala.jpg",
    "no-propeller": None,
}

GENERIC_IMAGES = {
    "/images/parts/cockpit-liner.png",
}

LEGACY_VANGUARD_IMAGES = frozenset({
    "/images/1vanguard.png",
    "/images/paramotor_trike_ejemplo.PNG",
})

LEGACY_NOMADIC_IMAGES = frozenset({
    "/images/nomadic/1.jpg",
    "/images/nomadic1.png",
    "/images/paramotor_trike_ejemplo.PNG",
})


def _is_legacy_nomadic_image(url: Optional[str]) -> bool:
    if not url or not isinstance(url, str):
        return True
    trimmed = url.strip().split("?")[0]
    if trimmed in LEGACY_NOMADIC_IMAGES:
        return True
    basename = trimmed.rsplit("/", 1)[-1].lower()
    if basename in {"1.jpg", "nomadic1.png", "paramotor_trike_ejemplo.png"}:
        return True
    return trimmed.lower().endswith("/nomadic/1.jpg")


def _filter_nomadic_images(urls: Optional[list]) -> list:
    if not urls:
        return []
    return [u for u in urls if u and not _is_legacy_nomadic_image(u)]


def normalize_accessory_slug(slug: str) -> str:
    if not slug:
        return ""
    key = re.sub(r"^(vanguard|nomadic|acc|part)-", "", slug)
    return SLUG_ALIASES.get(key, key)


def _is_generic_image(src: Optional[str]) -> bool:
    if not src or not str(src).strip():
        return True
    normalized = str(src).strip().split("?")[0]
    return normalized in GENERIC_IMAGES or "cockpit-liner" in normalized


def is_legacy_vanguard_image(url: Optional[str]) -> bool:
    if not url or not isinstance(url, str):
        return True
    trimmed = url.strip().split("?")[0]
    if trimmed in LEGACY_VANGUARD_IMAGES:
        return True
    basename = trimmed.rsplit("/", 1)[-1].lower()
    if re.match(r"^\d+vanguard\.png$", basename):
        return True
    return False


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

    if key in PART_IMAGE_BY_SLUG:
        return PART_IMAGE_BY_SLUG[key]

    if key in ACCESSORY_IMAGE_BY_SLUG:
        return ACCESSORY_IMAGE_BY_SLUG[key]

    if key in PROPELLER_IMAGE_BY_SLUG:
        return PROPELLER_IMAGE_BY_SLUG[key]

    cms = (cms_image or "").strip()
    if cms and not _is_generic_image(cms):
        return cms

    if key:
        return f"/images/parts/{key}.png"

    return cms or None


def resolve_product_image(
    slug: str,
    categoria: Optional[str],
    producto_id: uuid.UUID,
    imagenes: Optional[list],
    contenido_extra: Optional[dict],
) -> Optional[str]:
    """Single source of truth for product thumbnails (API + cart)."""
    extra = contenido_extra or {}
    cms = imagenes[0] if imagenes else None

    if categoria in ("repuestos", "accesorios"):
        return resolve_accessory_image(slug, cms, producto_id)

    if slug == "vanguard-v8":
        return VANGUARD_HERO_IMAGE

    if slug == "nomadic-trike":
        return NOMADIC_HERO_IMAGE

    listing = extra.get("listing") or {}
    if listing.get("image"):
        return listing["image"]
    if imagenes:
        return imagenes[0]
    return None
