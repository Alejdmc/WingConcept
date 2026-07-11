"""
WingConcept — Modelos SQLAlchemy
Importar todos aquí garantiza que SQLAlchemy resuelve todas las relaciones
(back_populates, foreign keys) sin importar el orden de carga.
"""
from app.models.usuario import Usuario          # noqa: F401
from app.models.producto import Producto        # noqa: F401
from app.models.variante import Variante        # noqa: F401
from app.models.configuracion import Configuracion  # noqa: F401
from app.models.direccion_envio import DireccionEnvio  # noqa: F401
from app.models.carrito import Carrito, ItemCarrito  # noqa: F401
from app.models.orden import Orden, ItemOrden   # noqa: F401
from app.models.pago import Pago                # noqa: F401
from app.models.contenido import Contenido      # noqa: F401
from app.models.cupon import Cupon              # noqa: F401

__all__ = [
    "Usuario",
    "Producto",
    "Variante",
    "Configuracion",
    "DireccionEnvio",
    "Carrito",
    "ItemCarrito",
    "Orden",
    "ItemOrden",
    "Pago",
    "Contenido",
    "Cupon",
]

