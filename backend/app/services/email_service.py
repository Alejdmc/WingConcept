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

# Paleta y tipografía alineadas con frontend/tailwind.config.js
_BRAND = "#c0392b"
_BRAND_SOFT = "#fbeceb"
_INK = "#1d1d1f"
_INK2 = "#6e6e73"
_BG2 = "#f5f5f7"
_BORDER = "#e5e5ea"
_FONT = "'Montserrat', 'Helvetica Neue', Arial, sans-serif"


class EmailService:

    def _from_address(self) -> str:
        return f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>"

    def _logo_url(self) -> str:
        return f"{settings.FRONTEND_URL.rstrip('/')}/images/logo.png"

    def _wrap(self, body_html: str, preheader: str = "") -> str:
        """Envuelve el contenido de un email en el layout de marca WingConcept."""
        return f"""\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WingConcept</title>
</head>
<body style="margin:0;padding:0;background-color:{_BG2};font-family:{_FONT};">
  <span style="display:none;font-size:1px;color:{_BG2};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">{preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:{_BG2};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid {_BORDER};">
          <tr>
            <td align="center" style="padding:32px 24px 20px;border-bottom:1px solid {_BORDER};">
              <img src="{self._logo_url()}" alt="WingConcept" width="180" style="display:block;max-width:180px;height:auto;">
            </td>
          </tr>
          <tr>
            <td style="padding:36px 36px 28px;color:{_INK};font-size:15px;line-height:1.6;">
              {body_html}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 36px 32px;border-top:1px solid {_BORDER};">
              <p style="margin:0;color:{_INK2};font-size:12px;line-height:1.6;">
                &copy; {settings.FROM_NAME} &mdash; Paramotors, paratrikes &amp; adventure gear.<br>
                This is an automated message, please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    def _button(self, url: str, label: str) -> str:
        return f"""\
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td align="center" style="border-radius:8px;background-color:{_BRAND};">
      <a href="{url}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;
        color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:0.3px;">
        {label}
      </a>
    </td>
  </tr>
</table>"""

    def _heading(self, text: str) -> str:
        return f'<h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:{_INK};">{text}</h1>'

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
        body = f"""
        {self._heading(f"Welcome, {nombre}!")}
        <p>Your WingConcept account has been successfully created.</p>
        <p>We're excited to have you with us — get ready to explore paramotors, paratrikes and everything you need for your next adventure.</p>
        """
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": f"Welcome to WingConcept, {nombre}!",
            "html": self._wrap(body, preheader="Your WingConcept account is ready."),
        }, "bienvenida", email)

    async def enviar_recuperacion_password(
        self, email: str, nombre: str, token: str, frontend_url: str = ""
    ) -> bool:
        """Email de recuperación de contraseña (token aleatorio guardado en BD)."""
        url_base = (frontend_url or settings.FRONTEND_URL).rstrip("/")
        reset_url = f"{url_base}/reset-password?token={token}"

        body = f"""
        {self._heading(f"Hi {nombre},")}
        <p>We received a request to reset your password.</p>
        {self._button(reset_url, "Reset password")}
        <p style="color:{_INK2};font-size:13px;">This link expires in 1 hour.</p>
        <p style="color:{_INK2};font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
        """
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": "Password reset — WingConcept",
            "html": self._wrap(body, preheader="Reset your WingConcept password."),
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

        body = f"""
        {self._heading(f"Hi {nombre},")}
        <p>Thanks for signing up for WingConcept. Please verify your email to activate your account:</p>
        {self._button(verify_url, "Verify email")}
        <p style="color:{_INK2};font-size:13px;word-break:break-all;">
            Or copy this link into your browser:<br>
            <a href="{verify_url}" style="color:{_BRAND};">{verify_url}</a>
        </p>
        <p style="color:{_INK2};font-size:13px;">This link expires in {settings.EMAIL_VERIFY_EXPIRE_HOURS} hours.</p>
        <p style="color:{_INK2};font-size:13px;">If you didn't create this account, please ignore this email.</p>
        """
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": "Verify your email — WingConcept",
            "html": self._wrap(body, preheader="Confirm your email to activate your WingConcept account."),
        }, "verificacion_email", email)

    async def enviar_confirmacion_orden(
        self, email: str, nombre: str, numero_orden: str, total: float, moneda: str
    ) -> bool:
        """Confirmación de orden creada."""
        body = f"""
        {self._heading(f"Thank you for your purchase, {nombre}!")}
        <p>Your order has been received and is now being processed.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
          style="margin:20px 0;background-color:{_BG2};border-radius:8px;">
          <tr>
            <td style="padding:16px 20px;">
              <p style="margin:0 0 6px;font-size:13px;color:{_INK2};">Order number</p>
              <p style="margin:0 0 14px;font-size:16px;font-weight:700;color:{_INK};">#{numero_orden}</p>
              <p style="margin:0 0 6px;font-size:13px;color:{_INK2};">Total</p>
              <p style="margin:0;font-size:16px;font-weight:700;color:{_BRAND};">{total:,.2f} {moneda}</p>
            </td>
          </tr>
        </table>
        <p>We'll notify you as soon as your order has been shipped.</p>
        """
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": f"Order confirmation #{numero_orden} — WingConcept",
            "html": self._wrap(body, preheader=f"Your order #{numero_orden} has been received."),
        }, "confirmacion_orden", email)

    async def enviar_pago_confirmado(
        self, email: str, nombre: str, numero_orden: str, proveedor: str
    ) -> bool:
        """Notifica que el pago fue procesado exitosamente."""
        body = f"""
        {self._heading(f"Payment received, {nombre}")}
        <p>Your payment for the order below was processed successfully.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
          style="margin:20px 0;background-color:{_BG2};border-radius:8px;">
          <tr>
            <td style="padding:16px 20px;">
              <p style="margin:0 0 6px;font-size:13px;color:{_INK2};">Order number</p>
              <p style="margin:0 0 14px;font-size:16px;font-weight:700;color:{_INK};">#{numero_orden}</p>
              <p style="margin:0 0 6px;font-size:13px;color:{_INK2};">Payment provider</p>
              <p style="margin:0;font-size:16px;font-weight:700;color:{_INK};">{proveedor.upper()}</p>
            </td>
          </tr>
        </table>
        <p>Your order is now being prepared.</p>
        """
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": f"Payment confirmed — Order #{numero_orden}",
            "html": self._wrap(body, preheader=f"Payment confirmed for order #{numero_orden}."),
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
        body = f"""
        {self._heading(f"Your order is on its way, {nombre}!")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
          style="margin:20px 0;background-color:{_BG2};border-radius:8px;">
          <tr>
            <td style="padding:16px 20px;">
              <p style="margin:0 0 6px;font-size:13px;color:{_INK2};">Order number</p>
              <p style="margin:0 0 14px;font-size:16px;font-weight:700;color:{_INK};">#{numero_orden}</p>
              <p style="margin:0 0 6px;font-size:13px;color:{_INK2};">Carrier</p>
              <p style="margin:0 0 14px;font-size:16px;font-weight:700;color:{_INK};">{transportadora}</p>
              <p style="margin:0 0 6px;font-size:13px;color:{_INK2};">Tracking number</p>
              <p style="margin:0;font-size:16px;font-weight:700;color:{_BRAND};">{numero_guia}</p>
            </td>
          </tr>
        </table>
        """
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": f"Your order has shipped — Order #{numero_orden}",
            "html": self._wrap(body, preheader=f"Order #{numero_orden} has shipped."),
        }, "orden_enviada", email)

    async def enviar_cupon_descuento(
        self,
        email: str,
        nombre: str,
        codigo: str,
        descuento_texto: str,
        descripcion: Optional[str] = None,
        expira_en=None,
    ) -> bool:
        """Envía un cupón de descuento personalizado al cliente."""
        expira_html = ""
        if expira_en:
            expira_html = f'<p style="margin:14px 0 0;color:{_INK2};font-size:13px;">Valid until {expira_en.strftime("%d/%m/%Y")}</p>'

        descripcion_html = ""
        if descripcion:
            descripcion_html = f'<p>{descripcion}</p>'

        body = f"""
        {self._heading(f"Hi {nombre},")}
        <p>We've assigned you an exclusive discount coupon for your next purchase:</p>
        {descripcion_html}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
          style="margin:20px 0;background-color:{_BRAND_SOFT};border:1px dashed {_BRAND};border-radius:8px;">
          <tr>
            <td align="center" style="padding:22px 20px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:800;letter-spacing:2px;color:{_BRAND};">{codigo}</p>
              <p style="margin:0;font-size:15px;font-weight:700;color:{_INK};">{descuento_texto}</p>
              {expira_html}
            </td>
          </tr>
        </table>
        <p>This coupon is <strong>single-use</strong> and linked to your account.</p>
        <p>Enter the code at checkout to redeem it.</p>
        """
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": "You have a discount coupon — WingConcept",
            "html": self._wrap(body, preheader=f"Use code {codigo} on your next order."),
        }, "cupon_descuento", email)


email_service = EmailService()
