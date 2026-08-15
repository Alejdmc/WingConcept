"""Tests de checkout Stripe: line items, descuentos e idempotencia."""
import uuid
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.exceptions import PagoFallidoError
from app.models.pago import Pago
from app.services.pago_service import _build_stripe_line_items, pago_service


def _item(precio: str, cantidad: int = 1, nombre: str = "Product"):
    return SimpleNamespace(
        precio_unitario=Decimal(precio),
        cantidad=cantidad,
        snapshot={"nombre": nombre, "variante": "Default"},
    )


def _orden(*, items, descuento="0", impuestos="0", total=None):
    subtotal = sum(float(i.precio_unitario) * i.cantidad for i in items)
    total = total if total is not None else subtotal + float(impuestos) - float(descuento)
    return SimpleNamespace(
        id=uuid.uuid4(),
        numero_orden="WC-TEST",
        moneda="USD",
        items=items,
        descuento=Decimal(descuento),
        impuestos=Decimal(impuestos),
        total=Decimal(str(total)),
    )


def test_build_stripe_line_items_applies_discount():
    orden = _orden(
        items=[_item("100"), _item("50")],
        descuento="15",
        impuestos="10",
        total="145",
    )

    line_items = _build_stripe_line_items(orden, "usd")

    assert len(line_items) == 3
    assert line_items[0]["price_data"]["unit_amount"] == 9000
    assert line_items[1]["price_data"]["unit_amount"] == 4500
    assert line_items[2]["price_data"]["unit_amount"] == 1000
    total_cents = sum(
        item["price_data"]["unit_amount"] * item["quantity"] for item in line_items
    )
    assert total_cents == 14500


def test_build_stripe_line_items_rejects_below_stripe_minimum():
    orden = _orden(items=[_item("0.25")], impuestos="0", total="0.25")

    with pytest.raises(PagoFallidoError, match="0.50"):
        _build_stripe_line_items(orden, "usd")


@pytest.mark.anyio
async def test_checkout_reuses_open_stripe_session():
    orden_id = uuid.uuid4()
    orden = SimpleNamespace(
        id=orden_id,
        numero_orden="WC-OPEN",
        moneda="USD",
        items=[_item("120")],
        descuento=Decimal("0"),
        impuestos=Decimal("0"),
        total=Decimal("120"),
    )
    pago = Pago(
        id=uuid.uuid4(),
        orden_id=orden_id,
        proveedor="stripe",
        referencia="WC-EXISTING",
        estado="pending",
        monto=Decimal("120"),
        moneda="USD",
        stripe_session_id="cs_test_open",
    )

    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = pago
    mock_db.execute = AsyncMock(return_value=mock_result)
    mock_db.flush = AsyncMock()

    mock_session = SimpleNamespace(status="open", url="https://checkout.stripe.test/open")

    with patch("app.services.pago_service.settings") as mock_settings, patch(
        "app.services.pago_service.stripe.checkout.Session.retrieve",
        return_value=mock_session,
    ) as retrieve_mock:
        mock_settings.STRIPE_SECRET_KEY = "sk_test"
        mock_settings.STRIPE_SUCCESS_URL = "https://example.com/exito"
        mock_settings.STRIPE_CANCEL_URL = "https://example.com/cancelado"

        result = await pago_service.crear_checkout_stripe(mock_db, orden)

    retrieve_mock.assert_called_once_with("cs_test_open")
    assert result.checkout_url == "https://checkout.stripe.test/open"
    assert result.referencia == "WC-EXISTING"
    mock_db.flush.assert_not_called()


@pytest.mark.anyio
async def test_checkout_updates_existing_pago_on_retry():
    orden_id = uuid.uuid4()
    orden = SimpleNamespace(
        id=orden_id,
        numero_orden="WC-RETRY",
        moneda="USD",
        items=[_item("80")],
        descuento=Decimal("0"),
        impuestos=Decimal("0"),
        total=Decimal("80"),
    )
    pago = Pago(
        id=uuid.uuid4(),
        orden_id=orden_id,
        proveedor="stripe",
        referencia="WC-OLD",
        estado="pending",
        monto=Decimal("80"),
        moneda="USD",
        stripe_session_id="cs_test_expired",
    )

    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = pago
    mock_db.execute = AsyncMock(return_value=mock_result)
    mock_db.flush = AsyncMock()
    mock_db.add = MagicMock()

    mock_session = SimpleNamespace(
        status="expired",
        id="cs_test_new",
        url="https://checkout.stripe.test/new",
    )

    with patch("app.services.pago_service.settings") as mock_settings, patch(
        "app.services.pago_service.stripe.checkout.Session.retrieve",
        return_value=mock_session,
    ), patch(
        "app.services.pago_service.stripe.checkout.Session.create",
        return_value=mock_session,
    ) as create_mock:
        mock_settings.STRIPE_SECRET_KEY = "sk_test"
        mock_settings.STRIPE_SUCCESS_URL = "https://example.com/exito"
        mock_settings.STRIPE_CANCEL_URL = "https://example.com/cancelado"

        result = await pago_service.crear_checkout_stripe(mock_db, orden)

    create_mock.assert_called_once()
    mock_db.add.assert_not_called()
    assert pago.stripe_session_id == "cs_test_new"
    assert result.checkout_url == "https://checkout.stripe.test/new"
    mock_db.flush.assert_called_once()
