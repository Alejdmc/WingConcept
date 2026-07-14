"""Tests de schema carrito — no requieren base de datos."""
import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest
from pydantic import ValidationError

from app.schemas.carrito import AgregarItemRequest
from app.services.configurador_service import VANGUARD_PRODUCT_ID, configurador_service


def test_agregar_item_requiere_variante_o_producto():
    with pytest.raises(ValidationError):
        AgregarItemRequest(cantidad=1)


def test_agregar_item_con_producto_id():
    pid = uuid.uuid4()
    data = AgregarItemRequest(producto_id=pid, configuracion={"engine": "rotax-912", "totalPrice": 15000})
    assert data.producto_id == pid
    assert data.configuracion["totalPrice"] == 15000


@pytest.mark.anyio
async def test_precio_carrito_no_usa_totalprice_cliente():
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None
    mock_db.execute = AsyncMock(return_value=mock_result)

    precio = await configurador_service.resolver_precio_carrito(
        mock_db,
        VANGUARD_PRODUCT_ID,
        5950.0,
        {"engine": "no-engine", "finish": "black-matte", "upgrades": [], "totalPrice": 99},
    )
    assert precio == 5950.0
