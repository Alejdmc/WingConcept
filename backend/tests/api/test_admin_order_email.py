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
        snapshot={"nombre": "Helmet", "variante": "M / Red"},
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
    assert kwargs["items"][0]["nombre"] == "Helmet"
    assert kwargs["items"][0]["subtotal"] == 100.0
