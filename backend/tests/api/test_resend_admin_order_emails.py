"""Tests del backfill de avisos admin para órdenes pagadas."""
import uuid
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.orden_notification_service import orden_notification_service


def _orden_pagada(*, numero: str, admin_notified: bool = False):
    pago = SimpleNamespace(
        respuesta_proveedor={"admin_notified": True} if admin_notified else {},
    )
    item = SimpleNamespace(
        cantidad=1,
        precio_unitario=Decimal("100.00"),
        snapshot={"nombre": "Vanguard V8", "variante": "Standard"},
    )
    usuario = SimpleNamespace(nombre="Jane", email="jane@example.com")
    return SimpleNamespace(
        id=uuid.uuid4(),
        numero_orden=numero,
        total=Decimal("100.00"),
        moneda="USD",
        estado="pagado",
        usuario=usuario,
        items=[item],
        pago=pago,
    )


@pytest.mark.anyio
async def test_backfill_envia_solo_no_notificadas():
    orden_nueva = _orden_pagada(numero="WC-2026-001")
    orden_ya = _orden_pagada(numero="WC-2026-002", admin_notified=True)

    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [orden_nueva, orden_ya]
    mock_db.execute = AsyncMock(return_value=mock_result)
    mock_db.commit = AsyncMock()

    with patch.object(
        orden_notification_service,
        "notificar_compra_admin",
        new_callable=AsyncMock,
        return_value=True,
    ) as notify_mock:
        summary = await orden_notification_service.reenviar_avisos_admin_ordenes_pagadas(
            mock_db, dry_run=False,
        )

    assert summary["sent"] == 1
    assert summary["skipped"] == 1
    assert summary["failed"] == 0
    notify_mock.assert_awaited_once()
    assert notify_mock.await_args.args[1].numero_orden == "WC-2026-001"
    mock_db.commit.assert_awaited_once()


@pytest.mark.anyio
async def test_backfill_dry_run_no_envia():
    orden = _orden_pagada(numero="WC-2026-003")

    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [orden]
    mock_db.execute = AsyncMock(return_value=mock_result)

    with patch.object(
        orden_notification_service,
        "notificar_compra_admin",
        new_callable=AsyncMock,
    ) as notify_mock:
        summary = await orden_notification_service.reenviar_avisos_admin_ordenes_pagadas(
            mock_db, dry_run=True,
        )

    assert summary["sent"] == 0
    assert summary["detalle"][0]["accion"] == "dry_run"
    notify_mock.assert_not_awaited()
