"""
WingConcept Backend — Email Service
Usa Resend para emails transaccionales.

Flujo de verificación de email:
  1. Registro → backend genera JWT tipo "email_verify" (NO se guarda en BD)
  2. Resend envía HTML con enlace: {FRONTEND_URL}/verify-email?token=JWT
  3. Frontend llama POST /api/v1/auth/verify-email { "token": "..." }
  4. Backend valida JWT y marca usuario.email_verificado = True en PostgreSQL

Requiere en .env: RESEND_API_KEY, FROM_EMAIL (dominio verificado en Resend DNS)
Sin RESEND_API_KEY en dev: los emails se loguean pero no se envían (registro no falla).
"""
import logging
from typing import Optional

import resend

from app.config import settings

logger = logging.getLogger(__name__)

if settings.RESEND_API_KEY:
    resend.api_key = settings.RESEND_API_KEY


class EmailService:

    def _from_address(self) -> str:
        return f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>"

    def _puede_enviar(self) -> bool:
        """Resend requiere API key; en dev sin key solo logueamos."""
        if not settings.RESEND_API_KEY:
            logger.warning(
                "RESEND_API_KEY no configurado — email no enviado "
                "(configura en .env cuando tengas cuenta Resend)"
            )
            return False
        return True

    def _enviar(self, payload: dict, tipo: str, destinatario: str) -> bool:
        if not self._puede_enviar():
            logger.info(f"[EMAIL DEV] {tipo} → {destinatario} (simulado, sin Resend)")
            return False
        try:
            resend.Emails.send(payload)
            logger.info(f"Email {tipo} enviado a: {destinatario}")
            return True
        except Exception as e:
            logger.error(f"Error enviando email {tipo} a {destinatario}: {e}")
            return False

    async def enviar_bienvenida(self, email: str, nombre: str) -> bool:
        """Email de bienvenida tras registro."""
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": f"Welcome to WingConcept, {nombre}!",
            "html": f"""
            <h2>Hi {nombre}!</h2>
            <p>Your WingConcept account has been successfully created.</p>
            <p>We're excited to have you with us.</p>
            <br>
            <p>The WingConcept team</p>
            """,
        }, "bienvenida", email)

    async def enviar_recuperacion_password(
        self, email: str, nombre: str, token: str, frontend_url: str = ""
    ) -> bool:
        """Email de recuperación de contraseña (token aleatorio guardado en BD)."""
        url_base = (frontend_url or settings.FRONTEND_URL).rstrip("/")
        reset_url = f"{url_base}/reset-password?token={token}"

        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": "Password reset — WingConcept",
            "html": f"""
            <h2>Hi {nombre},</h2>
            <p>We received a request to reset your password.</p>
            <p>
                <a href="{reset_url}" style="
                    background:#000;color:#fff;padding:12px 24px;
                    text-decoration:none;border-radius:6px;display:inline-block
                ">
                    Reset password
                </a>
            </p>
            <p><small>This link expires in 1 hour.</small></p>
            <p><small>If you didn't request this, please ignore this email.</small></p>
            """,
        }, "recuperacion_password", email)

    async def enviar_verificacion_email(
        self,
        email: str,
        nombre: str,
        token: str,
        frontend_url: str = "",
    ) -> bool:
        """
        Email con enlace para verificar la cuenta.
        El token es un JWT firmado (tipo email_verify), NO un token de Resend.
        Resend solo transporta el email; la validación la hace nuestro backend.
        """
        url_base = (frontend_url or settings.FRONTEND_URL).rstrip("/")
        verify_url = f"{url_base}/verify-email?token={token}"

        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": "Verify your email — WingConcept",
            "html": f"""
            <h2>Hi {nombre},</h2>
            <p>Thanks for signing up for WingConcept. Please verify your email to activate your account:</p>
            <p>
                <a href="{verify_url}" style="
                    background:#000;color:#fff;padding:12px 24px;
                    text-decoration:none;border-radius:6px;display:inline-block
                ">
                    Verify email
                </a>
            </p>
            <p><small>Or copy this link: {verify_url}</small></p>
            <p><small>This link expires in {settings.EMAIL_VERIFY_EXPIRE_HOURS} hours.</small></p>
            <p><small>If you didn't create this account, please ignore this email.</small></p>
            """,
        }, "verificacion_email", email)

    async def enviar_confirmacion_orden(
        self, email: str, nombre: str, numero_orden: str, total: float, moneda: str
    ) -> bool:
        """Confirmación de orden creada."""
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": f"Order confirmation #{numero_orden} — WingConcept",
            "html": f"""
            <h2>Thank you for your purchase, {nombre}!</h2>
            <p>Your order <strong>#{numero_orden}</strong> has been received.</p>
            <p>Total: <strong>{total:,.2f} {moneda}</strong></p>
            <p>We'll notify you when your order has been shipped.</p>
            <br>
            <p>The WingConcept team</p>
            """,
        }, "confirmacion_orden", email)

    async def enviar_pago_confirmado(
        self, email: str, nombre: str, numero_orden: str, proveedor: str
    ) -> bool:
        """Notifica que el pago fue procesado exitosamente."""
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": f"Payment confirmed — Order #{numero_orden}",
            "html": f"""
            <h2>Payment received, {nombre} ✓</h2>
            <p>Your payment for order <strong>#{numero_orden}</strong> was processed successfully.</p>
            <p>Provider: {proveedor.upper()}</p>
            <p>Your order is being prepared.</p>
            <br>
            <p>The WingConcept team</p>
            """,
        }, "pago_confirmado", email)

    async def enviar_orden_enviada(
        self,
        email: str,
        nombre: str,
        numero_orden: str,
        numero_guia: str,
        transportadora: str,
    ) -> bool:
        """Notifica que la orden fue despachada con número de guía."""
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": f"Your order has shipped — Order #{numero_orden}",
            "html": f"""
            <h2>Your order is on its way, {nombre}!</h2>
            <p>Order: <strong>#{numero_orden}</strong></p>
            <p>Carrier: <strong>{transportadora}</strong></p>
            <p>Tracking number: <strong>{numero_guia}</strong></p>
            <br>
            <p>The WingConcept team</p>
            """,
        }, "orden_enviada", email)


email_service = EmailService()
