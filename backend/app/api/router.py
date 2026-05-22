"""
WingConcept Backend — Router principal v1
Registra todos los routers de la API v1
"""
from fastapi import APIRouter

from app.api.v1 import auth, productos, carrito, ordenes, pagos, webhooks, configurador, admin

api_router = APIRouter()

# ── Registrar todos los routers ───────────────────────────────────────────────
api_router.include_router(auth.router)
api_router.include_router(productos.router)
api_router.include_router(carrito.router)
api_router.include_router(ordenes.router)
api_router.include_router(pagos.router)
api_router.include_router(webhooks.router)
api_router.include_router(configurador.router)
api_router.include_router(admin.router)

