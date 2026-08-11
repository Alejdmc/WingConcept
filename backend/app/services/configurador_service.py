"""
WingConcept Backend — Configurador de precios (fuente autoritativa)

Calcula el precio de configuraciones Vanguard / Nomadic en el servidor.
Lee opciones desde DB (configurador_opciones); fallback a constantes legacy.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ValidacionError
from app.models.variante import Variante

VANGUARD_PRODUCT_ID = uuid.UUID("c1a2b3d4-e5f6-7890-1234-567890abcdef")
NOMADIC_PRODUCT_ID = uuid.UUID("d1e2f3a4-b5c6-7890-1234-567890abcdef")
NOMADIC_DOCUMENT_BASE_PRICE = 4379.5

# Fallback legacy (solo si DB vacía)
VANGUARD_ENGINES: Dict[str, float] = {
    "no-engine": 0,
    "rotax-912": 25000,
    "RMZ500": 15000,
    "simonini-v2": 12000,
    "hirth-3503": 11000,
}
VANGUARD_FINISHES: Dict[str, float] = {}
VANGUARD_ACCESSORIES: Dict[str, float] = {
    "cruise-control": 20, "camel-back": 25, "sun-roof-netting": 30,
    "parachute-container": 55, "front-axle": 75, "front-bar-protection": 80,
    "lateral-bag": 90, "cockpit-liner": 105, "pilot-harness": 190,
    "passenger-harness": 220, "front-fork": 280, "pilot-dynamic-cage": 300,
    "pilot-hunter-cage": 300, "instrument-kit": 440,
}
VANGUARD_PROPELLERS: Dict[str, float] = {"no-propeller": 0, "bipala": 534.75, "tripala": 677.35}

NOMADIC_ENGINES: Dict[str, float] = {
    "no-engine": 0,
    "polini-303": 3950, "polini-260": 4200, "vittorazi-300-my25": 4560,
}
NOMADIC_FINISHES: Dict[str, float] = {
    "stainless-brushed": 0, "anodized-black": 600, "titanium-finish": 1200,
}
NOMADIC_ACCESSORIES: Dict[str, float] = {
    "cruise-control": 20, "camel-back": 25, "sun-roof-netting": 30,
    "lateral-bag-explorer": 85, "cockpit-liner": 105, "bottom-explorer-bag": 124.80,
    "instrument-kit": 350,
}
NOMADIC_PROPELLERS: Dict[str, float] = {"no-propeller": 0, "bipala": 534.75, "tripala": 677.35}

LEGACY_CATALOGS: Dict[uuid.UUID, Dict[str, Any]] = {
    VANGUARD_PRODUCT_ID: {
        "fallback_base": 5950.25,
        "engines": VANGUARD_ENGINES,
        "finishes": VANGUARD_FINISHES,
        "accessories": VANGUARD_ACCESSORIES,
        "propellers": VANGUARD_PROPELLERS,
        "default_engine": "no-engine",
    },
    NOMADIC_PRODUCT_ID: {
        "fallback_base": NOMADIC_DOCUMENT_BASE_PRICE,
        "engines": NOMADIC_ENGINES,
        "finishes": NOMADIC_FINISHES,
        "accessories": NOMADIC_ACCESSORIES,
        "propellers": NOMADIC_PROPELLERS,
        "default_engine": "no-engine",
    },
}


@dataclass
class PrecioConfiguracion:
    precio_total: float
    desglose: Dict[str, float]


class ConfiguradorService:

    def _normalizar_opciones(self, configuracion: Dict[str, Any]) -> Dict[str, Any]:
        if not configuracion:
            return {}
        if "opciones" in configuracion and isinstance(configuracion["opciones"], dict):
            merged = dict(configuracion["opciones"])
            for key in ("engine", "finish", "upgrades", "propeller"):
                if key in configuracion and configuracion[key] is not None:
                    merged[key] = configuracion[key]
            return merged

        merged = dict(configuracion)
        for key in ("chassisType", "chassisColor", "accentColor", "peripheralColor", "totalPrice"):
            merged.pop(key, None)
        if "finish" not in merged and merged.get("chassisType"):
            pass  # vanguard chassis_type no afecta precio
        return merged

    async def _load_catalog(self, db: AsyncSession, producto_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        from app.services.configurador_opcion_service import configurador_opcion_service
        db_catalog = await configurador_opcion_service.build_price_maps(db, producto_id)
        if db_catalog:
            legacy = LEGACY_CATALOGS.get(producto_id, {})
            db_catalog["fallback_base"] = legacy.get("fallback_base", 5950.0)
            if not db_catalog.get("finishes"):
                db_catalog["finishes"] = legacy.get("finishes", {})
            if not db_catalog.get("propellers"):
                db_catalog["propellers"] = legacy.get("propellers", {})
            return db_catalog
        return LEGACY_CATALOGS.get(producto_id)

    async def _precio_base_chasis(
        self, db: AsyncSession, producto_id: uuid.UUID, fallback: float
    ) -> float:
        if producto_id == NOMADIC_PRODUCT_ID:
            return NOMADIC_DOCUMENT_BASE_PRICE
        result = await db.execute(
            select(Variante)
            .where(Variante.producto_id == producto_id, Variante.activo == True)
            .order_by(Variante.es_principal.desc(), Variante.created_at.asc())
        )
        variante = result.scalars().first()
        if variante:
            return float(variante.precio)
        return fallback

    def _precio_opciones(self, catalog: Dict[str, Any], opciones: Dict[str, Any]) -> PrecioConfiguracion:
        engines: Dict[str, float] = catalog["engines"]
        finishes: Dict[str, float] = catalog.get("finishes") or {}
        accessories: Dict[str, float] = catalog["accessories"]
        propellers: Dict[str, float] = catalog.get("propellers") or {}

        engine_id = opciones.get("engine") or catalog["default_engine"]
        finish_id = opciones.get("finish")
        propeller_id = opciones.get("propeller")
        upgrades: List[str] = opciones.get("upgrades") or []

        if engine_id not in engines:
            raise ValidacionError(f"Motor '{engine_id}' no válido para este producto")
        if finish_id and finish_id not in finishes:
            raise ValidacionError(f"Acabado '{finish_id}' no válido para este producto")
        if propeller_id and propeller_id not in propellers:
            raise ValidacionError(f"Hélice '{propeller_id}' no válida para este producto")

        engine_price = engines[engine_id]
        finish_price = finishes.get(finish_id, 0.0) if finish_id else 0.0
        propeller_price = propellers.get(propeller_id, 0.0) if propeller_id else 0.0
        accessories_price = 0.0
        for acc_id in upgrades:
            if acc_id not in accessories:
                raise ValidacionError(f"Accesorio '{acc_id}' no válido para este producto")
            accessories_price += accessories[acc_id]

        return PrecioConfiguracion(
            precio_total=0.0,
            desglose={
                "motor": engine_price,
                "acabado": finish_price,
                "helice": propeller_price,
                "accesorios": accessories_price,
            },
        )

    async def calcular_precio(
        self,
        db: AsyncSession,
        producto_id: uuid.UUID,
        configuracion: Optional[Dict[str, Any]] = None,
    ) -> Optional[PrecioConfiguracion]:
        catalog = await self._load_catalog(db, producto_id)
        if not catalog or not configuracion:
            return None

        opciones = self._normalizar_opciones(configuracion)
        if (
            not opciones.get("engine")
            and not opciones.get("upgrades")
            and not opciones.get("finish")
            and not opciones.get("propeller")
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
        if not configuracion:
            return precio_variante

        calculado = await self.calcular_precio(db, producto_id, configuracion)
        if calculado is not None:
            return calculado.precio_total
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
