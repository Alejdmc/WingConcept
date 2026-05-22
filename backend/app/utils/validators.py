"""
WingConcept Backend — Validadores reutilizables
"""
import re
from typing import Optional


def validar_password(password: str) -> Optional[str]:
    """
    Valida que la contraseña cumpla con los requisitos mínimos.
    Retorna mensaje de error o None si es válida.
    """
    if len(password) < 8:
        return "La contraseña debe tener al menos 8 caracteres"
    if not re.search(r"[A-Z]", password):
        return "La contraseña debe contener al menos una mayúscula"
    if not re.search(r"[a-z]", password):
        return "La contraseña debe contener al menos una minúscula"
    if not re.search(r"\d", password):
        return "La contraseña debe contener al menos un número"
    return None


def validar_telefono(telefono: str) -> bool:
    """
    Valida formato de teléfono internacional básico.
    Acepta +57 (Colombia), +1 (USA/CA), +34 (España), etc.
    """
    patron = r"^\+?[1-9]\d{6,14}$"
    return bool(re.match(patron, telefono.replace(" ", "").replace("-", "")))


def sanitizar_slug(texto: str) -> str:
    """Convierte texto a slug URL-safe."""
    from slugify import slugify
    return slugify(texto, allow_unicode=False, separator="-")


def validar_monto(monto: float, moneda: str = "COP") -> Optional[str]:
    """
    Valida que el monto sea positivo y razonable.
    Retorna mensaje de error o None si es válido.
    """
    if monto <= 0:
        return "El monto debe ser mayor a 0"
    # Límites razonables por moneda
    limites = {
        "COP": 100_000_000,     # 100 millones COP
        "USD": 50_000,          # 50k USD
        "EUR": 50_000,
    }
    limite = limites.get(moneda.upper(), 1_000_000)
    if monto > limite:
        return f"El monto supera el límite permitido para {moneda}"
    return None


def es_uuid_valido(value: str) -> bool:
    """Verifica si una cadena es un UUID válido."""
    patron = r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
    return bool(re.match(patron, value.lower()))

