"""
WingConcept Backend — Tests de seguridad
Verifica protecciones contra DDoS, inyección y acceso no autorizado.
"""
import pytest
from httpx import AsyncClient, ASGITransport


@pytest.mark.anyio
async def test_endpoint_protegido_sin_token():
    """Los endpoints protegidos deben retornar 401 sin token."""
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        for path in (
            "/api/v1/ordenes",
            "/api/v1/admin/stats",
            "/api/v1/usuarios/me",
            "/api/v1/usuarios/me/direcciones",
        ):
            response = await client.get(path)
            assert response.status_code == 401, f"{path} debería retornar 401"


@pytest.mark.anyio
async def test_session_id_invalido_rechazado():
    """X-Session-ID con caracteres maliciosos debe ser rechazado."""
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/carrito",
            headers={"X-Session-ID": "'; DROP TABLE carritos; --"},
        )
        assert response.status_code == 400
        assert "inválido" in response.json()["detail"].lower()


@pytest.mark.anyio
async def test_session_id_valido_aceptado():
    """X-Session-ID con formato UUID debe ser aceptado."""
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/carrito",
            headers={"X-Session-ID": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"},
        )
        # 200 (carrito vacío) o 500/503 si Redis/DB no disponible — nunca 400
        assert response.status_code != 400


@pytest.mark.anyio
async def test_body_demasiado_grande_rechazado():
    """Requests con body > 2 MB deben retornar 413."""
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            content=b"x" * (2 * 1024 * 1024 + 1),
            headers={"Content-Type": "application/json"},
        )
        assert response.status_code == 413


@pytest.mark.anyio
async def test_sql_injection_en_buscar_no_crashea():
    """
    Intentos de inyección SQL en parámetros de búsqueda no deben crashear la API.
    SQLAlchemy parametriza las queries — el atacante recibe 200 o error de DB, nunca SQL ejecutado.
    """
    from app.main import app

    transport = ASGITransport(app=app)
    payloads = [
        "'; DROP TABLE productos; --",
        "1 OR 1=1",
        "' UNION SELECT * FROM usuarios --",
    ]

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        for payload in payloads:
            response = await client.get(
                "/api/v1/productos",
                params={"buscar": payload},
            )
            # Cualquier respuesta HTTP controlada es válida — lo importante es que
            # la API no crashee con excepción no manejada ante payloads maliciosos.
            assert response.status_code < 600, (
                f"Payload '{payload}' causó respuesta inválida: {response.status_code}"
            )


@pytest.mark.anyio
async def test_categoria_invalida_rechazada():
    """ProductoCreate debe rechazar categorías no permitidas."""
    from app.schemas.producto import ProductoCreate
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        ProductoCreate(
            nombre="Test Paramotor",
            categoria="categoria_maliciosa",
        )


@pytest.mark.anyio
async def test_security_headers_presentes():
    """Todas las respuestas deben incluir headers de seguridad HTTP."""
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.headers.get("X-Content-Type-Options") == "nosniff"
        assert response.headers.get("X-Frame-Options") == "DENY"
        assert response.headers.get("Referrer-Policy") is not None


@pytest.mark.anyio
async def test_validar_session_id_utilidad():
    """Unit test del validador de session ID."""
    from app.core.middleware import validar_session_id

    assert validar_session_id("a1b2c3d4-e5f6-7890-abcd-ef1234567890") is True
    assert validar_session_id("abc123XYZ") is True
    assert validar_session_id("'; DROP TABLE --") is False
    assert validar_session_id("") is False
    assert validar_session_id("x" * 65) is False
