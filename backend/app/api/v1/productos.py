"""
WingConcept Backend — Productos Endpoints
GET  /api/v1/productos
GET  /api/v1/productos/{slug}
POST /api/v1/productos (admin)
PUT  /api/v1/productos/{id} (admin)
DELETE /api/v1/productos/{id} (admin)
POST /api/v1/productos/{id}/variantes (admin)
PUT  /api/v1/productos/{id}/variantes/{variante_id} (admin)
"""
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_admin
from app.database import get_db
from app.schemas.producto import (
    PaginatedProductos,
    ProductoCreate,
    ProductoResponse,
    ProductoUpdate,
    VarianteCreate,
    VarianteResponse,
    VarianteUpdate,
)
from app.services.producto_service import producto_service

router = APIRouter(prefix="/productos", tags=["Productos"])


@router.get("", response_model=PaginatedProductos)
async def listar_productos(
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(12, ge=1, le=50),
    categoria: Optional[str] = Query(None),
    buscar: Optional[str] = Query(None, max_length=100),
    db: AsyncSession = Depends(get_db),
):
    """Lista productos con paginación y filtros. Público."""
    return await producto_service.listar(db, pagina, por_pagina, categoria, buscar)


@router.get("/{slug}", response_model=ProductoResponse)
async def obtener_producto(slug: str, db: AsyncSession = Depends(get_db)):
    """Obtiene un producto completo por slug. Público."""
    return await producto_service.obtener_por_slug(db, slug)


@router.post("", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
async def crear_producto(
    data: ProductoCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Crea un nuevo producto. Solo admin."""
    return await producto_service.crear(db, data)


@router.put("/{producto_id}", response_model=ProductoResponse)
async def actualizar_producto(
    producto_id: uuid.UUID,
    data: ProductoUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Actualiza un producto. Solo admin."""
    return await producto_service.actualizar(db, producto_id, data)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_producto(
    producto_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Desactiva (soft delete) un producto. Solo admin."""
    await producto_service.eliminar(db, producto_id)


@router.post("/{producto_id}/variantes", response_model=VarianteResponse, status_code=status.HTTP_201_CREATED)
async def crear_variante(
    producto_id: uuid.UUID,
    data: VarianteCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Agrega una variante a un producto. Solo admin."""
    return await producto_service.crear_variante(db, producto_id, data)


@router.put("/{producto_id}/variantes/{variante_id}", response_model=VarianteResponse)
async def actualizar_variante(
    producto_id: uuid.UUID,
    variante_id: uuid.UUID,
    data: VarianteUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Actualiza una variante. Solo admin."""
    return await producto_service.actualizar_variante(db, variante_id, data)

