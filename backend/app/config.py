"""
WingConcept Backend — Configuración central
Usa pydantic-settings para cargar variables desde .env
"""
from functools import lru_cache
from typing import List, Optional

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _jwt_role(token: str) -> Optional[str]:
    """Lee el claim 'role' de un JWT Supabase sin verificar firma."""
    if not token or token.count(".") < 2:
        return None
    try:
        import base64
        import json

        payload_b64 = token.split(".")[1]
        padding = "=" * (-len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64 + padding))
        role = payload.get("role")
        return str(role) if role else None
    except Exception:
        return None


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
    # Pool conservador para Supabase Session pooler (límite bajo en VPS compartido)
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 5
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800
    DB_COMMAND_TIMEOUT: int = 30

    # ── Supabase ─────────────────────────────────────────────
    # Obtener en: https://app.supabase.com → Settings → API
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""     # service_role key — solo backend
    SUPABASE_ANON_KEY: str = ""        # anon key
    SUPABASE_BUCKET_PRODUCTOS: str = "productos"
    SUPABASE_BUCKET_MODELOS_3D: str = "modelos3d"
    SUPABASE_BUCKET_MANUALS: str = "manuals"

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
    EMAIL_VERIFY_EXPIRE_HOURS: int = 24
    # Si True, bloquea crear órdenes sin email_verificado=True
    REQUIRE_EMAIL_VERIFIED: bool = False
    # Verificar DNS/MX del dominio del email (solo en producción si True)
    EMAIL_CHECK_DELIVERABILITY: bool = False

    # ── Stripe — Pagos (USD) ─────────────────────────────────
    # Panel: https://dashboard.stripe.com
    # Docs:  https://stripe.com/docs/api
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_CURRENCY: str = "usd"
    STRIPE_SUCCESS_URL: str = ""
    STRIPE_CANCEL_URL: str = ""

    # ── Resend — Email transaccional ─────────────────────────
    # Panel: https://resend.com/overview
    # Docs:  https://resend.com/docs
    # Requiere dominio verificado en DNS
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@wingconcept.com"
    FROM_NAME: str = "WingConcept"
    CONTACT_EMAIL: str = ""  # Destino del formulario de contacto; default = FROM_EMAIL

    # ── CORS ─────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # ── Frontend URL (links en emails) ───────────────────────
    FRONTEND_URL: str = "http://localhost:3000"

    # ── Admin invitaciones ───────────────────────────────────
    ADMIN_INVITE_EXPIRE_DAYS: int = 7
    # false = solo admins ya existentes; bloquea invitaciones, scripts y promociones
    ALLOW_NEW_ADMINS: bool = False

    # ── Hosts confiables (TrustedHostMiddleware) ──────────────
    # En producción: "wingconcept.com,www.wingconcept.com"
    ALLOWED_HOSTS: str = "localhost,127.0.0.1"

    # ── Logging ──────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"

    # ── Sentry — Monitoreo de errores (opcional) ──────────────
    # Panel: https://sentry.io
    # Configurar SENTRY_DSN para habilitar logging centralizado
    SENTRY_DSN: str = ""
    SENTRY_ENVIRONMENT: str = ""  # Usa ENVIRONMENT si está vacío
    SENTRY_TRACES_SAMPLE_RATE: float = 0.1  # 10% de traces en producción

    # ── Inventario ───────────────────────────────────────────
    # Alerta admin cuando stock <= este valor (partes/accesorios)
    LOW_STOCK_THRESHOLD: int = 2

    # ── Cloudflare Turnstile (CAPTCHA) ───────────────────────
    # Panel: https://dash.cloudflare.com → Turnstile → Add site
    # Site key → frontend NEXT_PUBLIC_TURNSTILE_SITE_KEY
    # Secret key → TURNSTILE_SECRET_KEY (solo backend)
    TURNSTILE_SECRET_KEY: str = ""

    # ── Uploads / Storage ────────────────────────────────────
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_IMAGE_TYPES: str = "image/jpeg,image/png,image/webp"
    ALLOWED_MODEL_TYPES: str = "model/gltf-binary,model/gltf+json,application/octet-stream"
    ALLOWED_MANUAL_TYPES: str = "application/pdf"
    MAX_MANUAL_UPLOAD_SIZE_MB: int = 25

    @field_validator("SUPABASE_URL", mode="before")
    @classmethod
    def normalize_supabase_url(cls, v: str) -> str:
        """Normaliza URL de Supabase (storage usa la raíz del proyecto, no /rest/v1)."""
        if not v:
            return v
        url = str(v).strip().rstrip("/")
        if url.startswith(("postgresql://", "postgresql+asyncpg://", "postgres://")):
            raise ValueError(
                "SUPABASE_URL no es la connection string de Postgres. "
                "Usa DATABASE_URL para la BD y SUPABASE_URL=https://TU_PROJECT_ID.supabase.co"
            )
        for suffix in ("/rest/v1", "/auth/v1", "/storage/v1"):
            if url.endswith(suffix):
                return url[: -len(suffix)]
        return url

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v:
            return v
        url = str(v).strip()
        if url.startswith("https://") and "supabase.co" in url:
            raise ValueError(
                "DATABASE_URL debe ser la connection string PostgreSQL, no la URL HTTPS de Supabase."
            )
        return url

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v: str) -> str:
        return v

    @model_validator(mode="after")
    def validate_critical_settings(self) -> "Settings":
        """
        Valida que las variables críticas de seguridad estén configuradas.

        SECRET_KEY vacío permite fabricar tokens JWT válidos trivialmente.
        En producción se exigen además las credenciales de pagos y webhooks.
        """
        if not self.SECRET_KEY:
            raise ValueError(
                "SECRET_KEY no puede estar vacío. "
                "Generarlo con: openssl rand -hex 32"
            )
        if len(self.SECRET_KEY) < 32:
            raise ValueError(
                "SECRET_KEY debe tener al menos 32 caracteres para ser seguro."
            )

        if self.SUPABASE_URL and self.SUPABASE_SERVICE_KEY:
            sk = self.SUPABASE_SERVICE_KEY.strip()
            if sk.startswith("sb_publishable_"):
                raise ValueError(
                    "SUPABASE_SERVICE_KEY tiene una clave publishable (pública). "
                    "En Supabase → Settings → API copia la clave service_role (eyJ... "
                    "o sb_secret_...) en SUPABASE_SERVICE_KEY, NO la publishable/anon."
                )
            service_jwt_role = _jwt_role(sk)
            anon_jwt_role = _jwt_role(self.SUPABASE_ANON_KEY.strip()) if self.SUPABASE_ANON_KEY else None
            if service_jwt_role == "anon":
                raise ValueError(
                    "SUPABASE_SERVICE_KEY contiene la clave anon (pública). "
                    "Están intercambiadas: pon la service_role en SUPABASE_SERVICE_KEY "
                    "y la anon en SUPABASE_ANON_KEY (Supabase → Settings → API)."
                )
            if anon_jwt_role == "service_role":
                raise ValueError(
                    "SUPABASE_ANON_KEY contiene la service_role (secreta). "
                    "Intercambia SUPABASE_SERVICE_KEY y SUPABASE_ANON_KEY en .env."
                )
        if self.ENVIRONMENT == "production":
            if self.DEBUG:
                raise ValueError("DEBUG debe ser False en producción.")
            if not self.REQUIRE_EMAIL_VERIFIED:
                object.__setattr__(self, "REQUIRE_EMAIL_VERIFIED", True)
            object.__setattr__(self, "ALLOW_NEW_ADMINS", False)
            if not self.DATABASE_URL:
                raise ValueError("DATABASE_URL es requerido en producción.")
            if not self.REDIS_PASSWORD:
                raise ValueError("REDIS_PASSWORD es requerido en producción.")
            if not self.RESEND_API_KEY:
                raise ValueError("RESEND_API_KEY es requerido en producción.")
            allowed_hosts = {h.strip() for h in self.ALLOWED_HOSTS.split(",") if h.strip()}
            if allowed_hosts <= {"localhost", "127.0.0.1", "test"}:
                raise ValueError(
                    "ALLOWED_HOSTS debe incluir el dominio de producción "
                    "(ej: wingconcept.com,www.wingconcept.com)."
                )
            if not self.STRIPE_SECRET_KEY:
                raise ValueError(
                    "STRIPE_SECRET_KEY es requerido en producción."
                )
            if not self.STRIPE_WEBHOOK_SECRET:
                # Permitir arrancar sin webhook hasta configurar Stripe Dashboard.
                # El endpoint /webhooks/stripe responde 503 hasta que exista whsec_...
                pass
            if not self.STRIPE_SUCCESS_URL or not self.STRIPE_CANCEL_URL:
                raise ValueError(
                    "STRIPE_SUCCESS_URL y STRIPE_CANCEL_URL son requeridos en producción."
                )
        return self

    def get_cors_origins(self) -> List[str]:
        """Retorna lista de orígenes CORS permitidos."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    def get_allowed_hosts(self) -> List[str]:
        """Retorna lista de hosts confiables para TrustedHostMiddleware."""
        hosts = [host.strip() for host in self.ALLOWED_HOSTS.split(",") if host.strip()]
        # Docker Compose: healthcheck (localhost) y middleware Next.js (backend:8000)
        if self.REDIS_HOST == "redis":
            for internal in ("backend", "localhost", "127.0.0.1"):
                if internal not in hosts:
                    hosts.append(internal)
        return hosts

    def get_allowed_image_types(self) -> List[str]:
        return [t.strip() for t in self.ALLOWED_IMAGE_TYPES.split(",")]

    def get_allowed_model_types(self) -> List[str]:
        return [t.strip() for t in self.ALLOWED_MODEL_TYPES.split(",")]

    def get_allowed_manual_types(self) -> List[str]:
        return [t.strip() for t in self.ALLOWED_MANUAL_TYPES.split(",")]

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
