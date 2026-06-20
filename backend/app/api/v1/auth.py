"""
WingConcept Backend — Auth Endpoints
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/recuperar
POST /api/v1/auth/reset-password
"""
import logging
from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RecuperarPasswordRequest,
    RefreshRequest,
    RegisterRequest,
    ResendVerificationRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerifyEmailRequest,
)
from app.schemas.usuario import UsuarioResponse
from app.services.auth_service import auth_service
from app.services.email_service import email_service
from app.utils.redis_client import check_rate_limit
from app.core.exceptions import CredencialesInvalidasError, PermisosDenegadosError
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])
logger = logging.getLogger(__name__)


@router.post("/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Registra un nuevo usuario. Rate limit: 5 registros/hora por IP."""
    client_ip = request.client.host if request.client else "unknown"
    permitido, restantes = await check_rate_limit(client_ip, limit=5, window_seconds=3600, prefix="rl:register")
    if not permitido:
        raise PermisosDenegadosError("Demasiados intentos de registro. Espera 1 hora.")

    usuario = await auth_service.registrar(db, data)

    # Enviar emails (no bloquear registro si fallan)
    verify_token = auth_service.generar_token_verificacion(usuario)
    await email_service.enviar_verificacion_email(
        usuario.email, usuario.nombre, verify_token, settings.FRONTEND_URL
    )
    await email_service.enviar_bienvenida(usuario.email, usuario.nombre)

    return usuario


@router.post("/login", response_model=LoginResponse)
async def login(
    data: LoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    Autentica usuario y retorna JWT + datos básicos.
    También establece una cookie 'access_token' para compatibilidad con el middleware del frontend.
    Rate limit: 10 intentos/15min por IP.
    """
    client_ip = request.client.host if request.client else "unknown"
    permitido, _ = await check_rate_limit(
        f"{client_ip}:{data.email}", limit=10, window_seconds=900, prefix="rl:login"
    )
    if not permitido:
        raise PermisosDenegadosError("Demasiados intentos fallidos. Espera 15 minutos.")

    login_data = await auth_service.login(db, data)

    # Establecer cookie para el middleware del frontend (Next.js)
    response.set_cookie(
        key="access_token",
        value=login_data.access_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return login_data


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    data: RefreshRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Renueva el access token usando el refresh token.
    También actualiza la cookie 'access_token'.
    """
    token_data = await auth_service.refresh(db, data.refresh_token)

    # Actualizar cookie
    response.set_cookie(
        key="access_token",
        value=token_data.access_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return token_data


@router.post("/recuperar", status_code=status.HTTP_200_OK)
async def recuperar_password(
    data: RecuperarPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Solicita recuperación de contraseña.
    Siempre retorna 200 aunque el email no exista (seguridad).
    Rate limit: 3 intentos/hora por IP.
    """
    client_ip = request.client.host if request.client else "unknown"
    permitido, _ = await check_rate_limit(client_ip, limit=3, window_seconds=3600, prefix="rl:recuperar")
    if not permitido:
        raise PermisosDenegadosError("Demasiados intentos. Espera 1 hora.")

    token_data = await auth_service.solicitar_recuperacion(db, data.email)

    if token_data:
        token, nombre = token_data
        await email_service.enviar_recuperacion_password(
            email=data.email,
            nombre=nombre,
            token=token,
            frontend_url=settings.FRONTEND_URL,
        )

    return {"message": "Si el email existe, recibirás las instrucciones en breve."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Restablece la contraseña usando el token de recuperación."""
    exitoso = await auth_service.resetear_password(db, data.token, data.nueva_password)
    if not exitoso:
        raise CredencialesInvalidasError("Token inválido o expirado")
    return {"message": "Contraseña actualizada correctamente."}


@router.post("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(data: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    """Verifica el email del usuario usando el token JWT del enlace."""
    exitoso = await auth_service.verificar_email(db, data.token)
    if not exitoso:
        raise CredencialesInvalidasError("Token de verificación inválido o expirado")
    return {"message": "Email verificado correctamente."}


@router.post("/resend-verification", status_code=status.HTTP_200_OK)
async def resend_verification(
    data: ResendVerificationRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Reenvía el email de verificación.
    Siempre retorna 200 (no revela si el email existe o ya está verificado).
    Rate limit: 3 intentos/hora por IP.
    """
    client_ip = request.client.host if request.client else "unknown"
    permitido, _ = await check_rate_limit(
        f"{client_ip}:verify", limit=3, window_seconds=3600, prefix="rl:verify"
    )
    if not permitido:
        raise PermisosDenegadosError("Demasiados intentos. Espera 1 hora.")

    token_data = await auth_service.reenviar_verificacion(db, data.email)
    if token_data:
        token, nombre = token_data
        await email_service.enviar_verificacion_email(
            email=data.email,
            nombre=nombre,
            token=token,
            frontend_url=settings.FRONTEND_URL,
        )

    return {"message": "Si el email existe y no está verificado, recibirás un nuevo enlace."}


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(response: Response):
    """
    Limpia la cookie de acceso del lado del servidor.
    """
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
    )
    return {"message": "Sesión cerrada correctamente"}


@router.get("/me", response_model=UsuarioResponse)
async def me(current_user=Depends(get_current_user)):
    """Retorna el perfil del usuario autenticado."""
    return current_user
