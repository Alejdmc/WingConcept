"""Tests de correcciones de seguridad backend (auditoría pre-producción)."""
import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.core.exceptions import ValidacionError
from app.models.webhook_event import WebhookEvent
from app.services.configurador_service import (
    CATALOGS,
    VANGUARD_PRODUCT_ID,
    configurador_service,
)
from app.services.orden_service import UPDATABLE_ORDEN_FIELDS
from app.services.webhook_service import webhook_service


def test_vanguard_precio_sin_motor():
    result = configurador_service._precio_opciones(
        CATALOGS[VANGUARD_PRODUCT_ID],
        {"engine": "no-engine", "finish": "black-matte", "upgrades": []},
    )
    assert result.desglose["motor"] == 0
    assert result.desglose["acabado"] == 0
    assert result.desglose["accesorios"] == 0


def test_vanguard_precio_con_accesorios():
    result = configurador_service._precio_opciones(
        CATALOGS[VANGUARD_PRODUCT_ID],
        {
            "engine": "rotax-912",
            "finish": "gloss-carbon",
            "upgrades": ["cruise-control", "instrument-kit"],
        },
    )
    assert result.desglose["motor"] == 15000
    assert result.desglose["acabado"] == 800
    assert result.desglose["accesorios"] == 460


def test_motor_invalido_rechazado():
    with pytest.raises(ValidacionError):
        configurador_service._precio_opciones(
            CATALOGS[VANGUARD_PRODUCT_ID],
            {"engine": "motor-falso", "finish": "black-matte", "upgrades": []},
        )


@pytest.mark.anyio
async def test_resolver_precio_carrito_ignora_totalprice_cliente():
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None
    mock_db.execute = AsyncMock(return_value=mock_result)

    precio = await configurador_service.resolver_precio_carrito(
        mock_db,
        VANGUARD_PRODUCT_ID,
        5950.0,
        {
            "engine": "no-engine",
            "finish": "black-matte",
            "upgrades": [],
            "totalPrice": 1,
        },
    )
    assert precio == 5950.0


def test_usuario_admin_update_no_incluye_rol():
    from app.schemas.usuario import UsuarioAdminUpdate

    assert "rol" not in UsuarioAdminUpdate.model_fields


def test_orden_update_whitelist():
    assert "estado" in UPDATABLE_ORDEN_FIELDS
    assert "usuario_id" not in UPDATABLE_ORDEN_FIELDS
    assert "total" not in UPDATABLE_ORDEN_FIELDS


@pytest.mark.anyio
async def test_webhook_event_duplicado_no_reprocesa():
    evento = WebhookEvent(
        id=uuid.uuid4(),
        proveedor="stripe",
        event_id="evt_test_duplicate",
        event_type="checkout.session.completed",
        payload={"data": {"object": {}}},
        procesado=True,
        intentos=1,
        procesado_at=datetime.now(timezone.utc),
    )
    mock_db = AsyncMock()
    await webhook_service.procesar_evento_stripe(mock_db, evento)
    mock_db.flush.assert_not_called()
