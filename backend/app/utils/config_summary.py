"""Human-readable configuration lines for orders, admin UI, and emails."""
from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

CONFIG_LABELS = {
    "engine": "Engine",
    "chassisType": "Chassis",
    "finish": "Finish",
    "handThrottle": "Hand throttle",
    "propeller": "Propeller",
    "color": "Color",
    "colorId": "Color",
    "chassisColor": "Chassis color",
    "accentColor": "Accent color",
    "peripheralColor": "Peripheral color",
    "firstName": "Guest first name",
    "lastName": "Guest last name",
    "phone": "Phone",
    "age": "Age",
    "locationId": "Location",
    "locationName": "Location",
    "duration": "Duration",
}

UPGRADE_LABELS = {
    "sun-roof-netting": "Sun-roof netting",
    "cruise-control": "Cruise control",
    "camel-back": "Camel back",
    "instrument-kit": "Instrument kit",
    "electrical-kit": "Electrical kit",
    "rear-mirror": "Rear mirror",
    "front-brake": "Front brake",
    "front-bar-protection": "Padded roll bar",
    "cockpit-liner": "Cockpit liner",
    "parachute-container": "Parachute container",
    "lateral-bag": "Side explorer cases",
    "lateral-bag-explorer": "Lateral bag explorer",
    "bottom-explorer-bag": "Bottom explorer bag",
    "reserve-chute": "Reserve parachute",
    "auxiliary-lights": "Auxiliary lights",
    "carabiners": "Carabiners",
    "propeller-guard": "Propeller guard",
    "rock-guard": "Rock guard",
    "fuel-gauge-vanguard": "Fuel gauge",
}


def extract_option_id(value: Any) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, str):
        cleaned = value.strip()
        return cleaned or None
    if isinstance(value, (int, float, bool)):
        return str(value)
    if isinstance(value, dict):
        for key in ("id", "slug", "name", "displayName", "hex"):
            raw = value.get(key)
            if raw is not None and str(raw).strip():
                return str(raw).strip()
    return None


def _fmt_slug(value: Any) -> str:
    raw = extract_option_id(value) or str(value or "").strip()
    if not raw:
        return ""
    if raw in UPGRADE_LABELS:
        return UPGRADE_LABELS[raw]
    cleaned = re.sub(r"^(vanguard|nomadic|acc|part)-", "", raw, flags=re.I)
    cleaned = cleaned.replace("-", " ").replace("_", " ").strip()
    if not cleaned:
        return raw
    return cleaned.title()


def format_config_lines(config: Optional[Dict[str, Any]]) -> List[Dict[str, str]]:
    if not config or not isinstance(config, dict):
        return []

    lines: List[Dict[str, str]] = []

    if config.get("bookingType") == "tourist-flight":
        guest = " ".join(
            part for part in (config.get("firstName"), config.get("lastName")) if part
        ).strip()
        if guest:
            lines.append({"label": "Guest", "value": guest})
        for key in ("phone", "age", "locationName", "locationId", "duration"):
            val = config.get(key)
            if val:
                label = CONFIG_LABELS.get(key, key.replace("_", " ").title())
                lines.append({"label": label, "value": _fmt_slug(val) if key.endswith("Id") else str(val)})
        return lines

    for key in (
        "engine", "chassisType", "finish", "handThrottle", "propeller",
        "color", "colorId", "chassisColor", "accentColor", "peripheralColor",
    ):
        val = config.get(key)
        if val:
            lines.append({"label": CONFIG_LABELS.get(key, key), "value": _fmt_slug(val)})

    upgrades = config.get("upgrades")
    if isinstance(upgrades, list) and upgrades:
        labels = [_fmt_slug(item) for item in upgrades if extract_option_id(item) or item]
        labels = [label for label in labels if label]
        if labels:
            lines.append({"label": "Accessories", "value": ", ".join(labels)})

    return lines


def format_config_text(config: Optional[Dict[str, Any]]) -> str:
    return "; ".join(
        f"{line['label']}: {line['value']}" for line in format_config_lines(config)
    )
