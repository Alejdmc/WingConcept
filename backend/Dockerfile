# ============================================================
# WingConcept Backend — Dockerfile
# Python 3.11 slim — producción lista
# ============================================================
FROM python:3.11-slim AS base

# Metadatos
LABEL maintainer="ZomiDev"
LABEL project="WingConcept"

# Variables de entorno del sistema
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# ── Dependencias del sistema ──────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Dependencias Python ───────────────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# ── Código fuente ─────────────────────────────────────────────────────────────
COPY . .
RUN chmod +x /app/docker-entrypoint.sh

# ── Usuario no-root (seguridad) ───────────────────────────────────────────────
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser:appuser /app
USER appuser

# ── Puerto ────────────────────────────────────────────────────────────────────
EXPOSE 8000

# ── Health check ─────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--proxy-headers", "--forwarded-allow-ips", "*"]

