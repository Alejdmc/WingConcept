"""
Impuestos por producto — tasa en producto.contenido_extra.tax_rate (decimal).
Sin override: 19% (tasa global del catálogo).
"""
from __future__ import annotations

from typing import Any, Iterable, Optional, Tuple

DEFAULT_TAX_RATE = 0.19
CA_TAX_RATE = 0.0725


def get_tax_rate_from_producto(producto: Any) -> float:
    """Lee tasa desde contenido_extra.tax_rate o devuelve DEFAULT_TAX_RATE."""
    if not producto:
        return DEFAULT_TAX_RATE
    extra = getattr(producto, "contenido_extra", None) or {}
    if not isinstance(extra, dict):
        return DEFAULT_TAX_RATE
    rate = extra.get("tax_rate")
    if rate is None:
        return DEFAULT_TAX_RATE
    try:
        return float(rate)
    except (TypeError, ValueError):
        return DEFAULT_TAX_RATE


def calcular_impuestos(
    lineas: Iterable[Tuple[float, float]],
    subtotal: float,
    descuento: float = 0,
) -> float:
    """
    Reparte el descuento proporcionalmente y aplica la tasa de cada línea.
    lineas: (subtotal_línea, tasa_impuesto)
    """
    lineas_list = [(float(s), float(r)) for s, r in lineas if s > 0]
    if not lineas_list or subtotal <= 0:
        return 0.0

    taxable_subtotal = max(subtotal - descuento, 0.0)
    total_tax = 0.0
    for line_subtotal, rate in lineas_list:
        share = line_subtotal / subtotal
        line_taxable = taxable_subtotal * share
        total_tax += line_taxable * rate

    return round(total_tax, 2)
