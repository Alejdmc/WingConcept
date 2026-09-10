"""Trike paraglider catalog — keep aligned with frontend/lib/trikeParagliderOptions.js."""

from __future__ import annotations

from typing import Dict, FrozenSet, Optional, Tuple

NO_PARAGLIDER_ID = "no-paraglider"

# slug -> (price, color_ids, size_labels)
TRIKE_PARAGLIDER_CATALOG: Dict[str, Tuple[float, FrozenSet[str], FrozenSet[str]]] = {
    "dudek-orca-6": (
        4252.0,
        frozenset({"petrol", "orange", "rubine"}),
        frozenset({"24 m²", "26 m²", "28 m²", "30 m²", "41 m²", "44 m²"}),
    ),
    "dudek-cabrio": (
        4524.0,
        frozenset({"boogie", "modern", "tribal"}),
        frozenset({"38 m²", "41 m²", "44 m²"}),
    ),
    "dudek-boson": (
        4542.0,
        frozenset({"mambo", "modern", "rumba"}),
        frozenset({"28 m²", "30 m²", "32 m²", "34 m²", "36 m²"}),
    ),
    "apco-play-42-ul": (
        3456.2,
        frozenset({"scheme-1", "scheme-2", "scheme-3"}),
        frozenset({"42 m²"}),
    ),
    "apco-game-mkiii": (
        3531.0,
        frozenset({"azure", "fire", "classic"}),
        frozenset({"41 m²", "42 m²"}),
    ),
    "apco-f3bi-mkii": (
        3580.0,
        frozenset({"red", "sky-blue"}),
        frozenset({"41 m²", "42 m²"}),
    ),
}

# Disruptor Paramotor — 12 wings (doc: archivos/Seccion de parapente...)
PARAMOTOR_PARAGLIDER_CATALOG: Dict[str, Tuple[float, FrozenSet[str], FrozenSet[str]]] = {
    **TRIKE_PARAGLIDER_CATALOG,
    "dudek-universal-11": (3560.0, frozenset({"standard"}), frozenset({"Standard"})),
    "dudek-solo-2": (3673.0, frozenset({"standard"}), frozenset({"Standard"})),
    "dudek-nucleon-4": (3969.0, frozenset({"standard"}), frozenset({"Standard"})),
    "dudek-snake-4": (4234.0, frozenset({"standard"}), frozenset({"Standard"})),
    "dudek-driftair-2": (3855.0, frozenset({"standard"}), frozenset({"Standard"})),
    "apco-nrg-iii": (3355.0, frozenset({"standard"}), frozenset({"Standard"})),
    "apco-hybrid-paramotor": (3195.0, frozenset({"standard"}), frozenset({"Standard"})),
    "apco-f3-mkii": (3341.0, frozenset({"standard"}), frozenset({"Standard"})),
}

PARAGLIDER_CATALOG = PARAMOTOR_PARAGLIDER_CATALOG


def normalize_paraglider_id(paraglider_id: str | None) -> str | None:
    if not paraglider_id:
        return None
    cleaned = str(paraglider_id).strip()
    if not cleaned or cleaned == NO_PARAGLIDER_ID:
        return None
    return cleaned


def validate_paraglider_selection(
    paraglider_id: str,
    color: str | None,
    size: str | None,
) -> None:
    meta = PARAGLIDER_CATALOG.get(paraglider_id)
    if not meta:
        return
    _price, colors, sizes = meta
    if not color or not str(color).strip():
        raise ValueError("Debe seleccionar color del parapente")
    if not size or not str(size).strip():
        raise ValueError("Debe seleccionar talla del parapente")
    color_id = str(color).strip()
    size_label = str(size).strip()
    if color_id not in colors:
        raise ValueError(f"Color de parapente '{color_id}' no válido para {paraglider_id}")
    if size_label not in sizes:
        raise ValueError(f"Talla de parapente '{size_label}' no válida para {paraglider_id}")
