"""
WingConcept Backend — Schemas Usuario (Pydantic V2)
"""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

ROLES_VALIDOS = frozenset({"client", "admin"})


class UsuarioBase(BaseModel):
    email: EmailStr
    nombre: str = Field(..., min_length=2, max_length=100)
    apellido: str = Field(..., min_length=2, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)


class UsuarioResponse(UsuarioBase):
    id: uuid.UUID
    rol: str
    activo: bool
    email_verificado: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=100)
    apellido: Optional[str] = Field(None, min_length=2, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)


class UsuarioAdminUpdate(UsuarioUpdate):
    """Solo administradores pueden modificar estos campos."""
    rol: Optional[str] = None
    activo: Optional[bool] = None

    @field_validator("rol")
    @classmethod
    def validar_rol(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ROLES_VALIDOS:
            raise ValueError(f"Rol '{v}' no válido. Opciones: client, admin")
        return v


class DireccionEnvioCreate(BaseModel):
    nombre_destinatario: str = Field(..., max_length=200)
    telefono: Optional[str] = Field(None, max_length=20)
    linea1: str = Field(..., max_length=300)
    linea2: Optional[str] = Field(None, max_length=300)
    ciudad: str = Field(..., max_length=100)
    departamento_estado: str = Field(..., max_length=100)
    codigo_postal: Optional[str] = Field(None, max_length=20)
    pais: str = Field("CO", max_length=2)
    es_principal: bool = False


class DireccionEnvioResponse(DireccionEnvioCreate):
    id: uuid.UUID
    usuario_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
