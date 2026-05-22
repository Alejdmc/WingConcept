"""
WingConcept Backend — Auth Service
Registro, login, refresh tokens, recuperación de contraseña
"""
import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import (
    CredencialesInvalidasError,
    RecursoDuplicadoError,
    RecursoNoEncontradoError,
    TokenExpiradoError,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.usuario import Usuario
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse

logger = logging.getLogger(__name__)


class AuthService:

    async def registrar(self, db: AsyncSession, data: RegisterRequest) -> Usuario:
        """Registra un nuevo usuario. Lanza error si el email ya existe."""
        existe = await db.execute(
            select(Usuario).where(Usuario.email == data.email.lower())
        )
        if existe.scalar_one_or_none():
            raise RecursoDuplicadoError("El email ya está registrado")

        usuario = Usuario(
            email=data.email.lower(),
            nombre=data.nombre.strip(),
            apellido=data.apellido.strip(),
            telefono=data.telefono,
            hashed_password=hash_password(data.password),
            rol="client",
            activo=True,
            email_verificado=False,
        )
        db.add(usuario)
        await db.flush()
        logger.info(f"Nuevo usuario registrado: {usuario.email}")
        return usuario

    async def login(self, db: AsyncSession, data: LoginRequest) -> TokenResponse:
        """Autentica usuario y retorna access + refresh tokens."""
        result = await db.execute(
            select(Usuario).where(Usuario.email == data.email.lower())
        )
        usuario = result.scalar_one_or_none()

        if not usuario or not verify_password(data.password, usuario.hashed_password):
            logger.warning(f"Intento de login fallido: {data.email}")
            raise CredencialesInvalidasError("Email o contraseña incorrectos")

        if not usuario.activo:
            raise CredencialesInvalidasError("Cuenta desactivada")

        access_token = create_access_token(
            subject=str(usuario.id),
            extra_claims={"rol": usuario.rol, "email": usuario.email},
        )
        refresh_token = create_refresh_token(subject=str(usuario.id))

        logger.info(f"Login exitoso: {usuario.email}")
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def refresh(self, db: AsyncSession, refresh_token: str) -> TokenResponse:
        """Genera un nuevo access token a partir de un refresh token válido."""
        payload = decode_token(refresh_token)
        if payload is None or payload.get("type") != "refresh":
            raise TokenExpiradoError()

        from uuid import UUID
        user_id = payload.get("sub")
        result = await db.execute(select(Usuario).where(Usuario.id == UUID(user_id)))
        usuario = result.scalar_one_or_none()

        if not usuario or not usuario.activo:
            raise CredencialesInvalidasError("Usuario no válido")

        access_token = create_access_token(
            subject=str(usuario.id),
            extra_claims={"rol": usuario.rol, "email": usuario.email},
        )
        new_refresh = create_refresh_token(subject=str(usuario.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def solicitar_recuperacion(self, db: AsyncSession, email: str) -> Optional[str]:
        """
        Genera token de recuperación y lo guarda en DB.
        Retorna el token para enviarlo por email.
        Siempre responde exitosamente (no revelar si email existe).
        """
        result = await db.execute(
            select(Usuario).where(Usuario.email == email.lower())
        )
        usuario = result.scalar_one_or_none()
        if not usuario:
            return None  # No revelar que el email no existe

        token = secrets.token_urlsafe(32)
        usuario.reset_token = token
        usuario.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        await db.flush()

        logger.info(f"Token de recuperación generado para: {email}")
        return token

    async def resetear_password(
        self, db: AsyncSession, token: str, nueva_password: str
    ) -> bool:
        """
        Valida el token y actualiza la contraseña.
        Retorna True si fue exitoso, False si inválido/expirado.
        """
        result = await db.execute(
            select(Usuario).where(Usuario.reset_token == token)
        )
        usuario = result.scalar_one_or_none()

        if not usuario:
            return False

        if not usuario.reset_token_expires:
            return False

        expires = usuario.reset_token_expires
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)

        if datetime.now(timezone.utc) > expires:
            logger.warning(f"Token de recuperación expirado para usuario: {usuario.email}")
            return False

        usuario.hashed_password = hash_password(nueva_password)
        usuario.reset_token = None
        usuario.reset_token_expires = None
        await db.flush()

        logger.info(f"Contraseña actualizada para: {usuario.email}")
        return True


auth_service = AuthService()

