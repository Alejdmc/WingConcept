"""
WingConcept Backend — Schemas de Configuración
Configurador 3D de paratrikes/paramotores
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class ConfiguracionCreate(BaseModel):
    """Schema para crear una configuración del configurador 3D."""
    producto_id: uuid.UUID
    nombre: Optional[str] = Field(None, max_length=255, description="Nombre personalizado de la configuración")
    opciones: Dict[str, Any] = Field(
        default_factory=dict,
        description="Opciones seleccionadas: motor, acabado, color, accesorios, etc."
    )
    notas: Optional[str] = Field(None, max_length=2000, description="Notas adicionales del cliente")


class ConfiguracionResponse(BaseModel):
    """Schema de respuesta con configuración completa."""
    id: uuid.UUID
    usuario_id: Optional[uuid.UUID]
    producto_id: uuid.UUID
    nombre: Optional[str]
    opciones: Dict[str, Any]
    notas: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

