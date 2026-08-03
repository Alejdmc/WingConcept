"""
WingConcept Backend — Schemas Auth (Pydantic V2)
"""
import uuid
from typing import Optional
from pydantic import AliasChoices, BaseModel, EmailStr, Field, field_validator
from app.utils.validators import sanitizar_texto, sanitizar_telefono, validar_email, validar_password


class CaptchaMixin(BaseModel):
    """Token opcional de Cloudflare Turnstile (requerido si TURNSTILE_SECRET_KEY está configurado)."""
    captcha_token: Optional[str] = Field(None, max_length=2048, alias="captchaToken")

    model_config = {"populate_by_name": True}


class RegisterRequest(CaptchaMixin):
    """
    Soporta tanto nombres en español (nombre/apellido) como en inglés
    (firstName/lastName) para compatibilidad con el formulario del frontend.
    """
    model_config = {"populate_by_name": True}

    email: EmailStr
    nombre: str = Field(
        ..., min_length=2, max_length=100,
        validation_alias=AliasChoices("nombre", "firstName")
    )
    apellido: str = Field(
        ..., min_length=2, max_length=100,
        validation_alias=AliasChoices("apellido", "lastName")
    )
    telefono: Optional[str] = Field(None, max_length=20)
    password: str = Field(..., min_length=8)
    invite_token: Optional[str] = Field(None, max_length=200, alias="inviteToken")

    @field_validator("email")
    @classmethod
    def validar_email_registro(cls, v: str) -> str:
        return validar_email(v)

    @field_validator("nombre", "apellido")
    @classmethod
    def sanitizar_nombre(cls, v: str) -> str:
        cleaned = sanitizar_texto(v, max_length=100)
        if len(cleaned) < 2:
            raise ValueError("Debe tener al menos 2 caracteres")
        return cleaned

    @field_validator("telefono")
    @classmethod
    def validar_tel(cls, v: Optional[str]) -> Optional[str]:
        return sanitizar_telefono(v)

    @field_validator("invite_token")
    @classmethod
    def sanitizar_invite(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        return sanitizar_texto(v.strip(), max_length=200)

    @field_validator("password")
    @classmethod
    def validar_pwd(cls, v: str) -> str:
        error = validar_password(v)
        if error:
            raise ValueError(error)
        return v


class LoginRequest(CaptchaMixin):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def validar_email_login(cls, v: str) -> str:
        return validar_email(v)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # segundos


class LoginResponse(TokenResponse):
    """Respuesta extendida de login con datos básicos del usuario.
    Evita que el frontend tenga que hacer un segundo GET /me."""
    usuario_id: uuid.UUID
    email: str
    nombre: str
    apellido: str
    rol: str
    email_verificado: bool


class RefreshRequest(BaseModel):
    refresh_token: Optional[str] = None


class RecuperarPasswordRequest(CaptchaMixin):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def validar_email_recuperar(cls, v: str) -> str:
        return validar_email(v)


class ResetPasswordRequest(BaseModel):
    token: str
    nueva_password: str = Field(..., min_length=8)

    @field_validator("nueva_password")
    @classmethod
    def validar_pwd(cls, v: str) -> str:
        error = validar_password(v)
        if error:
            raise ValueError(error)
        return v


class VerifyEmailRequest(BaseModel):
    token: str = Field(..., min_length=10)


class ResendVerificationRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def validar_email_reenvio(cls, v: str) -> str:
        return validar_email(v)

