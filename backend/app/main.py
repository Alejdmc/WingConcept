"""
WingConcept Backend — App principal FastAPI
Equipo: ZomiDev
"""
import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
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


# ── Lifecycle: startup / shutdown ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Inicialización y limpieza de recursos."""
    logger.info(f"🚀 Iniciando {settings.APP_NAME} v{settings.APP_VERSION} [{settings.ENVIRONMENT}]")

    # Verificar conexión Redis (no fatal si falla en dev)
    try:
        from app.utils.redis_client import get_redis
        redis = await get_redis()
        await redis.ping()
        logger.info("✅ Redis conectado")
    except Exception as e:
        logger.warning(f"⚠️  Redis no disponible: {e} (el rate limiting y caché estarán desactivados)")

    yield

    # Shutdown
    logger.info("👋 Cerrando aplicación...")
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

# CORS — configurado via ALLOWED_ORIGINS en .env
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging de requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} "
        f"status={response.status_code} duration={duration:.3f}s"
    )
    return response


# ── Routers ───────────────────────────────────────────────────────────────────
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
