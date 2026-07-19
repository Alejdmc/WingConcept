"""
WingConcept Backend — Schemas Usuario (Pydantic V2)
"""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

ROLES_VALIDOS = frozenset({"client", "admin"})

from app.utils.validators import sanitizar_texto, sanitizar_telefono


class UsuarioBase(BaseModel):
    email: EmailStr
    nombre: str = Field(..., min_length=2, max_length=100)
    apellido: str = Field(..., min_length=2, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)

    @field_validator("nombre", "apellido")
    @classmethod
    def sanitizar_nombre(cls, v: str) -> str:
        return sanitizar_texto(v, max_length=100)

    @field_validator("telefono")
    @classmethod
    def validar_tel(cls, v: Optional[str]) -> Optional[str]:
        return sanitizar_telefono(v)


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

    @field_validator("nombre", "apellido")
    @classmethod
    def sanitizar_nombre(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return sanitizar_texto(v, max_length=100)

    @field_validator("telefono")
    @classmethod
    def validar_tel(cls, v: Optional[str]) -> Optional[str]:
        return sanitizar_telefono(v)


class CambiarPasswordRequest(BaseModel):
    password_actual: str = Field(..., min_length=1)
    nueva_password: str = Field(..., min_length=8)

    @field_validator("nueva_password")
    @classmethod
    def validar_pwd(cls, v: str) -> str:
        from app.utils.validators import validar_password
        error = validar_password(v)
        if error:
            raise ValueError(error)
        return v


class UsuarioAdminUpdate(UsuarioUpdate):
    """Campos que un admin puede modificar vía PUT /admin/usuarios/{id}."""
    activo: Optional[bool] = None
    # rol se cambia solo vía PATCH /admin/usuarios/{id}/rol


class CambiarRolRequest(BaseModel):
    rol: str = Field(..., pattern="^(client|admin)$")

    @field_validator("rol")
    @classmethod
    def validar_rol(cls, v: str) -> str:
        if v not in ROLES_VALIDOS:
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

    @field_validator("nombre_destinatario")
    @classmethod
    def sanitizar_nombre_dest(cls, v: str) -> str:
        return sanitizar_texto(v, max_length=200)

    @field_validator("linea1", "linea2")
    @classmethod
    def sanitizar_linea(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return sanitizar_texto(v, max_length=300)

    @field_validator("ciudad", "departamento_estado")
    @classmethod
    def sanitizar_ciudad(cls, v: str) -> str:
        return sanitizar_texto(v, max_length=100)

    @field_validator("codigo_postal")
    @classmethod
    def sanitizar_postal(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return sanitizar_texto(v, max_length=20)

    @field_validator("pais")
    @classmethod
    def sanitizar_pais(cls, v: str) -> str:
        cleaned = sanitizar_texto(v, max_length=2).upper()
        if len(cleaned) != 2 or not cleaned.isalpha():
            raise ValueError("Código de país inválido (ISO 3166-1 alpha-2)")
        return cleaned

    @field_validator("telefono")
    @classmethod
    def validar_tel(cls, v: Optional[str]) -> Optional[str]:
        return sanitizar_telefono(v)


class DireccionEnvioResponse(DireccionEnvioCreate):
    id: uuid.UUID
    usuario_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
