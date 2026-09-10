"""Chassis color presets — must stay aligned with frontend/lib/chassisColors.js and CMS seed."""

from __future__ import annotations

CHASSIS_COLOR_IDS = frozenset({
    "candy-red-white",
    "candy-blue-white",
    "candy-purple-white",
    "custom",
    # Disruptor Paramotor
    "white-red-candy",
    "white-purple-candy",
    "white-blue-candy",
    "customized",
    # Legacy slugs (older frontend / Disruptor seed builds)
    "red-candy-white",
    "blue-candy-white",
    "purple-candy-white",
    "white",
    "red-candy",
    "blue-candy",
    "purple-candy",
    "candy-red",
    "candy-blue",
    "candy-purple",
    "grey",
})

CUSTOM_COLOR_ID = "custom"
CUSTOM_COLOR_SURCHARGE = 100.0


def chassis_color_price(color_id: str | None, colors_catalog: dict | None = None) -> float:
    if not color_id:
        return 0.0
    if color_id in (CUSTOM_COLOR_ID, "customized"):
        if colors_catalog and color_id in colors_catalog:
            return float(colors_catalog[color_id] or CUSTOM_COLOR_SURCHARGE)
        return CUSTOM_COLOR_SURCHARGE
    if color_id in CHASSIS_COLOR_IDS:
        return 0.0
    if colors_catalog and color_id in colors_catalog:
        return float(colors_catalog[color_id] or 0.0)
    return 0.0


def is_allowed_chassis_color(color_id: str | None, colors_catalog: dict | None = None) -> bool:
    if not color_id:
        return True
    if color_id == CUSTOM_COLOR_ID:
        return True
    if color_id in CHASSIS_COLOR_IDS:
        return True
    if colors_catalog and color_id in colors_catalog:
        return True
    return False
