"""
WingConcept Backend — App principal FastAPI
Equipo: ZomiDev
"""
import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from app.config import settings

# ── Logging estructurado ──────────────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ── Límite de tamaño del body (anti-DoS) ─────────────────────────────────────
# Los webhooks de Wompi/Stripe son JSONs pequeños (<50 KB).
# Las cargas de imágenes van por Supabase Storage, no por FastAPI.
# 2 MB es suficiente para cualquier payload legítimo de la API.
MAX_REQUEST_BODY_BYTES = 2 * 1024 * 1024  # 2 MB


# ── Lifecycle: startup / shutdown ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Inicialización y limpieza de recursos."""
    logger.info(f" Iniciando {settings.APP_NAME} v{settings.APP_VERSION} [{settings.ENVIRONMENT}]")

    # Verificar conexión Redis (no fatal si falla en dev)
    try:
        from app.utils.redis_client import get_redis
        redis = await get_redis()
        await redis.ping()
        logger.info("Redis conectado")
    except Exception as e:
        logger.warning(f"  Redis no disponible: {e} (el rate limiting y caché estarán desactivados)")

    yield

    # Shutdown
    logger.info(" Cerrando aplicación...")
    from app.utils.redis_client import close_redis
    await close_redis()


# ── App FastAPI ───────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
**WingConcept API** — Backend para e-commerce de paramotores.

## Autenticación
Usar `Bearer <access_token>` en el header `Authorization`.

## Pasarelas de pago
- **Wompi** — Colombia (COP): `proveedor: "wompi"`
- **Stripe** — Internacional (USD/EUR): `proveedor: "stripe"`
    """,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    openapi_url="/openapi.json" if not settings.is_production else None,
    lifespan=lifespan,
)

# ── Middlewares ───────────────────────────────────────────────────────────────

# TrustedHostMiddleware — rechaza requests con Host header no permitido
# Previene ataques de Host Header Injection
# En producción configura ALLOWED_HOSTS en .env con el dominio real
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.get_allowed_hosts(),
)

# CORS — configurado via ALLOWED_ORIGINS en .env
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "X-Session-ID", "X-Request-ID"],
)


# ── Middleware: Límite de tamaño de body (anti-DoS) ───────────────────────────
@app.middleware("http")
async def limit_request_body_size(request: Request, call_next):
    """
    Rechaza requests cuyo body supere MAX_REQUEST_BODY_BYTES.
    Previene ataques de saturación de memoria enviando payloads enormes.
    """
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_REQUEST_BODY_BYTES:
        logger.warning(
            f"Request rechazado: body demasiado grande "
            f"({content_length} bytes > {MAX_REQUEST_BODY_BYTES}) "
            f"desde {request.client.host if request.client else 'unknown'}"
        )
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={"detail": "El cuerpo de la solicitud supera el límite permitido (2 MB)."},
        )
    return await call_next(request)


# ── Middleware: Headers de seguridad HTTP ─────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """
    Agrega headers de seguridad a todas las respuestas.
    Defensa en profundidad complementaria a la configuración de Nginx.
    """
    response = await call_next(request)
    # Previene que el browser interprete el contenido diferente al declarado
    response.headers["X-Content-Type-Options"] = "nosniff"
    # Impide que la respuesta sea embebida en iframes (clickjacking)
    response.headers["X-Frame-Options"] = "DENY"
    # Política de referrer — no filtrar origen en cross-origin
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # Deshabilitar features de hardware innecesarias
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    # HSTS solo en producción (requiere HTTPS)
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )
    return response


# ── Middleware: Logging de requests ───────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Registra método, ruta y duración de cada request.
    Solo logea el path (sin query params) para no filtrar datos sensibles en logs.
    """
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    # Usar request.url.path (sin query params) para no loguear tokens/passwords
    logger.info(
        f"{request.method} {request.url.path} "
        f"status={response.status_code} duration={duration:.3f}s"
    )
    return response


# ── Routers ───────────────────────────────────────────────────────────────────
# Importar modelos primero para que SQLAlchemy resuelva todas las relaciones
import app.models as _models_registry  # noqa: F401
from app.api.router import api_router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# ── Endpoints base ────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "ok",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check para load balancers y Docker."""
    checks = {"api": "ok"}

    # Check DB
    try:
        from app.database import AsyncSessionLocal
        if AsyncSessionLocal:
            async with AsyncSessionLocal() as session:
                from sqlalchemy import text
                await session.execute(text("SELECT 1"))
            checks["database"] = "ok"
        else:
            checks["database"] = "not_configured"
    except Exception as e:
        checks["database"] = f"error: {str(e)[:50]}"

    # Check Redis
    try:
        from app.utils.redis_client import get_redis
        redis = await get_redis()
        await redis.ping()
        checks["redis"] = "ok"
    except Exception:
        checks["redis"] = "unavailable"

    is_healthy = checks.get("database") == "ok"
    return JSONResponse(
        status_code=200 if is_healthy else 503,
        content={"status": "healthy" if is_healthy else "degraded", "checks": checks},
    )
