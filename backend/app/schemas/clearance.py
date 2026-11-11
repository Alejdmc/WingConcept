"""
WingConcept Backend — Schemas Clearance (equipo de segunda mano)
"""
import uuid
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator

from app.config import settings
from app.models.clearance import CATEGORIAS
from app.utils.validators import sanitizar_texto, validar_email, validar_telefono

MAX_IMAGENES = 10
GMAIL_DOMINIOS = ("gmail.com", "googlemail.com")

Categoria = Literal["trike", "paramotor", "paraglider", "engine", "accessory", "other"]


def clearance_image_prefix() -> str:
    """Solo se aceptan fotos subidas por /clearance/imagenes (bucket propio, carpeta clearance/)."""
    base = settings.SUPABASE_URL.rstrip("/")
    return f"{base}/storage/v1/object/public/{settings.SUPABASE_BUCKET_PRODUCTOS}/clearance/"


def _validar_imagenes(v: List[str]) -> List[str]:
    limpias = []
    prefijo = clearance_image_prefix()
    for url in v:
        url = str(url or "").strip()
        if not url:
            continue
        if not url.startswith(prefijo) or any(c in url for c in ('"', "'", "<", ">", " ")):
            raise ValueError("Las fotos deben subirse desde el formulario de Clearance")
        if url not in limpias:
            limpias.append(url)
    if len(limpias) > MAX_IMAGENES:
        raise ValueError(f"Máximo {MAX_IMAGENES} fotos")
    return limpias


def _validar_gmail(v: str) -> str:
    email = validar_email(v)
    if email.rsplit("@", 1)[-1] not in GMAIL_DOMINIOS:
        raise ValueError("El correo de contacto debe ser una cuenta de Gmail (@gmail.com)")
    return email


def _validar_tel(v: Optional[str]) -> Optional[str]:
    if v is None or not str(v).strip():
        return None
    v = sanitizar_texto(v, max_length=40)
    if not validar_telefono(v):
        raise ValueError("Teléfono inválido")
    return v


class ClearanceCreate(BaseModel):
    titulo: str = Field(..., min_length=5, max_length=150)
    descripcion: str = Field(..., min_length=20, max_length=5000)
    precio: float = Field(..., ge=0, le=1_000_000)
    categoria: Categoria = "trike"
    ubicacion: Optional[str] = Field(None, max_length=150)
    imagenes: List[str] = Field(..., min_length=1, max_length=MAX_IMAGENES)
    contacto_nombre: str = Field(..., min_length=2, max_length=120)
    contacto_email: str = Field(..., max_length=254)
    contacto_telefono: Optional[str] = Field(None, max_length=40)

    @field_validator("titulo", "contacto_nombre")
    @classmethod
    def sanitizar_cortos(cls, v: str) -> str:
        return sanitizar_texto(v, max_length=150)

    @field_validator("descripcion")
    @classmethod
    def sanitizar_descripcion(cls, v: str) -> str:
        return sanitizar_texto(v, max_length=5000)

    @field_validator("ubicacion")
    @classmethod
    def sanitizar_ubicacion(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        return sanitizar_texto(v, max_length=150)

    @field_validator("imagenes")
    @classmethod
    def validar_imagenes(cls, v: List[str]) -> List[str]:
        limpias = _validar_imagenes(v)
        if not limpias:
            raise ValueError("Agrega al menos una foto")
        return limpias

    @field_validator("contacto_email")
    @classmethod
    def validar_email_gmail(cls, v: str) -> str:
        return _validar_gmail(v)

    @field_validator("contacto_telefono")
    @classmethod
    def validar_telefono_contacto(cls, v: Optional[str]) -> Optional[str]:
        return _validar_tel(v)


class ClearanceUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=5, max_length=150)
    descripcion: Optional[str] = Field(None, min_length=20, max_length=5000)
    precio: Optional[float] = Field(None, ge=0, le=1_000_000)
    categoria: Optional[Categoria] = None
    ubicacion: Optional[str] = Field(None, max_length=150)
    imagenes: Optional[List[str]] = Field(None, min_length=1, max_length=MAX_IMAGENES)
    contacto_nombre: Optional[str] = Field(None, min_length=2, max_length=120)
    contacto_email: Optional[str] = Field(None, max_length=254)
    contacto_telefono: Optional[str] = Field(None, max_length=40)
    # El vendedor puede marcar vendido o volver a publicar; "oculto" solo lo pone el admin
    estado: Optional[Literal["activo", "vendido"]] = None

    @field_validator("titulo", "contacto_nombre")
    @classmethod
    def sanitizar_cortos(cls, v: Optional[str]) -> Optional[str]:
        return None if v is None else sanitizar_texto(v, max_length=150)

    @field_validator("descripcion")
    @classmethod
    def sanitizar_descripcion(cls, v: Optional[str]) -> Optional[str]:
        return None if v is None else sanitizar_texto(v, max_length=5000)

    @field_validator("ubicacion")
    @classmethod
    def sanitizar_ubicacion(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        return sanitizar_texto(v, max_length=150)

    @field_validator("imagenes")
    @classmethod
    def validar_imagenes(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is None:
            return v
        limpias = _validar_imagenes(v)
        if not limpias:
            raise ValueError("Agrega al menos una foto")
        return limpias

    @field_validator("contacto_email")
    @classmethod
    def validar_email_gmail(cls, v: Optional[str]) -> Optional[str]:
        return None if v is None else _validar_gmail(v)

    @field_validator("contacto_telefono")
    @classmethod
    def validar_telefono_contacto(cls, v: Optional[str]) -> Optional[str]:
        return _validar_tel(v)


class ClearanceResponse(BaseModel):
    id: uuid.UUID
    titulo: str
    descripcion: str
    precio: float
    moneda: str
    categoria: str
    ubicacion: Optional[str]
    imagenes: List[str]
    contacto_nombre: str
    contacto_email: str
    contacto_telefono: Optional[str]
    estado: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ClearanceAdminResponse(ClearanceResponse):
    usuario_id: uuid.UUID


class ClearanceEstadoAdmin(BaseModel):
    estado: Literal["activo", "vendido", "oculto"]


assert set(CATEGORIAS) == set(Categoria.__args__)  # mantener en sync con el modelo
