"""
WingConcept Backend — Schemas Producto y Variante (Pydantic V2)
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


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


