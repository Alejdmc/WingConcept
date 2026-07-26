"""
WingConcept Backend — Contact form schema
"""
from pydantic import BaseModel, Field, field_validator

from app.utils.validators import sanitizar_texto, validar_email


class ContactRequest(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., max_length=255)
    asunto: str = Field(..., min_length=3, max_length=200)
    mensaje: str = Field(..., min_length=10, max_length=5000)

    @field_validator("nombre", "asunto", "mensaje")
    @classmethod
    def sanitizar_campos(cls, v: str, info) -> str:
        max_len = 5000 if info.field_name == "mensaje" else (200 if info.field_name == "asunto" else 120)
        return sanitizar_texto(v, max_length=max_len)

    @field_validator("email")
    @classmethod
    def validar_email_contacto(cls, v: str) -> str:
        return validar_email(v)
