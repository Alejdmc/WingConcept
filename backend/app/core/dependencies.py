"""
WingConcept Backend — Dependencies FastAPI
Autenticación, roles, rate limiting via Redis
"""
import logging
from typing import Optional
from uuid import UUID, uuid4

from fastapi import Depends, Header, Request, Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
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


def _extract_access_token(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials],
) -> Optional[str]:
    """Bearer header primero; cookie HttpOnly como respaldo (mismo origen en producción)."""
    if credentials is not None:
        return credentials.credentials
    return request.cookies.get("access_token")


async def _user_from_access_token(token: str, db: AsyncSession):
    from app.models.usuario import Usuario

    payload = decode_token(token)
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


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
):
    """
    Extrae y valida el usuario del JWT (Authorization Bearer o cookie access_token).
    Retorna el objeto Usuario de la DB.
    """
    token = _extract_access_token(request, credentials)
    if not token:
        raise CredencialesInvalidasError("Token de autenticación requerido")

    return await _user_from_access_token(token, db)


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
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
):
    """
    Usuario opcional — no lanza error si no hay token.
    Útil para endpoints públicos que mejoran con autenticación (carrito).
    """
    token = _extract_access_token(request, credentials)
    if not token:
        return None

    try:
        return await _user_from_access_token(token, db)
    except Exception:
        return None


def get_or_create_session_id(
    request: Request,
    response: Response,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
) -> str:
    """
    Session ID para carritos anónimos.
    Prioridad: header X-Session-ID → cookie → generar UUID nuevo en cookie httpOnly.
    """
    if x_session_id and validar_session_id(x_session_id):
        return x_session_id

    session_cookie = request.cookies.get("session_id")
    if session_cookie and validar_session_id(session_cookie):
        return session_cookie

    new_session_id = str(uuid4())
    response.set_cookie(
        key="session_id",
        value=new_session_id,
        max_age=settings.REDIS_CART_TTL,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
    )
    return new_session_id


def get_session_id(request: Request) -> str:
    """
    Extrae session_id sin crear uno nuevo (p. ej. merge tras login).
    Requiere header o cookie válidos — no usa fallback por IP.
    """
    session_id = request.headers.get("X-Session-ID")
    if session_id and validar_session_id(session_id):
        return session_id
    session_cookie = request.cookies.get("session_id")
    if session_cookie and validar_session_id(session_cookie):
        return session_cookie
    return str(uuid4())

