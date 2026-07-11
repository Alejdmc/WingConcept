"""
WingConcept Backend — Tests del panel admin
Verifica protección de endpoints y contrato de respuesta con el frontend.
"""
import pytest
from httpx import ASGITransport, AsyncClient


ADMIN_PROTECTED_PATHS = (
    "/api/v1/admin/stats",
    "/api/v1/admin/productos",
    "/api/v1/admin/ordenes",
    "/api/v1/admin/usuarios",
    "/api/v1/admin/uploads/imagen",
)


@pytest.mark.anyio
async def test_admin_endpoints_requieren_token():
    """Todos los endpoints admin deben retornar 401 sin Bearer token."""
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        for path in ADMIN_PROTECTED_PATHS:
            if path.endswith("/imagen"):
                response = await client.post(path)
            else:
                response = await client.get(path)
            assert response.status_code in (401, 503), f"{path} → {response.status_code}"


def test_estado_frontend_map_cubre_panel():
    """Los estados del select del frontend deben mapearse al backend."""
    from app.schemas.orden import ESTADO_DISPLAY_MAP, ESTADO_FRONTEND_MAP

    frontend_states = [
        "Pending", "Paid", "Processing", "Shipped",
        "Delivered", "Cancelled", "Refunded", "Stock Error",
    ]
    for state in frontend_states:
        assert state in ESTADO_FRONTEND_MAP
        interno = ESTADO_FRONTEND_MAP[state]
        assert interno in ESTADO_DISPLAY_MAP
        assert ESTADO_DISPLAY_MAP[interno] == state


def test_admin_producto_response_campos_frontend():
    """AdminProductoResponse expone name/price/stock/sales como espera products/page.js."""
    import uuid

    from app.schemas.producto import AdminProductoResponse

    item = AdminProductoResponse(
        id=uuid.uuid4(),
        name="I-Pro",
        price="$5,200",
        stock=10,
        sales=3,
        activo=True,
        categoria="paramotor",
    )
    dumped = item.model_dump()
    assert dumped["name"] == "I-Pro"
    assert dumped["price"] == "$5,200"
    assert dumped["stock"] == 10
    assert dumped["sales"] == 3


def test_admin_orden_response_campos_frontend():
    """AdminOrdenResponse expone campos usados por admin/orders/page.js."""
    import uuid

    from app.schemas.orden import AdminOrdenResponse

    item = AdminOrdenResponse(
        id=uuid.uuid4(),
        numero_orden="WC-2026-1234",
        cliente_nombre="Test User",
        cliente_email="test@wingconcept.com",
        total=5200.0,
        total_formateado="$5,200",
        estado="pendiente",
        estado_display="Pending",
        fecha="2026-06-26",
        cantidad_items=2,
        moneda="USD",
    )
    dumped = item.model_dump()
    assert dumped["estado_display"] == "Pending"
    assert dumped["cliente_nombre"] == "Test User"
    assert dumped["total_formateado"] == "$5,200"
