"""
WingConcept Backend — Schemas Auth (Pydantic V2)
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.utils.validators import validar_password


class RegisterRequest(BaseModel):
    email: EmailStr
    nombre: str = Field(..., min_length=2, max_length=100)
    apellido: str = Field(..., min_length=2, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)
    password: str = Field(..., min_length=8)

    @field_validator("password")
    @classmethod
    def validar_pwd(cls, v: str) -> str:
        error = validar_password(v)
        if error:
            raise ValueError(error)
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # segundos


class RefreshRequest(BaseModel):
    refresh_token: str


class RecuperarPasswordRequest(BaseModel):
    email: EmailStr


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

