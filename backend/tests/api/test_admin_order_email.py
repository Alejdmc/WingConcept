"""Tests de aviso admin por compra pagada."""
import uuid
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.orden_notification_service import orden_notification_service


@pytest.mark.anyio
async def test_notificar_compra_admin_envia_email():
    orden_id = uuid.uuid4()
    item = SimpleNamespace(
        cantidad=2,
        precio_unitario=Decimal("50.00"),
        snapshot={
            "nombre": "Vanguard V8",
            "variante": "Standard",
            "configuracion": {
                "engine": "moster-185",
                "chassisType": "standard",
                "upgrades": ["cruise-control", "rear-mirror"],
            },
            "config_summary": [
                {"label": "Engine", "value": "Moster 185"},
                {"label": "Chassis", "value": "Standard"},
                {"label": "Accessories", "value": "Cruise control, Rear mirror"},
            ],
        },
    )
    usuario = SimpleNamespace(nombre="Jane Doe", email="jane@example.com")
    orden = SimpleNamespace(
        id=orden_id,
        numero_orden="WC-2026-001",
        total=Decimal("100.00"),
        moneda="USD",
        usuario=usuario,
        items=[item],
    )

    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = orden
    mock_db.execute = AsyncMock(return_value=mock_result)

    with patch(
        "app.services.orden_notification_service.email_service.enviar_nueva_compra_admin",
        new_callable=AsyncMock,
        return_value=True,
    ) as send_mock:
        sent = await orden_notification_service.notificar_compra_admin(
            mock_db, orden, proveedor_pago="stripe"
        )

    assert sent is True
    send_mock.assert_awaited_once()
    kwargs = send_mock.await_args.kwargs
    assert kwargs["cliente_email"] == "jane@example.com"
    assert kwargs["numero_orden"] == "WC-2026-001"
    assert kwargs["items"][0]["nombre"] == "Vanguard V8"
    assert kwargs["items"][0]["subtotal"] == 100.0
    assert kwargs["items"][0]["config_summary"][0]["label"] == "Engine"
