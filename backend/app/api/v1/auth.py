"""
WingConcept Backend — Auth Endpoints
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/recuperar
POST /api/v1/auth/reset-password
"""
import logging
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import (
    LoginRequest,
    RecuperarPasswordRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
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

    # Enviar email de bienvenida (no bloquear si falla)
    await email_service.enviar_bienvenida(usuario.email, usuario.nombre)

    return usuario


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Autentica usuario y retorna JWT. Rate limit: 10 intentos/15min por IP."""
    client_ip = request.client.host if request.client else "unknown"
    permitido, _ = await check_rate_limit(
        f"{client_ip}:{data.email}", limit=10, window_seconds=900, prefix="rl:login"
    )
    if not permitido:
        raise PermisosDenegadosError("Demasiados intentos fallidos. Espera 15 minutos.")

    return await auth_service.login(db, data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Renueva el access token usando el refresh token."""
    return await auth_service.refresh(db, data.refresh_token)


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

    token = await auth_service.solicitar_recuperacion(db, data.email)

    if token:
        # TODO: pasar la URL del frontend desde config
        await email_service.enviar_recuperacion_password(
            email=data.email,
            nombre="",
            token=token,
        )

    return {"message": "Si el email existe, recibirás las instrucciones en breve."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Restablece la contraseña usando el token de recuperación."""
    exitoso = await auth_service.resetear_password(db, data.token, data.nueva_password)
    if not exitoso:
        raise CredencialesInvalidasError("Token inválido o expirado")
    return {"message": "Contraseña actualizada correctamente."}


@router.get("/me", response_model=UsuarioResponse)
async def me(current_user=Depends(get_current_user)):
    """Retorna el perfil del usuario autenticado."""
    return current_user
