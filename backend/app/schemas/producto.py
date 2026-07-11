"""
WingConcept Backend — Schemas Producto y Variante (Pydantic V2)
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

# Categorías válidas para productos de paramotores
CATEGORIAS_VALIDAS = frozenset({
    "paramotor", "vela", "motor", "accesorios", "repuestos", "paratrike",
})


# ── Variante ──────────────────────────────────────────────────────────────────

class VarianteCreate(BaseModel):
    nombre: str = Field(..., max_length=255)
    sku: Optional[str] = Field(None, max_length=100)
    precio: float = Field(..., gt=0)
    precio_anterior: Optional[float] = Field(None, gt=0)
    stock: int = Field(0, ge=0)
    stock_minimo: int = Field(1, ge=1)
    atributos: Optional[Dict[str, Any]] = None
    activo: bool = True
    es_principal: bool = False
    peso_kg: Optional[float] = Field(None, gt=0)


class VarianteUpdate(BaseModel):
    nombre: Optional[str] = Field(None, max_length=255)
    precio: Optional[float] = Field(None, gt=0)
    precio_anterior: Optional[float] = None
    stock: Optional[int] = Field(None, ge=0)
    atributos: Optional[Dict[str, Any]] = None
    activo: Optional[bool] = None


class VarianteResponse(BaseModel):
    id: uuid.UUID
    producto_id: uuid.UUID
    nombre: str
    sku: Optional[str]
    precio: float
    precio_anterior: Optional[float]
    stock: int
    atributos: Optional[Dict[str, Any]]
    activo: bool
    es_principal: bool
    peso_kg: Optional[float]
    tiene_stock: bool
    en_descuento: bool

    model_config = {"from_attributes": True}


# ── Producto ──────────────────────────────────────────────────────────────────

class ProductoCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=255)
    descripcion: Optional[str] = None
    descripcion_corta: Optional[str] = Field(None, max_length=500)
    categoria: str = Field(..., max_length=100)
    subcategoria: Optional[str] = Field(None, max_length=100)
    imagenes: Optional[List[str]] = None
    modelo_3d_url: Optional[str] = Field(None, max_length=500)
    meta_titulo: Optional[str] = Field(None, max_length=70)
    meta_descripcion: Optional[str] = Field(None, max_length=160)
    activo: bool = True
    destacado: bool = False
    orden_display: int = 0
    variantes: Optional[List[VarianteCreate]] = None

    @field_validator("categoria")
    @classmethod
    def validar_categoria(cls, v: str) -> str:
        v_lower = v.lower().strip()
        if v_lower not in CATEGORIAS_VALIDAS:
            raise ValueError(
                f"Categoría '{v}' no válida. "
                f"Opciones: {', '.join(sorted(CATEGORIAS_VALIDAS))}"
            )
        return v_lower


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=255)
    descripcion: Optional[str] = None
    descripcion_corta: Optional[str] = Field(None, max_length=500)
    categoria: Optional[str] = Field(None, max_length=100)
    subcategoria: Optional[str] = None
    imagenes: Optional[List[str]] = None
    modelo_3d_url: Optional[str] = None
    meta_titulo: Optional[str] = None
    meta_descripcion: Optional[str] = None
    activo: Optional[bool] = None
    destacado: Optional[bool] = None
    orden_display: Optional[int] = None

    @field_validator("categoria")
    @classmethod
    def validar_categoria(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v_lower = v.lower().strip()
        if v_lower not in CATEGORIAS_VALIDAS:
            raise ValueError(
                f"Categoría '{v}' no válida. "
                f"Opciones: {', '.join(sorted(CATEGORIAS_VALIDAS))}"
            )
        return v_lower


class ProductoResponse(BaseModel):
    id: uuid.UUID
    nombre: str
    slug: str
    descripcion: Optional[str]
    descripcion_corta: Optional[str]
    categoria: str
    subcategoria: Optional[str]
    imagenes: Optional[List[str]]
    modelo_3d_url: Optional[str]
    meta_titulo: Optional[str]
    meta_descripcion: Optional[str]
    activo: bool
    destacado: bool
    orden_display: int
    variantes: List[VarianteResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductoListResponse(BaseModel):
    """Respuesta reducida para listados (sin variantes completas).

    Incluye campos en inglés para compatibilidad directa con los componentes
    del frontend (Catalog.jsx, ProductCard.jsx, useCart.js):
      - name   → alias de nombre
      - image  → primera URL del array imagenes
      - price  → precio formateado como string '$5,000' (compatible con useCart)
      - desc   → alias de descripcion_corta
      - specs  → resumen técnico extraído de los atributos de la variante principal
    """
    id: uuid.UUID
    nombre: str
    slug: str
    descripcion_corta: Optional[str]
    categoria: str
    subcategoria: Optional[str]
    imagenes: Optional[List[str]]
    activo: bool
    destacado: bool
    precio_desde: Optional[float] = None  # Precio mínimo de variantes activas

    # ── Campos amigables para el frontend ─────────────────────────────────────
    name: Optional[str] = None    # = nombre
    image: Optional[str] = None   # primera imagen del array
    price: Optional[str] = None   # precio formateado "$5,000"
    desc: Optional[str] = None    # = descripcion_corta
    specs: Optional[str] = None   # e.g. "28kg | 95kg thrust"

    model_config = {"from_attributes": True}


class PaginatedProductos(BaseModel):
    items: List[ProductoListResponse]
    total: int
    pagina: int
    por_pagina: int
    paginas: int


class CategoriaResponse(BaseModel):
    """Categoría disponible con conteo de productos."""
    categoria: str
    total: int


# ── Respuestas para el panel de administración ────────────────────────────────

class AdminProductoResponse(BaseModel):
    """Respuesta optimizada para /admin/products/page.js del frontend.

    Agrega stock total (suma de variantes activas) y ventas totales
    (suma de ItemOrden.cantidad para ese producto).
    Los campos name/price imitan el formato que ya usa ProductoListResponse
    para compatibilidad directa con la tabla del admin.
    """
    id: uuid.UUID
    name: str               # = nombre
    price: Optional[str]    # precio formateado "$5,000" de la variante principal
    stock: int = 0          # stock total sumado de todas las variantes activas
    sales: int = 0          # unidades vendidas (suma ItemOrden.cantidad)
    activo: bool
    categoria: str
    subcategoria: Optional[str] = None

    model_config = {"from_attributes": False}


class PaginatedAdminProductos(BaseModel):
    items: List[AdminProductoResponse]
    total: int
    pagina: int
    por_pagina: int
    paginas: int


