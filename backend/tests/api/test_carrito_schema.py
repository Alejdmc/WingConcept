"""Tests de schema carrito — no requieren base de datos."""
import uuid

import pytest
from pydantic import ValidationError

from app.schemas.carrito import AgregarItemRequest
from app.services.carrito_service import _precio_desde_configuracion


def test_agregar_item_requiere_variante_o_producto():
    with pytest.raises(ValidationError):
        AgregarItemRequest(cantidad=1)


def test_agregar_item_con_producto_id():
    pid = uuid.uuid4()
    data = AgregarItemRequest(producto_id=pid, configuracion={"engine": "rotax-912", "totalPrice": 15000})
    assert data.producto_id == pid
    assert data.configuracion["totalPrice"] == 15000


def test_precio_desde_configuracion_total_price():
    assert _precio_desde_configuracion({"totalPrice": 12000}, 5000.0) == 12000.0
    assert _precio_desde_configuracion(None, 5000.0) == 5000.0
