"""
WingConcept Backend — Cupón Service
"""
import math
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import RecursoNoEncontradoError, ValidacionError
from app.models.cupon import Cupon
from app.models.usuario import Usuario
from app.schemas.cupon import (
    CuponCreateAdmin,
    CuponResponse,
    CuponValidacionResponse,
    PaginatedCupones,
)
from app.services.email_service import email_service


def _generar_codigo() -> str:
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(secrets.choice(chars) for _ in range(8))
    return f"WC-{suffix}"


def _descuento_texto(tipo: str, valor: float) -> str:
    if tipo == "porcentaje":
        return f"{valor:g}% de descuento"
    return f"${valor:,.2f} USD de descuento"


def calcular_descuento(subtotal: float, tipo: str, valor: float) -> float:
    if subtotal <= 0:
        return 0.0
    if tipo == "porcentaje":
        return round(min(subtotal, subtotal * (valor / 100)), 2)
    return round(min(subtotal, float(valor)), 2)


class CuponService:

    def _to_response(self, cupon: Cupon) -> CuponResponse:
        usuario = cupon.usuario
        return CuponResponse(
            id=cupon.id,
            codigo=cupon.codigo,
            usuario_id=cupon.usuario_id,
            usuario_nombre=f"{usuario.nombre} {usuario.apellido}".strip() if usuario else None,
            usuario_email=usuario.email if usuario else None,
            tipo=cupon.tipo,
            valor=float(cupon.valor),
            descripcion=cupon.descripcion,
            usado=cupon.usado,
            usado_en=cupon.usado_en,
            expira_en=cupon.expira_en,
            email_enviado=cupon.email_enviado,
            created_at=cupon.created_at,
        )

    async def _obtener_usuario_cliente(self, db: AsyncSession, usuario_id: UUID) -> Usuario:
        result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
        usuario = result.scalar_one_or_none()
        if not usuario:
            raise RecursoNoEncontradoError("Usuario")
        if usuario.rol != "client":
            raise ValidacionError("Solo se pueden asignar cupones a clientes")
        if not usuario.activo:
            raise ValidacionError("El usuario seleccionado no está activo")
        return usuario

    async def crear_y_enviar(
        self,
        db: AsyncSession,
        data: CuponCreateAdmin,
        admin_id: UUID,
    ) -> CuponResponse:
        usuario = await self._obtener_usuario_cliente(db, data.usuario_id)

        expira_en = None
        if data.dias_validez:
            expira_en = datetime.now(timezone.utc) + timedelta(days=data.dias_validez)

        codigo = _generar_codigo()
        for _ in range(5):
            existe = await db.execute(select(Cupon).where(Cupon.codigo == codigo))
            if not existe.scalar_one_or_none():
                break
            codigo = _generar_codigo()

        cupon = Cupon(
            codigo=codigo,
            usuario_id=usuario.id,
            creado_por_id=admin_id,
            tipo=data.tipo,
            valor=data.valor,
            descripcion=data.descripcion,
            expira_en=expira_en,
        )
        db.add(cupon)
        await db.flush()

        enviado = await email_service.enviar_cupon_descuento(
            email=usuario.email,
            nombre=usuario.nombre,
            codigo=cupon.codigo,
            descuento_texto=_descuento_texto(cupon.tipo, float(cupon.valor)),
            descripcion=cupon.descripcion,
            expira_en=expira_en,
        )
        cupon.email_enviado = enviado
        await db.flush()

        result = await db.execute(
            select(Cupon)
            .options(selectinload(Cupon.usuario))
            .where(Cupon.id == cupon.id)
        )
        cupon = result.scalar_one()
        return self._to_response(cupon)

    async def listar_admin(
        self,
        db: AsyncSession,
        pagina: int = 1,
        por_pagina: int = 20,
        buscar: Optional[str] = None,
    ) -> PaginatedCupones:
        query = select(Cupon).options(selectinload(Cupon.usuario))
        if buscar:
            term = f"%{buscar.strip()}%"
            query = query.join(Usuario, Cupon.usuario_id == Usuario.id).where(
                or_(
                    Cupon.codigo.ilike(term),
                    Usuario.nombre.ilike(term),
                    Usuario.apellido.ilike(term),
                    Usuario.email.ilike(term),
                )
            )

        count_q = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_q)).scalar() or 0

        query = (
            query.order_by(Cupon.created_at.desc())
            .offset((pagina - 1) * por_pagina)
            .limit(por_pagina)
        )
        result = await db.execute(query)
        cupones = result.scalars().unique().all()

        return PaginatedCupones(
            items=[self._to_response(c) for c in cupones],
            total=total,
            pagina=pagina,
            por_pagina=por_pagina,
            paginas=math.ceil(total / por_pagina) if total > 0 else 0,
        )

    async def listar_usuario(self, db: AsyncSession, usuario_id: UUID) -> list[CuponResponse]:
        result = await db.execute(
            select(Cupon)
            .options(selectinload(Cupon.usuario))
            .where(Cupon.usuario_id == usuario_id)
            .order_by(Cupon.created_at.desc())
        )
        return [self._to_response(c) for c in result.scalars().all()]

    async def validar_para_usuario(
        self,
        db: AsyncSession,
        usuario_id: UUID,
        codigo: str,
        subtotal: Optional[float] = None,
    ) -> CuponValidacionResponse:
        codigo_norm = codigo.strip().upper()
        result = await db.execute(
            select(Cupon).where(Cupon.codigo == codigo_norm)
        )
        cupon = result.scalar_one_or_none()

        if not cupon:
            return CuponValidacionResponse(
                valido=False,
                codigo=codigo_norm,
                tipo="",
                valor=0,
                mensaje="Cupón no encontrado",
            )

        if cupon.usuario_id != usuario_id:
            return CuponValidacionResponse(
                valido=False,
                codigo=cupon.codigo,
                tipo=cupon.tipo,
                valor=float(cupon.valor),
                mensaje="Este cupón no está asignado a tu cuenta",
            )

        if cupon.usado:
            return CuponValidacionResponse(
                valido=False,
                codigo=cupon.codigo,
                tipo=cupon.tipo,
                valor=float(cupon.valor),
                mensaje="Este cupón ya fue utilizado",
            )

        if cupon.expira_en and cupon.expira_en < datetime.now(timezone.utc):
            return CuponValidacionResponse(
                valido=False,
                codigo=cupon.codigo,
                tipo=cupon.tipo,
                valor=float(cupon.valor),
                mensaje="Este cupón ha expirado",
            )

        descuento_estimado = None
        if subtotal is not None:
            descuento_estimado = calcular_descuento(subtotal, cupon.tipo, float(cupon.valor))

        return CuponValidacionResponse(
            valido=True,
            codigo=cupon.codigo,
            tipo=cupon.tipo,
            valor=float(cupon.valor),
            descripcion=cupon.descripcion,
            descuento_estimado=descuento_estimado,
            mensaje="Cupón válido",
        )

    async def aplicar_en_orden(
        self,
        db: AsyncSession,
        usuario_id: UUID,
        codigo: str,
        subtotal: float,
        orden_id: UUID,
    ) -> float:
        validacion = await self.validar_para_usuario(db, usuario_id, codigo, subtotal)
        if not validacion.valido:
            raise ValidacionError(validacion.mensaje or "Cupón inválido")

        result = await db.execute(
            select(Cupon).where(Cupon.codigo == codigo.strip().upper())
        )
        cupon = result.scalar_one()
        descuento = calcular_descuento(subtotal, cupon.tipo, float(cupon.valor))

        cupon.usado = True
        cupon.usado_en = datetime.now(timezone.utc)
        cupon.orden_id = orden_id
        await db.flush()
        return descuento


cupon_service = CuponService()
