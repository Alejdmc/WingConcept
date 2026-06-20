"""
WingConcept Backend — Dependencies FastAPI
Autenticación, roles, rate limiting via Redis
"""
import logging
from typing import Optional
from uuid import UUID

from fastapi import Depends, Header, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.exceptions import (
    CredencialesInvalidasError,
    PermisosDenegadosError,
    TokenExpiradoError,
)
from app.core.middleware import validar_session_id
from app.core.security import decode_token
from app.database import get_db

logger = logging.getLogger(__name__)

# ── Bearer Token extractor ────────────────────────────────────────────────────
security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
):
    """
    Extrae y valida el usuario del JWT Bearer token.
    Retorna el objeto Usuario de la DB.
    """
    from app.models.usuario import Usuario

    if credentials is None:
        raise CredencialesInvalidasError("Token de autenticación requerido")

    payload = decode_token(credentials.credentials)
    if payload is None:
        raise TokenExpiradoError()

    if payload.get("type") != "access":
        raise CredencialesInvalidasError("Tipo de token incorrecto")

    user_id = payload.get("sub")
    if not user_id:
        raise CredencialesInvalidasError()

    result = await db.execute(select(Usuario).where(Usuario.id == UUID(user_id)))
    user = result.scalar_one_or_none()

    if user is None:
        raise CredencialesInvalidasError("Usuario no encontrado")

    if not user.activo:
        raise PermisosDenegadosError("Cuenta desactivada")

    return user


async def get_current_active_user(
    current_user=Depends(get_current_user),
):
    """Alias explícito para usuario activo autenticado."""
    return current_user


async def get_current_admin(
    current_user=Depends(get_current_user),
):
    """Requiere que el usuario tenga rol admin."""
    if current_user.rol != "admin":
        raise PermisosDenegadosError("Se requiere rol de administrador")
    return current_user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
):
    """
    Usuario opcional — no lanza error si no hay token.
    Útil para endpoints públicos que mejoran con autenticación (carrito).
    """
    from app.models.usuario import Usuario

    if credentials is None:
        return None

    payload = decode_token(credentials.credentials)
    if payload is None or payload.get("type") != "access":
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    try:
        result = await db.execute(select(Usuario).where(Usuario.id == UUID(user_id)))
        return result.scalar_one_or_none()
    except Exception:
        return None


def get_session_id(request: Request) -> str:
    """
    Extrae o genera un session_id para carritos anónimos.
    Primero busca X-Session-ID header (validado por middleware), luego cookie.
    """
    session_id = request.headers.get("X-Session-ID")
    if session_id and validar_session_id(session_id):
        return session_id
    session_cookie = request.cookies.get("session_id")
    if session_cookie and validar_session_id(session_cookie):
        return session_cookie
    # Fallback: usar IP (no recomendado en producción, solo para dev)
    client_ip = request.client.host if request.client else "unknown"
    return f"anon:{client_ip}"

