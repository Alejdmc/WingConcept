"""
WingConcept Backend — Formulario de contacto público
"""
from fastapi import APIRouter, Request, status

from app.config import settings
from app.core.exceptions import PermisosDenegadosError, ServicioNoDisponibleError
from app.schemas.contact import ContactRequest, EventRegistrationRequest, QuoteRequest
from app.services.captcha_service import verify_turnstile
from app.services.email_service import email_service
from app.utils.redis_client import check_rate_limit

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("", status_code=status.HTTP_200_OK)
async def enviar_contacto(data: ContactRequest, request: Request):
    """
    Recibe mensaje del sitio y lo reenvía por email al equipo.
    Rate limit: 5 mensajes/hora por IP.
    """
    client_ip = request.client.host if request.client else "unknown"
    permitido, _ = await check_rate_limit(
        client_ip, limit=5, window_seconds=3600, prefix="rl:contact"
    )
    if not permitido:
        raise PermisosDenegadosError("Too many messages. Please try again later.")

    await verify_turnstile(data.captcha_token, client_ip)

    enviado = await email_service.enviar_contacto(
        nombre=data.nombre,
        email=data.email,
        asunto=data.asunto,
        mensaje=data.mensaje,
    )
    _exigir_envio(enviado)
    return {"message": "Message sent successfully."}


def _exigir_envio(enviado: bool) -> None:
    """Sin email enviado (Resend sin configurar o error) no se responde éxito: el usuario debe saberlo."""
    if not enviado:
        raise ServicioNoDisponibleError(
            "Could not send your message right now. Please email andres@wingconcept.com or try again later."
        )


async def _proteger(request: Request, prefix: str, captcha_token) -> None:
    client_ip = request.client.host if request.client else "unknown"
    permitido, _ = await check_rate_limit(client_ip, limit=5, window_seconds=3600, prefix=prefix)
    if not permitido:
        raise PermisosDenegadosError("Too many requests. Please try again later.")
    await verify_turnstile(captcha_token, client_ip)


@router.post("/events", status_code=status.HTTP_200_OK)
async def registrar_evento(data: EventRegistrationRequest, request: Request):
    """Registro a un evento (WC Events) → email a LEADS_EMAIL. Rate limit: 5/hora por IP."""
    await _proteger(request, "rl:events", data.captcha_token)
    enviado = await email_service.enviar_registro_evento(
        evento=data.evento,
        nombre=data.nombre,
        email=data.email,
        telefono=data.telefono,
        participantes=data.participantes,
        mensaje=data.mensaje,
    )
    _exigir_envio(enviado)
    return {"message": "Registration sent successfully."}


@router.post("/quote", status_code=status.HTTP_200_OK)
async def solicitar_cotizacion(data: QuoteRequest, request: Request):
    """Cotización desde un configurador (con fotos de lo seleccionado) → email a LEADS_EMAIL."""
    await _proteger(request, "rl:quote", data.captcha_token)
    base = settings.FRONTEND_URL.rstrip("/")
    imagenes = [u if u.startswith("http") else f"{base}{u}" for u in data.imagenes]
    enviado = await email_service.enviar_cotizacion(
        producto=data.producto,
        nombre=data.nombre,
        email=data.email,
        telefono=data.telefono,
        pais=data.pais,
        mensaje=data.mensaje,
        detalles=data.detalles,
        imagenes=imagenes,
    )
    _exigir_envio(enviado)
    return {"message": "Quote request sent successfully."}
