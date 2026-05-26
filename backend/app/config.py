"""
WingConcept Backend — Configuración central
Usa pydantic-settings para cargar variables desde .env
"""
from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────────
    APP_NAME: str = "WingConcept API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # ── Servidor ─────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ── Base de datos — Supabase PostgreSQL ──────────────────
    # Obtener en: https://app.supabase.com → Settings → Database
    DATABASE_URL: str = ""

    # ── Supabase ─────────────────────────────────────────────
    # Obtener en: https://app.supabase.com → Settings → API
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""     # service_role key — solo backend
    SUPABASE_ANON_KEY: str = ""        # anon key
    SUPABASE_BUCKET_PRODUCTOS: str = "productos"
    SUPABASE_BUCKET_MODELOS_3D: str = "modelos3d"

    # ── Redis ────────────────────────────────────────────────
    # Usado para: caché, rate limiting, carrito anónimo, sesiones
    # En Docker usar: REDIS_HOST=redis  |  En local usar: REDIS_HOST=localhost
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0
    REDIS_CART_TTL: int = 86400        # 24h — carrito anónimo
    REDIS_CACHE_TTL: int = 300         # 5min — caché de productos

    # ── JWT ──────────────────────────────────────────────────
    # Generar SECRET_KEY con: openssl rand -hex 32
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Wompi — Pagos Colombia ───────────────────────────────
    # Panel: https://comercios.wompi.co
    # Docs:  https://docs.wompi.co
    # Sandbox: https://sandbox.wompi.co/v1
    # Producción: https://production.wompi.co/v1
    WOMPI_BASE_URL: str = "https://sandbox.wompi.co/v1"
    WOMPI_PUBLIC_KEY: str = ""         # pub_test_xxx o pub_prod_xxx
    WOMPI_PRIVATE_KEY: str = ""        # prv_test_xxx o prv_prod_xxx
    WOMPI_EVENTS_SECRET: str = ""      # Para validar HMAC de webhooks
    WOMPI_REDIRECT_URL: str = ""       # URL de retorno tras pago

    # ── Stripe — Pagos Global ────────────────────────────────
    # Panel: https://dashboard.stripe.com
    # Docs:  https://stripe.com/docs/api
    # Test:  sk_test_xxx | pk_test_xxx
    # Live:  sk_live_xxx | pk_live_xxx
    STRIPE_SECRET_KEY: str = ""        # sk_test_xxx o sk_live_xxx
    STRIPE_PUBLISHABLE_KEY: str = ""   # pk_test_xxx o pk_live_xxx
    STRIPE_WEBHOOK_SECRET: str = ""    # whsec_xxx — desde Stripe Dashboard > Webhooks
    STRIPE_CURRENCY: str = "usd"       # Moneda por defecto
    STRIPE_SUCCESS_URL: str = ""
    STRIPE_CANCEL_URL: str = ""

    # ── Resend — Email transaccional ─────────────────────────
    # Panel: https://resend.com/overview
    # Docs:  https://resend.com/docs
    # Requiere dominio verificado en DNS
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@wingconcept.com"
    FROM_NAME: str = "WingConcept"

    # ── CORS ─────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # ── Logging ──────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"

    # ── Uploads / Storage ────────────────────────────────────
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_IMAGE_TYPES: str = "image/jpeg,image/png,image/webp"
    ALLOWED_MODEL_TYPES: str = "model/gltf-binary,model/gltf+json,application/octet-stream"

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v: str) -> str:
        return v

    def get_cors_origins(self) -> List[str]:
        """Retorna lista de orígenes CORS permitidos."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    def get_allowed_image_types(self) -> List[str]:
        return [t.strip() for t in self.ALLOWED_IMAGE_TYPES.split(",")]

    def get_allowed_model_types(self) -> List[str]:
        return [t.strip() for t in self.ALLOWED_MODEL_TYPES.split(",")]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def redis_url(self) -> str:
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"


@lru_cache()
def get_settings() -> Settings:
    """Singleton de configuración — se cachea en memoria."""
    return Settings()


# Instancia global
settings = get_settings()
