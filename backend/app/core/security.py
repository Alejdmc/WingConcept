"""
WingConcept Backend — Seguridad: JWT + Hashing de contraseñas
"""
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import bcrypt
from jose import JWTError, jwt

from app.config import settings

logger = logging.getLogger(__name__)

# ── Hashing de contraseñas (bcrypt directo) ───────────────────────────────────
# passlib 1.7.4 rompe con bcrypt 4.1+ / Python 3.13; usamos bcrypt nativo.
BCRYPT_ROUNDS = 12


def hash_password(password: str) -> str:
    """Hashea una contraseña con bcrypt."""
    salt = bcrypt.gensalt(rounds=BCRYPT_ROUNDS)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña contra su hash bcrypt."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False


# ── JWT ───────────────────────────────────────────────────────────────────────
def create_access_token(
    subject: str | Any,
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[dict] = None,
) -> str:
    """
    Crea un JWT de acceso (15 min por defecto).
    - subject: normalmente el user_id como string
    - extra_claims: claims adicionales a incluir en el token
    """
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload: dict[str, Any] = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: str | Any) -> str:
    """
    Crea un JWT de refresh (7 días por defecto).

    Incluye un claim `jti` (JWT ID) único por token.
    Esto prepara la infraestructura para refresh token rotation:
    al usar el token, se puede marcar el jti como consumido en Redis
    para detectar y bloquear tokens robados o reutilizados.
    """
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    token_jti = str(uuid.uuid4())  # ID único para este token específico
    payload: dict[str, Any] = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "refresh",
        "jti": token_jti,  # JWT ID — permite invalidar tokens individuales
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_email_verify_token(subject: str | Any, email: str) -> str:
    """
    Crea un JWT de verificación de email (24h por defecto).
    Tipo 'email_verify' — no intercambiable con access/refresh tokens.
    """
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.EMAIL_VERIFY_EXPIRE_HOURS)
    payload: dict[str, Any] = {
        "sub": str(subject),
        "email": email,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "email_verify",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """
    Decodifica y valida un JWT.
    Retorna el payload o None si es inválido/expirado.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except JWTError as e:
        logger.warning(f"Token JWT inválido: {e}")
        return None


def get_token_subject(token: str) -> Optional[str]:
    """Extrae el subject (user_id) de un token válido."""
    payload = decode_token(token)
    if payload is None:
        return None
    return payload.get("sub")
