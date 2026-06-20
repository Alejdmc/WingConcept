"""
WingConcept Backend — Excepciones personalizadas HTTP
"""
from fastapi import HTTPException, status


class CredencialesInvalidasError(HTTPException):
    def __init__(self, detail: str = "Credenciales inválidas"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail,
                         headers={"WWW-Authenticate": "Bearer"})


class TokenExpiradoError(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED,
                         detail="Token expirado o inválido",
                         headers={"WWW-Authenticate": "Bearer"})


class PermisosDenegadosError(HTTPException):
    def __init__(self, detail: str = "No tienes permisos para realizar esta acción"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class RecursoNoEncontradoError(HTTPException):
    def __init__(self, recurso: str = "Recurso"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND,
                         detail=f"{recurso} no encontrado")


class RecursoDuplicadoError(HTTPException):
    def __init__(self, detail: str = "El recurso ya existe"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class StockInsuficienteError(HTTPException):
    def __init__(self, producto: str = ""):
        msg = f"Stock insuficiente para: {producto}" if producto else "Stock insuficiente"
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)


class PagoFallidoError(HTTPException):
    def __init__(self, detail: str = "El pago no pudo procesarse"):
        super().__init__(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=detail)


class ValidacionError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


class ServicioExternoError(HTTPException):
    def __init__(self, servicio: str, detail: str = ""):
        msg = f"Error al conectar con {servicio}"
        if detail:
            msg += f": {detail}"
        super().__init__(status_code=status.HTTP_502_BAD_GATEWAY, detail=msg)


class ServicioNoDisponibleError(HTTPException):
    """Servicio temporalmente no disponible (ej: BD aún no configurada)."""
    def __init__(self, detail: str = "Servicio temporalmente no disponible"):
        super().__init__(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail)


class EmailVerificadoRequeridoError(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Debes verificar tu email antes de realizar esta acción.",
        )

