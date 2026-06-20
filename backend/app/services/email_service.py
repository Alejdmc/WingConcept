"""
WingConcept Backend — Email Service
Usa Resend para emails transaccionales.
Docs: https://resend.com/docs
Panel: https://resend.com/overview
Requiere: RESEND_API_KEY, FROM_EMAIL en .env
"""
import logging
from typing import Optional

import resend

from app.config import settings

logger = logging.getLogger(__name__)

# ── Configurar SDK de Resend ──────────────────────────────────────────────────
# La API key se carga desde RESEND_API_KEY en .env
# Obtener en: https://resend.com/api-keys
resend.api_key = settings.RESEND_API_KEY


class EmailService:

    def _from_address(self) -> str:
        return f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>"

    async def enviar_bienvenida(self, email: str, nombre: str) -> bool:
        """Email de bienvenida tras registro."""
        try:
            resend.Emails.send({
                "from": self._from_address(),
                "to": [email],
                "subject": f"¡Bienvenido a WingConcept, {nombre}!",
                "html": f"""
                <h2>¡Hola {nombre}!</h2>
                <p>Tu cuenta en WingConcept ha sido creada exitosamente.</p>
                <p>Estamos emocionados de tenerte con nosotros.</p>
                <br>
                <p>El equipo de WingConcept</p>
                """,
            })
            logger.info(f"Email bienvenida enviado a: {email}")
            return True
        except Exception as e:
            logger.error(f"Error enviando email bienvenida a {email}: {e}")
            return False

    async def enviar_recuperacion_password(
        self, email: str, nombre: str, token: str, frontend_url: str = ""
    ) -> bool:
        """
        Email de recuperación de contraseña.
        El link apunta al frontend que procesa el token.
        """
        if not frontend_url:
            frontend_url = settings.FRONTEND_URL

        reset_url = f"{frontend_url.rstrip('/')}/reset-password?token={token}"

        try:
            resend.Emails.send({
                "from": self._from_address(),
                "to": [email],
                "subject": "Recuperación de contraseña — WingConcept",
                "html": f"""
                <h2>Hola {nombre},</h2>
                <p>Recibimos una solicitud para restablecer tu contraseña.</p>
                <p>
                    <a href="{reset_url}" style="
                        background:#000;color:#fff;padding:12px 24px;
                        text-decoration:none;border-radius:6px;display:inline-block
                    ">
                        Restablecer contraseña
                    </a>
                </p>
                <p><small>Este enlace expira en 1 hora.</small></p>
                <p><small>Si no solicitaste esto, ignora este email.</small></p>
                """,
            })
            logger.info(f"Email recuperación enviado a: {email}")
            return True
        except Exception as e:
            logger.error(f"Error enviando email recuperación a {email}: {e}")
            return False

    async def enviar_verificacion_email(
        self,
        email: str,
        nombre: str,
        token: str,
        frontend_url: str = "",
    ) -> bool:
        """Email con enlace para verificar la cuenta."""
        if not frontend_url:
            frontend_url = settings.FRONTEND_URL

        verify_url = f"{frontend_url.rstrip('/')}/verify-email?token={token}"

        try:
            resend.Emails.send({
                "from": self._from_address(),
                "to": [email],
                "subject": "Verifica tu email — WingConcept",
                "html": f"""
                <h2>Hola {nombre},</h2>
                <p>Gracias por registrarte en WingConcept. Verifica tu email para activar tu cuenta:</p>
                <p>
                    <a href="{verify_url}" style="
                        background:#000;color:#fff;padding:12px 24px;
                        text-decoration:none;border-radius:6px;display:inline-block
                    ">
                        Verificar email
                    </a>
                </p>
                <p><small>Este enlace expira en {settings.EMAIL_VERIFY_EXPIRE_HOURS} horas.</small></p>
                <p><small>Si no creaste esta cuenta, ignora este email.</small></p>
                """,
            })
            logger.info(f"Email verificación enviado a: {email}")
            return True
        except Exception as e:
            logger.error(f"Error enviando email verificación a {email}: {e}")
            return False

    async def enviar_confirmacion_orden(
        self, email: str, nombre: str, numero_orden: str, total: float, moneda: str
    ) -> bool:
        """Confirmación de orden creada."""
        try:
            resend.Emails.send({
                "from": self._from_address(),
                "to": [email],
                "subject": f"Confirmación de orden #{numero_orden} — WingConcept",
                "html": f"""
                <h2>¡Gracias por tu compra, {nombre}!</h2>
                <p>Tu orden <strong>#{numero_orden}</strong> ha sido recibida.</p>
                <p>Total: <strong>{total:,.2f} {moneda}</strong></p>
                <p>Te notificaremos cuando tu pedido sea despachado.</p>
                <br>
                <p>El equipo de WingConcept</p>
                """,
            })
            logger.info(f"Email confirmación orden {numero_orden} enviado a: {email}")
            return True
        except Exception as e:
            logger.error(f"Error enviando confirmación de orden {numero_orden}: {e}")
            return False

    async def enviar_pago_confirmado(
        self, email: str, nombre: str, numero_orden: str, proveedor: str
    ) -> bool:
        """Notifica que el pago fue procesado exitosamente."""
        try:
            resend.Emails.send({
                "from": self._from_address(),
                "to": [email],
                "subject": f"Pago confirmado — Orden #{numero_orden}",
                "html": f"""
                <h2>Pago recibido, {nombre} ✓</h2>
                <p>Tu pago para la orden <strong>#{numero_orden}</strong> fue procesado exitosamente.</p>
                <p>Proveedor: {proveedor.upper()}</p>
                <p>Tu pedido está siendo preparado.</p>
                <br>
                <p>El equipo de WingConcept</p>
                """,
            })
            return True
        except Exception as e:
            logger.error(f"Error enviando email pago confirmado: {e}")
            return False

    async def enviar_orden_enviada(
        self,
        email: str,
        nombre: str,
        numero_orden: str,
        numero_guia: str,
        transportadora: str,
    ) -> bool:
        """Notifica que la orden fue despachada con número de guía."""
        try:
            resend.Emails.send({
                "from": self._from_address(),
                "to": [email],
                "subject": f"Tu pedido fue enviado — Orden #{numero_orden}",
                "html": f"""
                <h2>¡Tu pedido está en camino, {nombre}! 🚀</h2>
                <p>Orden: <strong>#{numero_orden}</strong></p>
                <p>Transportadora: <strong>{transportadora}</strong></p>
                <p>Número de guía: <strong>{numero_guia}</strong></p>
                <br>
                <p>El equipo de WingConcept</p>
                """,
            })
            return True
        except Exception as e:
            logger.error(f"Error enviando email orden enviada: {e}")
            return False


email_service = EmailService()
