"""Contacto, registro a eventos y cotizaciones → email a LEADS_EMAIL (andres@wingconcept.com)."""
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.email_service import email_service

client = TestClient(app, base_url="http://test")


@pytest.fixture(autouse=True)
def _sin_rate_limit_ni_captcha():
    with patch("app.api.v1.contact.check_rate_limit", AsyncMock(return_value=(True, 0))), \
         patch("app.api.v1.contact.verify_turnstile", AsyncMock(return_value=None)):
        yield


def _capturar():
    enviados = []

    def fake_enviar(payload, tipo, destinatario):
        enviados.append(payload)
        return True

    return enviados, patch.object(email_service, "_enviar", side_effect=fake_enviar)


def test_contacto_llega_a_andres():
    enviados, p = _capturar()
    with p:
        r = client.post("/api/v1/contact", json={"nombre": "Ana Pilot", "email": "ana@gmail.com", "asunto": "Trike info", "mensaje": "Hello, I want info about the Vanguard."})
    assert r.status_code == 200
    assert "andres@wingconcept.com" in enviados[0]["to"]
    assert enviados[0]["reply_to"] == "ana@gmail.com"


def test_registro_evento():
    enviados, p = _capturar()
    with p:
        r = client.post("/api/v1/contact/events", json={"evento": "Fly-in Utah", "nombre": "Ana Pilot", "email": "ana@gmail.com", "participantes": 2})
    assert r.status_code == 200
    assert "andres@wingconcept.com" in enviados[0]["to"]
    assert "Fly-in Utah" in enviados[0]["subject"]


def test_cotizacion_con_fotos_solo_del_sitio():
    enviados, p = _capturar()
    with p:
        r = client.post("/api/v1/contact/quote", json={
            "producto": "Vanguard V8.0", "nombre": "Ana Pilot", "email": "ana@gmail.com",
            "detalles": ["Engine: Rotax 912 — $25,000"],
            "imagenes": ["/images/engines/rotax-912-1.jpg", "https://evil.example.com/x.jpg"],
        })
    assert r.status_code == 200
    html = enviados[0]["html"]
    assert "/images/engines/rotax-912-1.jpg" in html
    assert "evil.example.com" not in html


def test_sin_envio_no_responde_exito():
    with patch.object(email_service, "_enviar", return_value=False):
        r = client.post("/api/v1/contact/events", json={"evento": "Fly-in", "nombre": "Ana Pilot", "email": "ana@gmail.com"})
    assert r.status_code == 503
