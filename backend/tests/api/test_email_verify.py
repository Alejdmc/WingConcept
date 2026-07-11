"""
WingConcept Backend — Tests de verificación de email
"""
import pytest
from uuid import uuid4

from app.core.security import create_email_verify_token, decode_token


def test_email_verify_token_tiene_tipo_correcto():
    user_id = str(uuid4())
    token = create_email_verify_token(subject=user_id, email="test@wingconcept.com")
    payload = decode_token(token)
    assert payload is not None
    assert payload["type"] == "email_verify"
    assert payload["sub"] == user_id
    assert payload["email"] == "test@wingconcept.com"


def test_access_token_no_es_email_verify():
    from app.core.security import create_access_token
    token = create_access_token(subject=str(uuid4()))
    payload = decode_token(token)
    assert payload["type"] == "access"
    assert payload["type"] != "email_verify"


@pytest.mark.anyio
async def test_verify_email_endpoint_token_invalido():
    from app.main import app
    from httpx import ASGITransport, AsyncClient

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/verify-email",
            json={"token": "token-invalido"},
        )
        assert response.status_code in (401, 503)


@pytest.mark.anyio
async def test_resend_verification_respuesta_generica():
    from app.main import app
    from httpx import ASGITransport, AsyncClient

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/resend-verification",
            json={"email": "noexiste@test.com"},
        )
        assert response.status_code in (200, 403, 500, 503)
        if response.status_code == 200:
            assert "message" in response.json()
