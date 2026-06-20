"""
WingConcept Backend — Carrito Service
Manejo dual: usuarios autenticados (PostgreSQL) y anónimos (Redis)
"""
import logging
import uuid
from typing import Any, Dict, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import RecursoNoEncontradoError, StockInsuficienteError
from app.models.carrito import Carrito, ItemCarrito
from app.models.variante import Variante
from app.schemas.carrito import CarritoResponse, ItemCarritoResponse
from app.utils.redis_client import carrito_delete, carrito_get, carrito_set

logger = logging.getLogger(__name__)


def _precio_desde_configuracion(configuracion: Optional[dict], precio_variante: float) -> float:
    """Usa totalPrice del configurador 3D si viene en la configuración."""
    if not configuracion:
        return precio_variante
    for key in ("totalPrice", "total_price", "precio"):
        if key in configuracion and configuracion[key] is not None:
            return float(configuracion[key])
    return precio_variante


class CarritoService:

    async def resolver_variante(
        self,
        db: AsyncSession,
        variante_id: Optional[UUID] = None,
        producto_id: Optional[UUID] = None,
    ) -> Variante:
        """Obtiene variante por ID o la principal de un producto."""
        if variante_id:
            result = await db.execute(
                select(Variante)
                .options(selectinload(Variante.producto))
                .where(Variante.id == variante_id, Variante.activo == True)
            )
            variante = result.scalar_one_or_none()
        else:
            result = await db.execute(
                select(Variante)
                .options(selectinload(Variante.producto))
                .where(Variante.producto_id == producto_id, Variante.activo == True)
                .order_by(Variante.es_principal.desc(), Variante.created_at.asc())
            )
            variante = result.scalars().first()

        if not variante:
            raise RecursoNoEncontradoError("Variante")
        return variante

    # ── Carrito autenticado (DB) ──────────────────────────────────────────────

    async def obtener_o_crear(self, db: AsyncSession, usuario_id: UUID) -> Carrito:
        """Obtiene el carrito del usuario o lo crea si no existe."""
        result = await db.execute(
            select(Carrito)
            .options(selectinload(Carrito.items).selectinload(ItemCarrito.variante))
            .where(Carrito.usuario_id == usuario_id)
        )
        carrito = result.scalar_one_or_none()
        if not carrito:
            carrito = Carrito(usuario_id=usuario_id)
            db.add(carrito)
            await db.flush()
        return carrito

    async def agregar_item(
        self,
        db: AsyncSession,
        usuario_id: UUID,
        variante_id: UUID,
        cantidad: int,
        configuracion: Optional[Dict[str, Any]] = None,
        precio_unitario: Optional[float] = None,
    ) -> CarritoResponse:
        """Agrega o incrementa un item en el carrito del usuario autenticado."""
        variante_result = await db.execute(
            select(Variante).where(Variante.id == variante_id, Variante.activo == True)
        )
        variante = variante_result.scalar_one_or_none()
        if not variante:
            raise RecursoNoEncontradoError("Variante")
        if variante.stock < cantidad:
            raise StockInsuficienteError(variante.nombre)

        precio = precio_unitario or _precio_desde_configuracion(configuracion, float(variante.precio))
        carrito = await self.obtener_o_crear(db, usuario_id)

        # Items configurados siempre son línea nueva (misma variante, distinta config)
        item_existente = None
        if not configuracion:
            item_existente = next(
                (i for i in carrito.items if i.variante_id == variante_id and not i.configuracion),
                None,
            )

        if item_existente:
            nueva_cantidad = item_existente.cantidad + cantidad
            if variante.stock < nueva_cantidad:
                raise StockInsuficienteError(variante.nombre)
            item_existente.cantidad = nueva_cantidad
        else:
            nuevo_item = ItemCarrito(
                carrito_id=carrito.id,
                variante_id=variante_id,
                cantidad=cantidad,
                precio_unitario=precio,
                configuracion=configuracion,
            )
            db.add(nuevo_item)
            carrito.items.append(nuevo_item)

        await db.flush()
        return await self._carrito_a_response(db, carrito)

    async def actualizar_cantidad(
        self,
        db: AsyncSession,
        usuario_id: UUID,
        item_id: UUID,
        cantidad: int,
    ) -> CarritoResponse:
        """Actualiza la cantidad de un item."""
        carrito = await self.obtener_o_crear(db, usuario_id)
        item = next((i for i in carrito.items if i.id == item_id), None)
        if not item:
            raise RecursoNoEncontradoError("Item del carrito")

        variante_result = await db.execute(
            select(Variante).where(Variante.id == item.variante_id)
        )
        variante = variante_result.scalar_one_or_none()
        if variante and variante.stock < cantidad:
            raise StockInsuficienteError(variante.nombre)

        item.cantidad = cantidad
        await db.flush()
        return await self._carrito_a_response(db, carrito)

    async def eliminar_item(
        self, db: AsyncSession, usuario_id: UUID, item_id: UUID
    ) -> CarritoResponse:
        """Elimina un item del carrito."""
        carrito = await self.obtener_o_crear(db, usuario_id)
        item = next((i for i in carrito.items if i.id == item_id), None)
        if not item:
            raise RecursoNoEncontradoError("Item del carrito")

        await db.delete(item)
        carrito.items.remove(item)
        await db.flush()
        return await self._carrito_a_response(db, carrito)

    async def vaciar(self, db: AsyncSession, usuario_id: UUID) -> None:
        """Vacía completamente el carrito."""
        carrito = await self.obtener_o_crear(db, usuario_id)
        for item in carrito.items:
            await db.delete(item)
        await db.flush()

    async def _carrito_a_response(self, db: AsyncSession, carrito: Carrito) -> CarritoResponse:
        """Construye la respuesta del carrito con info de variantes y productos."""
        # Cargar variantes con productos en una sola query (evita N+1)
        variante_ids = [item.variante_id for item in carrito.items]
        variantes_map: dict = {}
        if variante_ids:
            variantes_result = await db.execute(
                select(Variante)
                .options(selectinload(Variante.producto))
                .where(Variante.id.in_(variante_ids))
            )
            variantes_map = {v.id: v for v in variantes_result.scalars().all()}

        items_response = []
        total = 0.0

        for item in carrito.items:
            variante = variantes_map.get(item.variante_id)
            producto_nombre = None
            imagen = None
            variante_nombre = variante.nombre if variante else None

            if variante and variante.producto:
                producto_nombre = variante.producto.nombre
                imagenes = variante.producto.imagenes
                imagen = imagenes[0] if imagenes else None

            subtotal = float(item.precio_unitario) * item.cantidad
            total += subtotal

            items_response.append(
                ItemCarritoResponse(
                    id=item.id,
                    variante_id=item.variante_id,
                    cantidad=item.cantidad,
                    precio_unitario=float(item.precio_unitario),
                    subtotal=subtotal,
                    variante_nombre=variante_nombre,
                    producto_nombre=producto_nombre,
                    producto_imagen=imagen,
                    cartId=item.id,
                    name=producto_nombre or variante_nombre,
                    price=f"${float(item.precio_unitario):,.0f}",
                    configuracion=item.configuracion,
                )
            )

        return CarritoResponse(
            id=carrito.id,
            items=items_response,
            total=total,
            cantidad_items=sum(i.cantidad for i in carrito.items),
        )

    # ── Carrito anónimo (Redis) ───────────────────────────────────────────────

    async def obtener_anonimo(self, session_id: str) -> CarritoResponse:
        """Obtiene el carrito anónimo desde Redis."""
        data = await carrito_get(session_id)
        return CarritoResponse(**data) if data else CarritoResponse()

    async def agregar_item_anonimo(
        self,
        session_id: str,
        variante_id: str,
        cantidad: int,
        precio: float,
        variante_nombre: str = "",
        producto_nombre: str = "",
        imagen: str = "",
        configuracion: Optional[Dict[str, Any]] = None,
    ) -> CarritoResponse:
        """Agrega un item al carrito anónimo en Redis."""
        data = await carrito_get(session_id)
        items = data.get("items", []) if data else []

        # Configuraciones distintas = líneas distintas aunque sea la misma variante
        item_existente = None
        if not configuracion:
            item_existente = next(
                (i for i in items if i["variante_id"] == variante_id and not i.get("configuracion")),
                None,
            )

        if item_existente:
            item_existente["cantidad"] += cantidad
            item_existente["subtotal"] = item_existente["precio_unitario"] * item_existente["cantidad"]
        else:
            item_id = str(uuid.uuid4())
            items.append({
                "id": item_id,
                "variante_id": variante_id,
                "cantidad": cantidad,
                "precio_unitario": precio,
                "subtotal": precio * cantidad,
                "variante_nombre": variante_nombre,
                "producto_nombre": producto_nombre,
                "producto_imagen": imagen,
                "configuracion": configuracion,
                "cartId": item_id,
                "name": producto_nombre or variante_nombre,
                "price": f"${precio:,.0f}",
            })

        total = sum(i["subtotal"] for i in items)
        carrito_data = {"items": items, "total": total, "cantidad_items": sum(i["cantidad"] for i in items)}
        await carrito_set(session_id, carrito_data)
        return CarritoResponse(**carrito_data)

    async def limpiar_anonimo(self, session_id: str) -> None:
        """Elimina el carrito anónimo de Redis (tras login o checkout)."""
        await carrito_delete(session_id)

    async def fusionar_anonimo_con_usuario(
        self, db: AsyncSession, usuario_id: UUID, session_id: str
    ) -> CarritoResponse:
        """
        Fusiona el carrito anónimo (Redis) con el del usuario autenticado (DB).
        Se llama tras el login. Los items anónimos se suman al carrito existente.
        """
        data = await carrito_get(session_id)
        items_anonimos = data.get("items", []) if data else []

        if not items_anonimos:
            carrito = await self.obtener_o_crear(db, usuario_id)
            return await self._carrito_a_response(db, carrito)

        for item in items_anonimos:
            try:
                variante_id = UUID(item["variante_id"])
                cantidad = item.get("cantidad", 1)
                # Verificar variante activa y con stock antes de fusionar
                variante_result = await db.execute(
                    select(Variante).where(Variante.id == variante_id, Variante.activo == True)
                )
                variante = variante_result.scalar_one_or_none()
                if variante and variante.stock >= cantidad:
                    await self.agregar_item(
                        db,
                        usuario_id,
                        variante_id,
                        cantidad,
                        configuracion=item.get("configuracion"),
                        precio_unitario=item.get("precio_unitario"),
                    )
            except Exception as e:
                logger.warning(f"Error fusionando item anónimo {item.get('variante_id')}: {e}")

        # Limpiar carrito anónimo tras fusión
        await carrito_delete(session_id)

        carrito = await self.obtener_o_crear(db, usuario_id)
        return await self._carrito_a_response(db, carrito)


carrito_service = CarritoService()

