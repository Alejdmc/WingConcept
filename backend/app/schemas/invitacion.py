"""
WingConcept Backend — Schemas invitaciones admin
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.utils.validators import validar_email


class CrearInvitacionRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def validar_email_invitacion(cls, v: str) -> str:
        return validar_email(v)


class AcceptAdminInviteRequest(BaseModel):
    token: str = Field(..., min_length=10, max_length=200)


class InvitacionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    invited_by_id: uuid.UUID
    expires_at: datetime
    used_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    created_at: datetime
    estado: str
