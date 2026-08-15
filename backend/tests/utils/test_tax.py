from app.utils.tax import DEFAULT_TAX_RATE, CA_TAX_RATE, calcular_impuestos, get_tax_rate_from_producto


class _Producto:
    def __init__(self, contenido_extra=None):
        self.contenido_extra = contenido_extra


def test_default_tax_rate():
    assert get_tax_rate_from_producto(None) == DEFAULT_TAX_RATE
    assert get_tax_rate_from_producto(_Producto()) == DEFAULT_TAX_RATE


def test_product_tax_override():
    p = _Producto({"tax_rate": CA_TAX_RATE})
    assert get_tax_rate_from_producto(p) == CA_TAX_RATE


def test_calcular_impuestos_mixed_rates():
    lineas = [(1000.0, 0.19), (1000.0, 0.0725)]
    assert calcular_impuestos(lineas, 2000.0) == 262.5


def test_calcular_impuestos_with_discount():
    lineas = [(1000.0, 0.19), (1000.0, 0.0725)]
    assert calcular_impuestos(lineas, 2000.0, descuento=200.0) == 236.25
