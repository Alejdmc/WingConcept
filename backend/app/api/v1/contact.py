"""
WingConcept Backend — Formulario de contacto público
"""
from fastapi import APIRouter, Request, status

from app.config import settings
from app.core.exceptions import PermisosDenegadosError, ServicioNoDisponibleError
from app.schemas.contact import ContactRequest
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

    enviado = await email_service.enviar_contacto(
        nombre=data.nombre,
        email=data.email,
        asunto=data.asunto,
        mensaje=data.mensaje,
    )
    if not enviado and settings.RESEND_API_KEY:
        raise ServicioNoDisponibleError(
            "Could not send your message right now. Please try again later."
        )

    return {"message": "Message sent successfully."}
