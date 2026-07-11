"""Test unitario de idempotencia y reembolsos en pagos Stripe (sin DB real)."""
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
        proveedor="stripe",
        referencia="WC-TEST-001",
        estado="approved",
        monto=Decimal("100.00"),
        moneda="USD",
    )
    pago.orden = MagicMock()
    pago.orden.estado = "pagado"
    pago.orden.numero_orden = "WC-TEST"

    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = pago
    mock_db.execute = AsyncMock(return_value=mock_result)

    result = await pago_service.procesar_pago_aprobado(
        mock_db,
        referencia="WC-TEST-001",
        transaction_id="tx_duplicate",
    )

    assert result.estado == "approved"


@pytest.mark.anyio
async def test_pago_reembolsado_marca_orden():
    """Un reembolso marca pago y orden como reembolsados."""
    from app.services.pago_service import pago_service

    pago = Pago(
        id=uuid.uuid4(),
        orden_id=uuid.uuid4(),
        proveedor="stripe",
        referencia="WC-REFUND-001",
        estado="approved",
        monto=Decimal("250.00"),
        moneda="USD",
        transaction_id="pi_test123",
    )
    pago.orden = MagicMock()
    pago.orden.estado = "pagado"
    pago.orden.numero_orden = "WC-REFUND"

    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = pago
    mock_db.execute = AsyncMock(return_value=mock_result)

    result = await pago_service.procesar_pago_reembolsado(
        mock_db,
        transaction_id="pi_test123",
    )

    assert result.estado == "refunded"
    assert pago.orden.estado == "reembolsado"
