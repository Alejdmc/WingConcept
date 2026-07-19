"""
WingConcept Backend — Configurador de precios (fuente autoritativa)

Calcula el precio de configuraciones Vanguard / Nomadic en el servidor.
El frontend puede mostrar estimaciones, pero el carrito y checkout usan estos valores.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ValidacionError
from app.models.variante import Variante

# IDs alineados con frontend/lib/products.js y seed_data.py
VANGUARD_PRODUCT_ID = uuid.UUID("c1a2b3d4-e5f6-7890-1234-567890abcdef")
NOMADIC_PRODUCT_ID = uuid.UUID("d1e2f3a4-b5c6-7890-1234-567890abcdef")

VANGUARD_ENGINES: Dict[str, float] = {
    "no-engine": 0,
    "rotax-912": 15000,
    "RMZ500": 15000,
    "simonini-v2": 12000,
    "hirth-3503": 11000,
}

VANGUARD_FINISHES: Dict[str, float] = {
    "black-matte": 0,
    "gloss-carbon": 800,
    "titanium-anodized": 500,
}

VANGUARD_ACCESSORIES: Dict[str, float] = {
    "cruise-control": 20,
    "camel-back": 25,
    "sun-roof-netting": 30,
    "parachute-container": 55,
    "front-axle": 75,
    "front-bar-protection": 80,
    "lateral-bag": 90,
    "cockpit-liner": 105,
    "pilot-harness": 190,
    "passenger-harness": 220,
    "front-fork": 280,
    "pilot-dynamic-cage": 300,
    "pilot-hunter-cage": 300,
    "instrument-kit": 440,
}

NOMADIC_ENGINES: Dict[str, float] = {
    "polini-303": 3950,
    "polini-260": 4200,
    "vittorazi-300-my25": 4560,
}

NOMADIC_FINISHES: Dict[str, float] = {
    "stainless-brushed": 0,
    "anodized-black": 600,
    "titanium-finish": 1200,
}

NOMADIC_ACCESSORIES: Dict[str, float] = {
    "cruise-control": 20,
    "camel-back": 25,
    "sun-roof-netting": 30,
    "parachute-container": 55,
    "front-axle": 75,
    "front-bar-protection": 80,
    "lateral-bag-explorer": 85,
    "rock-guard": 95,
    "back-axle": 95,
    "cockpit-liner": 105,
    "bottom-explorer-bag": 124.80,
    "pilot-harness": 190,
    "passenger-harness": 220,
    "front-fork": 280,
    "instrument-kit": 350,
}

CATALOGS: Dict[uuid.UUID, Dict[str, Any]] = {
    VANGUARD_PRODUCT_ID: {
        "fallback_base": 5950.0,
        "engines": VANGUARD_ENGINES,
        "finishes": VANGUARD_FINISHES,
        "accessories": VANGUARD_ACCESSORIES,
        "default_engine": "no-engine",
    },
    NOMADIC_PRODUCT_ID: {
        "fallback_base": 8950.0,
        "engines": NOMADIC_ENGINES,
        "finishes": NOMADIC_FINISHES,
        "accessories": NOMADIC_ACCESSORIES,
        "default_engine": "polini-303",
    },
}


@dataclass
class PrecioConfiguracion:
    precio_total: float
    desglose: Dict[str, float]


class ConfiguradorService:

    def _normalizar_opciones(self, configuracion: Dict[str, Any]) -> Dict[str, Any]:
        """Acepta campos planos (carrito) o anidados en opciones."""
        if not configuracion:
            return {}
        if "opciones" in configuracion and isinstance(configuracion["opciones"], dict):
            merged = dict(configuracion["opciones"])
            for key in ("engine", "finish", "upgrades"):
                if key in configuracion and configuracion[key] is not None:
                    merged[key] = configuracion[key]
            return merged

        merged = dict(configuracion)
        # Ignorar campos visuales del frontend que no afectan precio
        for key in ("chassisType", "propeller", "chassisColor", "accentColor", "peripheralColor", "totalPrice"):
            merged.pop(key, None)
        return merged

    async def _precio_base_chasis(
        self, db: AsyncSession, producto_id: uuid.UUID, fallback: float
    ) -> float:
        result = await db.execute(
            select(Variante)
            .where(Variante.producto_id == producto_id, Variante.activo == True)
            .order_by(Variante.es_principal.desc(), Variante.created_at.asc())
        )
        variante = result.scalars().first()
        if variante:
            return float(variante.precio)
        return fallback

    def _precio_opciones(
        self,
        catalog: Dict[str, Any],
        opciones: Dict[str, Any],
    ) -> PrecioConfiguracion:
        engines: Dict[str, float] = catalog["engines"]
        finishes: Dict[str, float] = catalog["finishes"]
        accessories: Dict[str, float] = catalog["accessories"]

        engine_id = opciones.get("engine") or catalog["default_engine"]
        finish_id = opciones.get("finish") or next(iter(finishes))
        upgrades: List[str] = opciones.get("upgrades") or []

        if engine_id not in engines:
            raise ValidacionError(f"Motor '{engine_id}' no válido para este producto")
        if finish_id not in finishes:
            raise ValidacionError(f"Acabado '{finish_id}' no válido para este producto")

        engine_price = engines[engine_id]
        finish_price = finishes[finish_id]
        accessories_price = 0.0
        for acc_id in upgrades:
            if acc_id not in accessories:
                raise ValidacionError(f"Accesorio '{acc_id}' no válido para este producto")
            accessories_price += accessories[acc_id]

        return PrecioConfiguracion(
            precio_total=0.0,  # se completa con base
            desglose={
                "motor": engine_price,
                "acabado": finish_price,
                "accesorios": accessories_price,
            },
        )

    async def calcular_precio(
        self,
        db: AsyncSession,
        producto_id: uuid.UUID,
        configuracion: Optional[Dict[str, Any]] = None,
    ) -> Optional[PrecioConfiguracion]:
        """
        Calcula precio autoritativo para un producto configurable.
        Retorna None si el producto no tiene catálogo o no hay opciones relevantes.
        """
        catalog = CATALOGS.get(producto_id)
        if not catalog or not configuracion:
            return None

        opciones = self._normalizar_opciones(configuracion)
        if (
            not opciones.get("engine")
            and not opciones.get("upgrades")
            and not opciones.get("finish")
        ):
            return None

        base = await self._precio_base_chasis(db, producto_id, catalog["fallback_base"])
        resultado = self._precio_opciones(catalog, opciones)
        opciones_total = sum(resultado.desglose.values())
        resultado.desglose["base_chasis"] = base
        resultado.precio_total = round(base + opciones_total, 2)
        return resultado

    async def resolver_precio_carrito(
        self,
        db: AsyncSession,
        producto_id: uuid.UUID,
        precio_variante: float,
        configuracion: Optional[Dict[str, Any]] = None,
    ) -> float:
        """Precio unitario para agregar al carrito — nunca confía en totalPrice del cliente."""
        if not configuracion:
            return precio_variante

        calculado = await self.calcular_precio(db, producto_id, configuracion)
        if calculado is not None:
            return calculado.precio_total

        # Producto sin catálogo: ignorar totalPrice manipulable
        return precio_variante

    async def validar_precio(
        self,
        db: AsyncSession,
        producto_id: uuid.UUID,
        configuracion: Dict[str, Any],
    ) -> PrecioConfiguracion:
        calculado = await self.calcular_precio(db, producto_id, configuracion)
        if calculado is None:
            raise ValidacionError(
                "Este producto no admite configuración con precio calculado en servidor"
            )
        return calculado


configurador_service = ConfiguradorService()
