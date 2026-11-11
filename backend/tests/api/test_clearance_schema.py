"""Clearance: validaciones de la publicación (Gmail obligatorio, máx. 10 fotos propias)."""
import pytest
from pydantic import ValidationError

from app.schemas.clearance import ClearanceCreate, ClearanceUpdate, clearance_image_prefix


def _body(**over):
    base = {
        "titulo": "Vanguard V7 2022 used",
        "descripcion": "Great condition, 120 hours, Rotax 582 included.",
        "precio": 9500,
        "imagenes": [f"{clearance_image_prefix()}user/a.jpg"],
        "contacto_nombre": "Owner Pilot",
        "contacto_email": "owner.pilot@gmail.com",
    }
    base.update(over)
    return base


def test_valida_publicacion_correcta():
    data = ClearanceCreate(**_body(contacto_telefono="+1 801 555 1234"))
    assert data.contacto_email == "owner.pilot@gmail.com"
    assert data.categoria == "trike"


def test_gmail_obligatorio():
    with pytest.raises(ValidationError):
        ClearanceCreate(**_body(contacto_email="owner@yahoo.com"))


def test_maximo_10_fotos():
    fotos = [f"{clearance_image_prefix()}user/{i}.jpg" for i in range(11)]
    with pytest.raises(ValidationError):
        ClearanceCreate(**_body(imagenes=fotos))


def test_rechaza_fotos_externas_y_sin_fotos():
    with pytest.raises(ValidationError):
        ClearanceCreate(**_body(imagenes=["https://evil.example.com/x.jpg"]))
    with pytest.raises(ValidationError):
        ClearanceCreate(**_body(imagenes=[]))


def test_usuario_no_puede_ocultar():
    with pytest.raises(ValidationError):
        ClearanceUpdate(estado="oculto")
    assert ClearanceUpdate(estado="vendido").estado == "vendido"
