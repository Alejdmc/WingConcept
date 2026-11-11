"""
WingConcept Backend — Contact form schema
"""
import re
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.utils.validators import sanitizar_texto, validar_email


class ContactRequest(BaseModel):
    model_config = {"populate_by_name": True}

    nombre: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., max_length=255)
    asunto: str = Field(..., min_length=3, max_length=200)
    mensaje: str = Field(..., min_length=10, max_length=5000)
    captcha_token: Optional[str] = Field(None, max_length=2048, alias="captchaToken")

    @field_validator("nombre", "asunto", "mensaje")
    @classmethod
    def sanitizar_campos(cls, v: str, info) -> str:
        max_len = 5000 if info.field_name == "mensaje" else (200 if info.field_name == "asunto" else 120)
        return sanitizar_texto(v, max_length=max_len)

    @field_validator("email")
    @classmethod
    def validar_email_contacto(cls, v: str) -> str:
        return validar_email(v)


def _texto_opcional(v: Optional[str], max_length: int) -> Optional[str]:
    if v is None or not str(v).strip():
        return None
    return sanitizar_texto(v, max_length=max_length)


class _LeadBase(BaseModel):
    model_config = {"populate_by_name": True}

    nombre: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., max_length=255)
    telefono: Optional[str] = Field(None, max_length=40)
    mensaje: Optional[str] = Field(None, max_length=3000)
    captcha_token: Optional[str] = Field(None, max_length=2048, alias="captchaToken")

    @field_validator("nombre")
    @classmethod
    def sanitizar_nombre(cls, v: str) -> str:
        return sanitizar_texto(v, max_length=120)

    @field_validator("telefono")
    @classmethod
    def sanitizar_telefono(cls, v: Optional[str]) -> Optional[str]:
        return _texto_opcional(v, 40)

    @field_validator("mensaje")
    @classmethod
    def sanitizar_mensaje(cls, v: Optional[str]) -> Optional[str]:
        return _texto_opcional(v, 3000)

    @field_validator("email")
    @classmethod
    def validar_email_lead(cls, v: str) -> str:
        return validar_email(v)


class EventRegistrationRequest(_LeadBase):
    evento: str = Field(..., min_length=2, max_length=200)
    participantes: int = Field(1, ge=1, le=50)

    @field_validator("evento")
    @classmethod
    def sanitizar_evento(cls, v: str) -> str:
        return sanitizar_texto(v, max_length=200)


class QuoteRequest(_LeadBase):
    producto: str = Field(..., min_length=2, max_length=200)
    pais: Optional[str] = Field(None, max_length=80)
    detalles: list[str] = Field(default_factory=list, max_length=80)
    imagenes: list[str] = Field(default_factory=list, max_length=40)

    @field_validator("producto")
    @classmethod
    def sanitizar_producto(cls, v: str) -> str:
        return sanitizar_texto(v, max_length=200)

    @field_validator("pais")
    @classmethod
    def sanitizar_pais(cls, v: Optional[str]) -> Optional[str]:
        return _texto_opcional(v, 80)

    @field_validator("detalles")
    @classmethod
    def sanitizar_detalles(cls, v: list[str]) -> list[str]:
        return [sanitizar_texto(d, max_length=500) for d in v if d and str(d).strip()]

    @field_validator("imagenes")
    @classmethod
    def solo_imagenes_del_sitio(cls, v: list[str]) -> list[str]:
        # Solo rutas del sitio (/images/...) o https absolutas de wingconcept/supabase; se descartan las demás
        limpias = []
        for u in v:
            u = str(u or "").strip()
            if re.fullmatch(r"/images/[\w\-./%]+", u) or re.fullmatch(
                r"https://(www\.)?(wingconcept\.com|[\w-]+\.supabase\.co)/[\w\-./%]+", u
            ):
                limpias.append(u)
        return limpias[:40]
