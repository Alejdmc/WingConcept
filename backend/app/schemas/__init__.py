"""
WingConcept Backend — Schemas Package
Exporta todos los schemas Pydantic centralizados
"""

# Auth
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    TokenResponse,
    RefreshRequest,
    RecuperarPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
)

# Usuario
from app.schemas.usuario import (
    UsuarioResponse,
    UsuarioUpdate,
    UsuarioAdminUpdate,
)

# Producto
from app.schemas.producto import (
    ProductoCreate,
    ProductoUpdate,
    ProductoResponse,
    PaginatedProductos,
    PaginatedAdminProductos,
)

# Carrito
from app.schemas.carrito import (
    AgregarItemRequest,
    ActualizarCantidadRequest,
    CarritoResponse,
    ItemCarritoResponse,
)

# Orden
from app.schemas.orden import (
    OrdenCreate,
    OrdenResponse,
    OrdenUpdate,
    PaginatedOrdenes,
    PaginatedAdminOrdenes,
    ESTADO_FRONTEND_MAP,
)

# Pago
from app.schemas.pago import (
    CheckoutRequest,
    CheckoutResponse,
    PagoResponse,
)

# Configuración
from app.schemas.configuracion import (
    ConfiguracionCreate,
    ConfiguracionResponse,
)

__all__ = [
    # Auth
    "LoginRequest",
    "LoginResponse",
    "RegisterRequest",
    "TokenResponse",
    "RefreshRequest",
    "RecuperarPasswordRequest",
    "ResetPasswordRequest",
    "VerifyEmailRequest",
    "ResendVerificationRequest",
    # Usuario
    "UsuarioResponse",
    "UsuarioUpdate",
    "UsuarioAdminUpdate",
    # Producto
    "ProductoCreate",
    "ProductoUpdate",
    "ProductoResponse",
    "PaginatedProductos",
    "PaginatedAdminProductos",
    # Carrito
    "AgregarItemRequest",
    "ActualizarCantidadRequest",
    "CarritoResponse",
    "ItemCarritoResponse",
    # Orden
    "OrdenCreate",
    "OrdenResponse",
    "OrdenUpdate",
    "PaginatedOrdenes",
    "PaginatedAdminOrdenes",
    "ESTADO_FRONTEND_MAP",
    # Pago
    "CheckoutRequest",
    "CheckoutResponse",
    "PagoResponse",
    # Configuración
    "ConfiguracionCreate",
    "ConfiguracionResponse",
]


