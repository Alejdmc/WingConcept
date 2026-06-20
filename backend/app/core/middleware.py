"""
WingConcept Backend — Middleware de seguridad
Rate limiting global (anti-DDoS) y validación de session ID.
"""
import logging
import re
from typing import Callable

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse

from app.utils.redis_client import check_rate_limit

logger = logging.getLogger(__name__)

# UUID v4 o cadena alfanumérica segura (generada por crypto.randomUUID() en el frontend)
SESSION_ID_PATTERN = re.compile(r"^[a-zA-Z0-9\-_]{8,64}$")

# Rutas excluidas del rate limit global (webhooks de pago, health checks)
RATE_LIMIT_EXEMPT_PREFIXES = (
    "/health",
    "/api/v1/webhooks/",
)

# Límite global por IP: 120 requests/minuto (complementa Nginx 30r/m en producción)
GLOBAL_RATE_LIMIT = 120
GLOBAL_RATE_WINDOW = 60


def _get_client_ip(request: Request) -> str:
    """Obtiene IP real del cliente, respetando X-Forwarded-For de Nginx."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def validar_session_id(session_id: str) -> bool:
    """
    Valida que el X-Session-ID sea seguro.
    Previene inyección de caracteres especiales en claves Redis.
    """
    return bool(SESSION_ID_PATTERN.match(session_id))


async def global_rate_limit_middleware(request: Request, call_next: Callable) -> Response:
    """
    Rate limiting global por IP para mitigar DDoS a nivel de aplicación.
    Complementa el rate limiting de Nginx (capa HTTP) y Redis (capa auth).
    """
    path = request.url.path

    if any(path.startswith(prefix) for prefix in RATE_LIMIT_EXEMPT_PREFIXES):
        return await call_next(request)

    client_ip = _get_client_ip(request)
    permitido, restantes = await check_rate_limit(
        identifier=client_ip,
        limit=GLOBAL_RATE_LIMIT,
        window_seconds=GLOBAL_RATE_WINDOW,
        prefix="rl:global",
    )

    if not permitido:
        logger.warning(f"Rate limit global excedido: IP={client_ip} path={path}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Demasiadas solicitudes. Intenta de nuevo en un momento."},
            headers={"Retry-After": str(GLOBAL_RATE_WINDOW)},
        )

    response = await call_next(request)
    response.headers["X-RateLimit-Remaining"] = str(restantes)
    return response


async def validate_session_id_middleware(request: Request, call_next: Callable) -> Response:
    """
    Valida el header X-Session-ID antes de usarlo en Redis.
    Rechaza valores maliciosos que podrían explotar claves Redis.
    """
    session_id = request.headers.get("X-Session-ID")
    if session_id and not validar_session_id(session_id):
        logger.warning(
            f"X-Session-ID inválido rechazado desde "
            f"{request.client.host if request.client else 'unknown'}"
        )
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "X-Session-ID inválido. Debe ser un UUID o cadena alfanumérica."},
        )
    return await call_next(request)
