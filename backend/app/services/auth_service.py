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
    TokenExpiradoError,
)
from app.core.security import (
    create_access_token,
    create_email_verify_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.utils.redis_client import marcar_refresh_token_usado, refresh_token_fue_usado
from app.models.usuario import Usuario
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, TokenResponse

logger = logging.getLogger(__name__)


class AuthService:

    async def registrar(self, db: AsyncSession, data: RegisterRequest) -> Usuario:
        """Registra un nuevo usuario. Lanza error si el email ya existe."""
        existe = await db.execute(
            select(Usuario).where(Usuario.email == data.email.lower())
        )
        if existe.scalar_one_or_none():
            raise RecursoDuplicadoError("El email ya está registrado")

        if data.invite_token:
            from app.services.admin_policy import assert_invite_flow_allowed
            assert_invite_flow_allowed()
            from app.services.invitation_service import invitation_service
            await invitation_service._obtener_invitacion_valida(
                db, data.invite_token, data.email
            )

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

        if data.invite_token:
            from app.services.admin_policy import assert_invite_flow_allowed
            assert_invite_flow_allowed()
            from app.services.invitation_service import invitation_service
            await invitation_service.consumir_invitacion_registro(
                db, data.invite_token, data.email, usuario.id
            )

        logger.info(f"Nuevo usuario registrado: {usuario.email} (rol={usuario.rol})")
        return usuario

    async def login(self, db: AsyncSession, data: LoginRequest) -> LoginResponse:
        """Autentica usuario y retorna access + refresh tokens junto con datos básicos del usuario."""
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
        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            usuario_id=usuario.id,
            email=usuario.email,
            nombre=usuario.nombre,
            apellido=usuario.apellido,
            rol=usuario.rol,
        )

    async def refresh(self, db: AsyncSession, refresh_token: str) -> TokenResponse:
        """
        Genera un nuevo access token a partir de un refresh token válido.

        Implementa refresh token rotation:
        - El token usado se invalida inmediatamente (blacklist en Redis via jti)
        - Se emite un par nuevo access + refresh
        - Si un token ya usado se reutiliza, se rechaza (posible robo)
        """
        payload = decode_token(refresh_token)
        if payload is None or payload.get("type") != "refresh":
            raise TokenExpiradoError()

        jti = payload.get("jti")
        if jti and await refresh_token_fue_usado(jti):
            logger.warning(f"Refresh token reutilizado detectado (jti={jti}). Posible robo.")
            raise TokenExpiradoError()

        from uuid import UUID
        user_id = payload.get("sub")
        result = await db.execute(select(Usuario).where(Usuario.id == UUID(user_id)))
        usuario = result.scalar_one_or_none()

        if not usuario or not usuario.activo:
            raise CredencialesInvalidasError("Usuario no válido")

        # Invalidar el refresh token actual antes de emitir uno nuevo
        if jti:
            ttl = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
            await marcar_refresh_token_usado(jti, ttl)

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

    async def solicitar_recuperacion(self, db: AsyncSession, email: str) -> Optional[tuple]:
        """
        Genera token de recuperación y lo guarda en DB.
        Retorna (token, nombre) para enviarlo por email.
        Retorna None si el email no existe (no revelar que no existe).
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
        return token, usuario.nombre

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

    async def cambiar_password(
        self,
        db: AsyncSession,
        usuario: "Usuario",
        password_actual: str,
        nueva_password: str,
    ) -> None:
        """Cambia la contraseña del usuario autenticado."""
        if not verify_password(password_actual, usuario.hashed_password):
            raise CredencialesInvalidasError("La contraseña actual es incorrecta")
        usuario.hashed_password = hash_password(nueva_password)
        await db.flush()
        logger.info(f"Contraseña cambiada por el usuario: {usuario.email}")

    def generar_token_verificacion(self, usuario: Usuario) -> str:
        """Genera JWT de verificación de email (24h)."""
        return create_email_verify_token(subject=str(usuario.id), email=usuario.email)

    async def verificar_email(self, db: AsyncSession, token: str) -> bool:
        """
        Valida el token JWT de verificación y marca email_verificado=True.
        Retorna False si el token es inválido, expirado o ya verificado.
        """
        payload = decode_token(token)
        if payload is None or payload.get("type") != "email_verify":
            return False

        from uuid import UUID
        user_id = payload.get("sub")
        email_claim = payload.get("email")
        if not user_id:
            return False

        result = await db.execute(select(Usuario).where(Usuario.id == UUID(user_id)))
        usuario = result.scalar_one_or_none()
        if not usuario:
            return False

        # Verificar que el email del token coincide (previene uso cruzado)
        if email_claim and usuario.email != email_claim:
            logger.warning(f"Token verificación email mismatch: {usuario.email} vs {email_claim}")
            return False

        if usuario.email_verificado:
            return True  # Idempotente: ya verificado

        usuario.email_verificado = True
        await db.flush()
        logger.info(f"Email verificado: {usuario.email}")
        return True

    async def reenviar_verificacion(self, db: AsyncSession, email: str) -> Optional[tuple]:
        """
        Genera nuevo token de verificación si el usuario existe y no está verificado.
        Retorna (token, nombre) o None (no revelar si el email existe).
        """
        result = await db.execute(
            select(Usuario).where(Usuario.email == email.lower())
        )
        usuario = result.scalar_one_or_none()
        if not usuario or usuario.email_verificado:
            return None

        token = self.generar_token_verificacion(usuario)
        return token, usuario.nombre


auth_service = AuthService()

