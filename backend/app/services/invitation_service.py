"""
WingConcept Backend — Invitaciones de administrador
"""
import hashlib
import logging
import math
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import RecursoNoEncontradoError, ValidacionError
from app.models.admin_invitation import AdminInvitation
from app.models.usuario import Usuario
from app.services.admin_policy import (
    assert_invite_flow_allowed,
    assert_new_admins_allowed,
    assign_admin_role,
)

logger = logging.getLogger(__name__)


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


class InvitationService:

    async def crear_invitacion(
        self,
        db: AsyncSession,
        email: str,
        invited_by_id: UUID,
    ) -> tuple[AdminInvitation, str]:
        assert_new_admins_allowed()
        email_norm = email.lower().strip()
        now = datetime.now(timezone.utc)

        existing_user = await db.execute(
            select(Usuario).where(Usuario.email == email_norm)
        )
        user = existing_user.scalar_one_or_none()
        if user and user.rol == "admin":
            raise ValidacionError("Este email ya pertenece a un administrador")

        pending = await db.execute(
            select(AdminInvitation).where(
                AdminInvitation.email == email_norm,
                AdminInvitation.used_at.is_(None),
                AdminInvitation.revoked_at.is_(None),
                AdminInvitation.expires_at > now,
            )
        )
        if pending.scalar_one_or_none():
            raise ValidacionError("Ya existe una invitación pendiente para este email")

        token = secrets.token_urlsafe(32)
        invitacion = AdminInvitation(
            email=email_norm,
            token_hash=_hash_token(token),
            invited_by_id=invited_by_id,
            expires_at=now + timedelta(days=settings.ADMIN_INVITE_EXPIRE_DAYS),
        )
        db.add(invitacion)
        await db.flush()
        logger.info(f"Invitación admin creada para {email_norm} por {invited_by_id}")
        return invitacion, token

    async def listar_invitaciones(
        self,
        db: AsyncSession,
        pagina: int,
        por_pagina: int,
    ) -> dict:
        total_result = await db.execute(select(func.count()).select_from(AdminInvitation))
        total = total_result.scalar_one()

        offset = (pagina - 1) * por_pagina
        result = await db.execute(
            select(AdminInvitation)
            .order_by(AdminInvitation.created_at.desc())
            .offset(offset)
            .limit(por_pagina)
        )
        items = result.scalars().all()
        return {
            "items": items,
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "paginas": max(1, math.ceil(total / por_pagina)) if total else 1,
        }

    async def revocar_invitacion(self, db: AsyncSession, invitacion_id: UUID) -> None:
        result = await db.execute(
            select(AdminInvitation).where(AdminInvitation.id == invitacion_id)
        )
        invitacion = result.scalar_one_or_none()
        if not invitacion:
            raise RecursoNoEncontradoError("Invitación")
        if invitacion.used_at is not None:
            raise ValidacionError("La invitación ya fue utilizada")
        if invitacion.revoked_at is not None:
            return
        invitacion.revoked_at = datetime.now(timezone.utc)
        await db.flush()

    async def _obtener_invitacion_valida(
        self,
        db: AsyncSession,
        token: str,
        email: str,
    ) -> AdminInvitation:
        assert_invite_flow_allowed()
        token = token.strip()
        email_norm = email.lower().strip()
        result = await db.execute(
            select(AdminInvitation).where(AdminInvitation.token_hash == _hash_token(token))
        )
        invitacion = result.scalar_one_or_none()
        if not invitacion:
            raise ValidacionError("Invitación inválida o expirada")
        if invitacion.email != email_norm:
            raise ValidacionError("La invitación no corresponde a este email")
        if invitacion.revoked_at is not None:
            raise ValidacionError("La invitación fue revocada")
        if invitacion.used_at is not None:
            raise ValidacionError("La invitación ya fue utilizada")
        if invitacion.expires_at <= datetime.now(timezone.utc):
            raise ValidacionError("La invitación expiró")
        return invitacion

    async def consumir_invitacion_registro(
        self,
        db: AsyncSession,
        token: str,
        email: str,
        usuario_id: UUID,
    ) -> None:
        invitacion = await self._obtener_invitacion_valida(db, token, email)
        user_result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
        usuario = user_result.scalar_one_or_none()
        if not usuario:
            raise RecursoNoEncontradoError("Usuario")

        assign_admin_role(usuario)
        usuario.email_verificado = True
        invitacion.used_at = datetime.now(timezone.utc)
        invitacion.used_by_id = usuario_id
        await db.flush()
        logger.info(f"Invitación admin consumida en registro: {usuario.email}")

    async def aceptar_invitacion_usuario_existente(
        self,
        db: AsyncSession,
        token: str,
        current_user: Usuario,
    ) -> Usuario:
        invitacion = await self._obtener_invitacion_valida(db, token, current_user.email)
        if current_user.rol == "admin":
            return current_user

        assign_admin_role(current_user)
        current_user.email_verificado = True
        invitacion.used_at = datetime.now(timezone.utc)
        invitacion.used_by_id = current_user.id
        await db.flush()
        logger.info(f"Invitación admin aceptada por usuario existente: {current_user.email}")
        return current_user


invitation_service = InvitationService()
