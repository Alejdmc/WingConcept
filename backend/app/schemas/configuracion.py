"""
WingConcept Backend — Schemas de Configuración
Configurador 3D de paratrikes/paramotores
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

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


class ValidarPrecioRequest(BaseModel):
    """Validación de precio del configurador (fuente autoritativa)."""
    producto_id: uuid.UUID
    engine: Optional[str] = None
    finish: Optional[str] = None
    upgrades: List[str] = Field(default_factory=list)
    opciones: Optional[Dict[str, Any]] = None

    def a_configuracion(self) -> Dict[str, Any]:
        data: Dict[str, Any] = {}
        if self.opciones:
            data.update(self.opciones)
        if self.engine is not None:
            data["engine"] = self.engine
        if self.finish is not None:
            data["finish"] = self.finish
        if self.upgrades:
            data["upgrades"] = self.upgrades
        return data


class ValidarPrecioResponse(BaseModel):
    precio_total: float
    desglose: Dict[str, float]

