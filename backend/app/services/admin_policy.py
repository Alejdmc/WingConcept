"""
Política de administradores — bloqueo central de nuevos admins.

Cuando ALLOW_NEW_ADMINS=false (default), ningún flujo puede asignar rol=admin.
Los admins existentes conservan acceso; solo se impide crear o promover nuevos.
"""
from app.config import settings
from app.core.exceptions import PermisosDenegadosError, RecursoNoEncontradoError, ValidacionError


def new_admins_allowed() -> bool:
    return settings.ALLOW_NEW_ADMINS


def assert_new_admins_allowed() -> None:
    if not new_admins_allowed():
        raise PermisosDenegadosError(
            "La creación de nuevos administradores está deshabilitada."
        )


def assert_invite_flow_allowed(*, hide_endpoint: bool = False) -> None:
    """Bloquea registro/login con invitación admin."""
    if new_admins_allowed():
        return
    if hide_endpoint:
        raise RecursoNoEncontradoError("Recurso")
    raise ValidacionError("Invitación inválida o expirada")


def assign_admin_role(usuario) -> None:
    """Único punto autorizado para asignar rol admin (solo si ALLOW_NEW_ADMINS=true)."""
    assert_new_admins_allowed()
    usuario.rol = "admin"
