"""
WingConcept Backend — Cloudflare Turnstile verification
Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
"""
import logging
from typing import Optional

import httpx

from app.config import settings
from app.core.exceptions import ValidacionError

logger = logging.getLogger(__name__)

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


async def verify_turnstile(token: Optional[str], remote_ip: Optional[str] = None) -> None:
    """
    Valida el token de Turnstile. Si TURNSTILE_SECRET_KEY está vacío, no hace nada (dev).
    """
    secret = (settings.TURNSTILE_SECRET_KEY or "").strip()
    if not secret:
        return

    if not token or not token.strip():
        raise ValidacionError("Captcha verification required.")

    payload = {"secret": secret, "response": token.strip()}
    if remote_ip:
        payload["remoteip"] = remote_ip

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(TURNSTILE_VERIFY_URL, data=payload)
            res.raise_for_status()
            data = res.json()
    except httpx.HTTPError as exc:
        logger.error("Turnstile verification request failed: %s", exc)
        raise ValidacionError("Captcha verification unavailable. Try again later.") from exc

    if not data.get("success"):
        error_codes = data.get("error-codes") or []
        logger.warning("Turnstile rejected token: %s", error_codes)
        raise ValidacionError("Captcha verification failed. Please try again.")
