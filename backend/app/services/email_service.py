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

    def _order_link(self, orden_id: Optional[str] = None) -> str:
        base = settings.FRONTEND_URL.rstrip("/")
        if orden_id:
            return f"{base}/orders/{orden_id}"
        return f"{base}/orders"

    def _order_box(self, rows: list[tuple[str, str]], *, highlight_last: bool = False) -> str:
        inner = ""
        for i, (label, value) in enumerate(rows):
            is_last = i == len(rows) - 1
            color = _BRAND if highlight_last and is_last else _INK
            inner += f"""
              <p style="margin:0 0 6px;font-size:13px;color:{_INK2};">{label}</p>
              <p style="margin:0 0 14px;font-size:16px;font-weight:700;color:{color};">{value}</p>"""
        return f"""
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
          style="margin:20px 0;background-color:{_BG2};border-radius:8px;">
          <tr><td style="padding:16px 20px;">{inner}</td></tr>
        </table>"""

    async def enviar_confirmacion_orden(
        self, email: str, nombre: str, numero_orden: str, total: float, moneda: str,
        orden_id: Optional[str] = None,
    ) -> bool:
        """Confirmación de orden creada (pendiente de pago)."""
        track_url = self._order_link(orden_id)
        body = f"""
        {self._heading(f"Thank you for your order, {nombre}!")}
        <p>We received your order. Complete payment to confirm it, or check status anytime in your account.</p>
        {self._order_box([
            ("Order number", f"#{numero_orden}"),
            ("Total", f"{total:,.2f} {moneda}"),
        ], highlight_last=True)}
        {self._button(track_url, "View order status")}
        <p style="color:{_INK2};font-size:13px;">We'll email you at each step: payment, preparation, shipping and delivery.</p>
        """
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": f"Order received #{numero_orden} — WingConcept",
            "html": self._wrap(body, preheader=f"Your order #{numero_orden} has been received."),
        }, "confirmacion_orden", email)

    async def enviar_pago_confirmado(
        self, email: str, nombre: str, numero_orden: str, proveedor: str,
        orden_id: Optional[str] = None,
    ) -> bool:
        """Notifica que el pago fue procesado exitosamente."""
        track_url = self._order_link(orden_id)
        body = f"""
        {self._heading(f"Payment confirmed, {nombre}")}
        <p>Your payment was processed successfully. We're preparing your order.</p>
        {self._order_box([
            ("Order number", f"#{numero_orden}"),
            ("Payment provider", proveedor.upper()),
        ])}
        {self._button(track_url, "Track your order")}
        """
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": f"Payment confirmed — Order #{numero_orden}",
            "html": self._wrap(body, preheader=f"Payment confirmed for order #{numero_orden}."),
        }, "pago_confirmado", email)

    async def enviar_orden_procesando(
        self, email: str, nombre: str, numero_orden: str, orden_id: Optional[str] = None,
    ) -> bool:
        body = f"""
        {self._heading(f"We're preparing your order, {nombre}")}
        <p>Your order is being prepared in our warehouse. We'll notify you when it ships.</p>
        {self._order_box([("Order number", f"#{numero_orden}")])}
        {self._button(self._order_link(orden_id), "View order details")}
        """
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": f"Order in preparation — #{numero_orden}",
            "html": self._wrap(body, preheader=f"Order #{numero_orden} is being prepared."),
        }, "orden_procesando", email)

    async def enviar_orden_enviada(
        self,
        email: str,
        nombre: str,
        numero_orden: str,
        numero_guia: str,
        transportadora: str,
        orden_id: Optional[str] = None,
    ) -> bool:
        """Notifica que la orden fue despachada."""
        body = f"""
        {self._heading(f"Your order is on its way, {nombre}!")}
        {self._order_box([
            ("Order number", f"#{numero_orden}"),
            ("Carrier", transportadora),
            ("Tracking number", numero_guia),
        ], highlight_last=True)}
        {self._button(self._order_link(orden_id), "View order & timeline")}
        """
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": f"Your order has shipped — #{numero_orden}",
            "html": self._wrap(body, preheader=f"Order #{numero_orden} has shipped."),
        }, "orden_enviada", email)

    async def enviar_orden_entregada(
        self, email: str, nombre: str, numero_orden: str, orden_id: Optional[str] = None,
    ) -> bool:
        body = f"""
        {self._heading(f"Order delivered, {nombre}!")}
        <p>Your order has been marked as delivered. We hope you enjoy your WingConcept gear.</p>
        {self._order_box([("Order number", f"#{numero_orden}")])}
        {self._button(self._order_link(orden_id), "View order summary")}
        <p style="color:{_INK2};font-size:13px;">Questions or issues? Reply to our contact form at wingconcept.com/contact</p>
        """
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": f"Order delivered — #{numero_orden}",
            "html": self._wrap(body, preheader=f"Order #{numero_orden} has been delivered."),
        }, "orden_entregada", email)

    async def enviar_orden_cancelada(
        self, email: str, nombre: str, numero_orden: str, orden_id: Optional[str] = None,
    ) -> bool:
        body = f"""
        {self._heading(f"Order cancelled, {nombre}")}
        <p>Your order has been cancelled. If you were charged, a refund will be processed according to our terms.</p>
        {self._order_box([("Order number", f"#{numero_orden}")])}
        {self._button(self._order_link(orden_id), "View order details")}
        """
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": f"Order cancelled — #{numero_orden}",
            "html": self._wrap(body, preheader=f"Order #{numero_orden} was cancelled."),
        }, "orden_cancelada", email)

    async def enviar_orden_reembolsada(
        self, email: str, nombre: str, numero_orden: str, orden_id: Optional[str] = None,
    ) -> bool:
        body = f"""
        {self._heading(f"Refund processed, {nombre}")}
        <p>Your order has been refunded. Depending on your bank, funds may take 5–10 business days to appear.</p>
        {self._order_box([("Order number", f"#{numero_orden}")])}
        {self._button(self._order_link(orden_id), "View order details")}
        """
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": f"Refund issued — Order #{numero_orden}",
            "html": self._wrap(body, preheader=f"Refund processed for order #{numero_orden}."),
        }, "orden_reembolsada", email)

    async def enviar_orden_error_stock(
        self, email: str, nombre: str, numero_orden: str, orden_id: Optional[str] = None,
    ) -> bool:
        body = f"""
        {self._heading(f"Update on your order, {nombre}")}
        <p>Your payment was received, but one or more items are temporarily out of stock. Our team is resolving this and will contact you shortly.</p>
        {self._order_box([("Order number", f"#{numero_orden}")])}
        {self._button(self._order_link(orden_id), "View order status")}
        <p style="color:{_INK2};font-size:13px;">No further action is required right now. We apologize for the inconvenience.</p>
        """
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": f"Stock update — Order #{numero_orden}",
            "html": self._wrap(body, preheader=f"Important update about order #{numero_orden}."),
        }, "orden_error_stock", email)

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

    async def enviar_invitacion_admin(
        self,
        email: str,
        token: str,
        frontend_url: str = "",
        invited_by: str = "WingConcept",
    ) -> bool:
        """Email con enlace para registrarse como administrador."""
        url_base = (frontend_url or settings.FRONTEND_URL).rstrip("/")
        register_url = f"{url_base}/register?invite={token}"

        body = f"""
        {self._heading("Admin invitation")}
        <p>You have been invited by <strong>{invited_by}</strong> to join WingConcept as an administrator.</p>
        <p>Create your account using the link below. The invitation expires in {settings.ADMIN_INVITE_EXPIRE_DAYS} days.</p>
        {self._button(register_url, "Create admin account")}
        <p style="color:{_INK2};font-size:13px;word-break:break-all;">
            Register with <strong>{email}</strong> — the invitation is tied to this address.
        </p>
        """
        return self._enviar({
            "from": self._from_address(),
            "to": [email],
            "subject": "WingConcept admin invitation",
            "html": self._wrap(body, preheader="You've been invited to admin WingConcept."),
        }, "invitacion_admin", email)

    def _admin_order_link(self, orden_id: str) -> str:
        return f"{settings.FRONTEND_URL.rstrip('/')}/admin/orders/{orden_id}"

    async def enviar_nueva_compra_admin(
        self,
        *,
        numero_orden: str,
        cliente_nombre: str,
        cliente_email: str,
        total: float,
        moneda: str,
        proveedor: str,
        items: list[dict],
        orden_id: str,
    ) -> bool:
        """Notifica al admin que se confirmó una compra."""
        from html import escape

        destino = settings.ADMIN_ORDER_EMAIL.strip()
        if not destino:
            logger.warning("ADMIN_ORDER_EMAIL vacío — aviso de compra no enviado")
            return False

        filas_items = ""
        for item in items:
            nombre = escape(item.get("nombre") or "Product")
            variante = escape(item.get("variante") or "")
            cantidad = item.get("cantidad") or 1
            subtotal = item.get("subtotal")
            detalle = f"{nombre}"
            if variante:
                detalle += f" ({variante})"
            if subtotal is not None:
                detalle += f" — {subtotal:,.2f} {moneda}"

            config_html = ""
            config_lines = item.get("config_summary") or []
            if config_lines:
                rows = "".join(
                    f'<li style="margin:2px 0;"><strong>{escape(line.get("label") or "")}:</strong> '
                    f'{escape(str(line.get("value") or ""))}</li>'
                    for line in config_lines
                )
                config_html = (
                    f'<ul style="margin:6px 0 0;padding-left:18px;font-size:13px;color:{_INK2};">{rows}</ul>'
                )
            elif item.get("config_text"):
                config_html = (
                    f'<p style="margin:6px 0 0;font-size:13px;color:{_INK2};">'
                    f'{escape(item.get("config_text"))}</p>'
                )

            filas_items += (
                f'<li style="margin:0 0 12px;color:{_INK};">{detalle} × {cantidad}{config_html}</li>'
            )

        items_html = (
            f'<ul style="margin:12px 0 0;padding-left:20px;">{filas_items}</ul>'
            if filas_items
            else f'<p style="color:{_INK2};font-size:13px;">No line items recorded.</p>'
        )

        admin_url = self._admin_order_link(orden_id)
        body = f"""
        {self._heading("New paid order")}
        <p>A customer completed payment on the store.</p>
        {self._order_box([
            ("Order", f"#{numero_orden}"),
            ("Customer", f"{escape(cliente_nombre)}"),
            ("Email", escape(cliente_email)),
            ("Total", f"{total:,.2f} {moneda}"),
            ("Payment", proveedor.upper()),
        ], highlight_last=False)}
        <p style="margin:16px 0 6px;font-size:13px;font-weight:700;color:{_INK};">Items</p>
        {items_html}
        {self._button(admin_url, "View in admin")}
        """
        return self._enviar({
            "from": self._from_address(),
            "to": [destino],
            "reply_to": cliente_email,
            "subject": f"New order #{numero_orden} — {total:,.2f} {moneda}",
            "html": self._wrap(body, preheader=f"New paid order #{numero_orden} from {cliente_nombre}."),
        }, "nueva_compra_admin", destino)

    async def enviar_contacto(
        self, nombre: str, email: str, asunto: str, mensaje: str
    ) -> bool:
        """Reenvía mensaje del formulario de contacto al equipo."""
        from html import escape

        destino = (settings.CONTACT_EMAIL or settings.FROM_EMAIL).strip()
        body = f"""
        {self._heading("New contact message")}
        <p><strong>From:</strong> {escape(nombre)} &lt;{escape(email)}&gt;</p>
        <p><strong>Subject:</strong> {escape(asunto)}</p>
        <p style="white-space:pre-wrap;">{escape(mensaje)}</p>
        """
        payload = {
            "from": self._from_address(),
            "to": [destino],
            "reply_to": email,
            "subject": f"[Contact] {asunto}",
            "html": self._wrap(body, preheader=f"Message from {nombre}"),
        }
        return self._enviar(payload, "contacto", destino)


email_service = EmailService()
