"""Test unitario de idempotencia en procesamiento de pagos (sin DB real)."""
import uuid
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.models.pago import Pago


@pytest.mark.anyio
async def test_pago_aprobado_idempotente_no_reprocesa():
    """Si el pago ya está approved, el webhook duplicado no modifica nada."""
    from app.services.pago_service import pago_service

    pago = Pago(
        id=uuid.uuid4(),
        orden_id=uuid.uuid4(),
        proveedor="wompi",
        referencia="WC-TEST-001",
        estado="approved",
        monto=Decimal("100.00"),
        moneda="COP",
    )
    pago.orden = MagicMock()
    pago.orden.items = []

    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = pago
    mock_db.execute = AsyncMock(return_value=mock_result)

    with patch.object(pago_service, "_descontar_stock", new_callable=AsyncMock) as mock_stock:
        result = await pago_service.procesar_pago_aprobado(
            mock_db,
            referencia="WC-TEST-001",
            transaction_id="tx_duplicate",
        )

    assert result.estado == "approved"
    mock_stock.assert_not_called()
