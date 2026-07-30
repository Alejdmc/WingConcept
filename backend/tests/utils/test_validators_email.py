"""Tests de validación de email y URLs."""
import pytest

from app.utils.validators import (
    detectar_contenido_peligroso,
    sanitizar_nombre_archivo,
    validar_email,
    validar_url_usuario,
)


def test_validar_email_acepta_formato_valido():
    assert validar_email("User@Example.com") == "user@example.com"


def test_validar_email_rechaza_formato_invalido():
    with pytest.raises(ValueError):
        validar_email("not-an-email")


def test_validar_email_rechaza_dominio_desechable():
    with pytest.raises(ValueError):
        validar_email("test@mailinator.com")


def test_validar_url_usuario_rechaza_javascript():
    with pytest.raises(ValueError):
        validar_url_usuario("javascript:alert(1)")


def test_validar_url_usuario_acepta_ruta_relativa():
    assert validar_url_usuario("/images/front1.jpg") == "/images/front1.jpg"


def test_detectar_contenido_peligroso():
    assert detectar_contenido_peligroso("<script>alert(1)</script>") is not None
    assert detectar_contenido_peligroso("Normal product description") is None


def test_sanitizar_nombre_archivo_elimina_path_traversal():
    assert sanitizar_nombre_archivo("../../etc/passwd") == "passwd"
