"""
WingConcept Backend — Validadores reutilizables
"""
import html
import json
import re
from typing import Any, Dict, List, Optional

_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_HTML_TAG = re.compile(r"<[^>]*>")

CONFIGURACION_KEYS_PERMITIDAS = frozenset({
    "engine", "finish", "upgrades", "chassisType", "propeller",
    "chassisColor", "accentColor", "peripheralColor", "opciones",
})


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


def validar_monto(monto: float, moneda: str = "USD") -> Optional[str]:
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


def sanitizar_texto(texto: str, max_length: int = 500) -> str:
    """
    Limpia texto de usuario: quita HTML, caracteres de control y normaliza espacios.
    Mitiga XSS al persistir y reflejar en emails/UI.
    """
    if texto is None:
        return texto
    cleaned = _CONTROL_CHARS.sub("", str(texto))
    cleaned = _HTML_TAG.sub("", cleaned)
    cleaned = html.unescape(cleaned).strip()
    cleaned = re.sub(r"\s+", " ", cleaned)
    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length]
    return cleaned


def sanitizar_telefono(telefono: Optional[str]) -> Optional[str]:
    """Sanitiza y valida teléfono opcional."""
    if not telefono:
        return None
    cleaned = sanitizar_texto(telefono, max_length=20)
    compact = cleaned.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    if compact and not validar_telefono(compact):
        raise ValueError("Formato de teléfono inválido. Usa formato internacional, ej: +573001234567")
    return compact or None


def escapar_like(term: str) -> str:
    """Escapa comodines SQL LIKE para búsquedas seguras."""
    return (
        term.replace("\\", "\\\\")
        .replace("%", "\\%")
        .replace("_", "\\_")
    )


def sanitizar_configuracion(config: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Whitelist de claves del configurador 3D.
    Ignora totalPrice del cliente y limita tamaño/complejidad.
    """
    if not config:
        return None
    if len(json.dumps(config, default=str)) > 8000:
        raise ValueError("Configuración demasiado grande")

    result: Dict[str, Any] = {}
    for key, value in config.items():
        if key not in CONFIGURACION_KEYS_PERMITIDAS:
            continue
        if key == "upgrades" and isinstance(value, list):
            upgrades: List[str] = []
            for item in value[:30]:
                if isinstance(item, str):
                    upgrades.append(sanitizar_texto(item, max_length=80))
            result[key] = upgrades
        elif key == "opciones" and isinstance(value, dict):
            nested = sanitizar_configuracion(value)
            if nested:
                result[key] = nested
        elif isinstance(value, str):
            result[key] = sanitizar_texto(value, max_length=200)
        elif isinstance(value, (int, float, bool)):
            result[key] = value
    return result or None

