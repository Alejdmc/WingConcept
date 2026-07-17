"""
WingConcept Backend — Carrito Service
Manejo dual: usuarios autenticados (PostgreSQL) y anónimos (Redis)
"""
import logging
import uuid
import json
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import RecursoNoEncontradoError, StockInsuficienteError
from app.models.carrito import Carrito, ItemCarrito
from app.models.variante import Variante
from app.schemas.carrito import CarritoResponse, ItemCarritoResponse
from app.services.configurador_service import configurador_service
from app.utils.redis_client import carrito_delete, carrito_get, carrito_set

logger = logging.getLogger(__name__)


class CarritoService:

    @staticmethod
    def _config_key(configuracion: Optional[Dict[str, Any]]) -> Optional[str]:
        if not configuracion:
            return None
        return json.dumps(configuracion, sort_keys=True, default=str)

    @staticmethod
    def _cantidad_variante_en_carrito(
        items: List[Any],
        variante_id: UUID,
        *,
        excluir_item_id: Optional[UUID] = None,
    ) -> int:
        total = 0
        for item in items:
            vid = item.variante_id if hasattr(item, "variante_id") else item.get("variante_id")
            if str(vid) != str(variante_id):
                continue
            iid = item.id if hasattr(item, "id") else item.get("id")
            if excluir_item_id and str(iid) == str(excluir_item_id):
                continue
            qty = item.cantidad if hasattr(item, "cantidad") else item.get("cantidad", 1)
            total += int(qty)
        return total

    def _validar_stock(
        self,
        variante: Variante,
        cantidad_nueva: int,
        items_actuales: List[Any],
        *,
        excluir_item_id: Optional[UUID] = None,
    ) -> None:
        if variante.stock <= 0:
            return
        en_carrito = self._cantidad_variante_en_carrito(
            items_actuales, variante.id, excluir_item_id=excluir_item_id
        )
        if en_carrito + cantidad_nueva > variante.stock:
            raise StockInsuficienteError(variante.nombre)

    def _normalizar_item_anonimo(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Asegura tipos compatibles con ItemCarritoResponse."""
        item_id = item.get("id") or item.get("cartId")
        variante_id = item.get("variante_id")
        precio = float(item.get("precio_unitario", 0))
        cantidad = int(item.get("cantidad", 1))
        subtotal = float(item.get("subtotal", precio * cantidad))
        nombre = item.get("name") or item.get("producto_nombre") or item.get("variante_nombre") or ""
        return {
            "id": item_id,
            "variante_id": variante_id,
            "cantidad": cantidad,
            "precio_unitario": precio,
            "subtotal": subtotal,
            "variante_nombre": item.get("variante_nombre"),
            "producto_nombre": item.get("producto_nombre"),
            "producto_imagen": item.get("producto_imagen"),
            "configuracion": item.get("configuracion"),
            "cartId": item_id,
            "name": nombre,
            "price": item.get("price") or f"${precio:,.0f}",
        }

    def _carrito_anonimo_a_response(self, data: Optional[Dict[str, Any]]) -> CarritoResponse:
        if not data:
            return CarritoResponse()
        items = [self._normalizar_item_anonimo(i) for i in data.get("items", [])]
        return CarritoResponse(
            items=items,
            total=float(data.get("total", 0)),
            cantidad_items=int(data.get("cantidad_items", 0)),
        )

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

    async def _recargar_carrito(
        self, db: AsyncSession, carrito: Carrito, *, expire_items: bool = False
    ) -> Carrito:
        """Re-carga el carrito con items eager (evita lazy-load y colecciones stale)."""
        if expire_items:
            db.expire(carrito, ["items"])
        result = await db.execute(
            select(Carrito)
            .options(selectinload(Carrito.items).selectinload(ItemCarrito.variante))
            .where(Carrito.id == carrito.id)
            .execution_options(populate_existing=True)
        )
        return result.scalar_one()

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
            carrito = await self._recargar_carrito(db, carrito)
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

        precio = precio_unitario if precio_unitario is not None else float(variante.precio)
        carrito = await self.obtener_o_crear(db, usuario_id)

        config_key = self._config_key(configuracion)
        item_existente = None
        for i in carrito.items:
            if i.variante_id != variante_id:
                continue
            if self._config_key(i.configuracion) == config_key:
                item_existente = i
                break

        cantidad_final = (
            item_existente.cantidad + cantidad if item_existente else cantidad
        )
        self._validar_stock(
            variante,
            cantidad_final,
            carrito.items,
            excluir_item_id=item_existente.id if item_existente else None,
        )

        if item_existente:
            item_existente.cantidad = cantidad_final
        else:
            nuevo_item = ItemCarrito(
                carrito_id=carrito.id,
                variante_id=variante_id,
                cantidad=cantidad,
                precio_unitario=precio,
                configuracion=configuracion,
            )
            db.add(nuevo_item)

        await db.flush()
        carrito = await self._recargar_carrito(db, carrito, expire_items=True)
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
        if not variante:
            raise RecursoNoEncontradoError("Variante")

        self._validar_stock(
            variante,
            cantidad,
            carrito.items,
            excluir_item_id=item_id,
        )

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
        return self._carrito_anonimo_a_response(data)

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
        stock_disponible: Optional[int] = None,
    ) -> CarritoResponse:
        """Agrega un item al carrito anónimo en Redis."""
        data = await carrito_get(session_id)
        items = data.get("items", []) if data else []

        config_key = self._config_key(configuracion)
        item_existente = None
        for i in items:
            if i.get("variante_id") != variante_id:
                continue
            if self._config_key(i.get("configuracion")) == config_key:
                item_existente = i
                break

        cantidad_final = (
            item_existente["cantidad"] + cantidad if item_existente else cantidad
        )
        if stock_disponible is not None and stock_disponible > 0:
            en_carrito = self._cantidad_variante_en_carrito(
                items, UUID(variante_id),
                excluir_item_id=UUID(item_existente["id"]) if item_existente else None,
            )
            if en_carrito + cantidad_final > stock_disponible:
                raise StockInsuficienteError(variante_nombre or producto_nombre)

        if item_existente:
            item_existente["cantidad"] = cantidad_final
            item_existente["subtotal"] = item_existente["precio_unitario"] * cantidad_final
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
        return self._carrito_anonimo_a_response(carrito_data)

    async def limpiar_anonimo(self, session_id: str) -> None:
        """Elimina el carrito anónimo de Redis (tras login o checkout)."""
        await carrito_delete(session_id)

    async def actualizar_cantidad_anonimo(
        self, session_id: str, item_id: str, cantidad: int, stock_disponible: Optional[int] = None
    ) -> CarritoResponse:
        """Actualiza cantidad de un item en carrito anónimo."""
        data = await carrito_get(session_id)
        items = data.get("items", []) if data else []
        item = next((i for i in items if str(i.get("id")) == str(item_id)), None)
        if not item:
            raise RecursoNoEncontradoError("Item del carrito")

        if stock_disponible is not None and stock_disponible > 0:
            en_carrito = self._cantidad_variante_en_carrito(
                items, UUID(item["variante_id"]), excluir_item_id=UUID(item_id)
            )
            if en_carrito + cantidad > stock_disponible:
                raise StockInsuficienteError(item.get("name") or "Producto")

        item["cantidad"] = cantidad
        item["subtotal"] = item["precio_unitario"] * cantidad
        total = sum(i["subtotal"] for i in items)
        carrito_data = {
            "items": items,
            "total": total,
            "cantidad_items": sum(i["cantidad"] for i in items),
        }
        await carrito_set(session_id, carrito_data)
        return self._carrito_anonimo_a_response(carrito_data)

    async def eliminar_item_anonimo(self, session_id: str, item_id: str) -> CarritoResponse:
        """Elimina un item del carrito anónimo."""
        data = await carrito_get(session_id)
        items = data.get("items", []) if data else []
        items = [i for i in items if str(i.get("id")) != str(item_id)]
        if len(items) == len(data.get("items", []) if data else []):
            raise RecursoNoEncontradoError("Item del carrito")

        total = sum(i["subtotal"] for i in items)
        carrito_data = {
            "items": items,
            "total": total,
            "cantidad_items": sum(i["cantidad"] for i in items),
        }
        await carrito_set(session_id, carrito_data)
        return self._carrito_anonimo_a_response(carrito_data)

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
                if variante:
                    precio = await configurador_service.resolver_precio_carrito(
                        db,
                        variante.producto_id,
                        float(variante.precio),
                        item.get("configuracion"),
                    )
                    await self.agregar_item(
                        db,
                        usuario_id,
                        variante_id,
                        cantidad,
                        configuracion=item.get("configuracion"),
                        precio_unitario=precio,
                    )
            except Exception as e:
                logger.warning(f"Error fusionando item anónimo {item.get('variante_id')}: {e}")

        # Limpiar carrito anónimo tras fusión
        await carrito_delete(session_id)

        carrito = await self.obtener_o_crear(db, usuario_id)
        return await self._carrito_a_response(db, carrito)


carrito_service = CarritoService()

