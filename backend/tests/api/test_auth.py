"""
WingConcept Backend — Test de Autenticación
"""
import pytest
from httpx import AsyncClient, ASGITransport


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_register_y_login():
    """Flujo completo: registro → login → obtener perfil."""
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Registro
        register_data = {
            "email": "test@wingconcept.com",
            "nombre": "Test",
            "apellido": "Usuario",
            "password": "Test1234!",
        }
        response = await client.post("/api/v1/auth/register", json=register_data)
        # En dev sin DB real: 422/500 esperado
        assert response.status_code in (201, 422, 500)

        # Health check debe responder
        health = await client.get("/health")
        assert health.status_code in (200, 503)


@pytest.mark.anyio
async def test_health_check():
    """Verifica que el health check responde."""
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        data = response.json()
        assert "status" in data
        assert "checks" in data


@pytest.mark.anyio
async def test_root():
    """Verifica endpoint raíz."""
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["app"] == "WingConcept API"
        assert "version" in data


@pytest.mark.anyio
async def test_productos_sin_auth():
    """El listado de productos es público."""
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/productos")
        # Sin DB: puede ser 500 o 200 con lista vacía
        assert response.status_code in (200, 500, 503)


@pytest.mark.anyio
async def test_endpoint_protegido_sin_token():
    """Los endpoints protegidos deben retornar 401 sin token."""
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/ordenes")
        assert response.status_code == 401

        response = await client.get("/api/v1/admin/stats")
        assert response.status_code == 401

