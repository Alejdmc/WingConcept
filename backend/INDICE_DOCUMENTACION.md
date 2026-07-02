# 📚 ÍNDICE DE DOCUMENTACIÓN — WingConcept Backend

**Última actualización:** 1 de julio de 2026  
**Equipo:** ZomiDev

---

## 🗂️ DOCUMENTOS PRINCIPALES

### 1. **RESUMEN_EJECUTIVO.md** 📋
**Propósito:** Overview completo del sprint de mejoras  
**Audiencia:** Product Owner, Tech Lead  
**Contenido:**
- Estado del proyecto (84% completado)
- Tareas completadas P0/P1/P2
- Archivos creados/modificados
- Métricas de calidad
- Costos estimados de producción
- Checklist pre-producción

**Leer primero:** ✅ SÍ

---

### 2. **MEJORAS_SEGURIDAD.md** 🔒
**Propósito:** Detalle técnico de mejoras implementadas  
**Audiencia:** Desarrolladores, DevOps  
**Contenido:**
- Implementación de P0 (Críticas)
- Implementación de P1 (Importantes)
- Implementación de P2 (Recomendadas)
- Comparación antes/después
- Código específico modificado
- Próximos pasos técnicos

**Leer si:** Necesitas entender cambios técnicos

---

### 3. **DATABASE_SETUP.md** 🗄️
**Propósito:** Guía de configuración de base de datos  
**Audiencia:** DevOps, Backend Developers  
**Contenido:**
- Comparación Supabase vs Servidor Propio
- Setup paso a paso Supabase (15 min)
- Setup completo servidor propio (2-3 horas)
- Configuración de backups
- Recomendaciones por caso de uso

**Leer si:** Vas a configurar la base de datos

---

### 4. **ALEMBIC_SETUP.md** 🔄
**Propósito:** Explicación de migraciones con Alembic  
**Audiencia:** Backend Developers  
**Contenido:**
- Qué son las migraciones y por qué importan
- Beneficios de Alembic
- Cómo generar migración inicial
- Workflow para cambios futuros
- Comandos útiles
- Ejemplos reales

**Leer si:** Vas a trabajar con modelos/BD

---

### 5. **README.md** 📖
**Propósito:** Documentación general del backend  
**Audiencia:** Todos los desarrolladores  
**Contenido:**
- Stack tecnológico
- Setup local
- Estructura de directorios
- Endpoints disponibles
- Testing
- Deploy

**Leer primero:** ✅ SÍ (si eres nuevo en el proyecto)

---

## 📄 CONFIGURACIÓN

### 6. **.env.example** ⚙️
**Propósito:** Plantilla de variables de entorno para desarrollo  
**Audiencia:** Todos los desarrolladores  
**Contenido:**
- Variables obligatorias y opcionales
- Valores de ejemplo
- Comentarios explicativos
- Links a paneles de configuración

**Usar para:** Setup local

---

### 7. **.env.production.example** 🚀
**Propósito:** Plantilla de variables de entorno para producción  
**Audiencia:** DevOps, Tech Lead  
**Contenido:**
- Variables críticas de seguridad
- Valores de producción (no test)
- Advertencias de seguridad
- Checklist de configuración

**Usar para:** Deploy a producción

---

## 🛠️ SCRIPTS

### 8. **scripts/audit_security.sh** 🔍
**Propósito:** Auditoría automatizada de seguridad  
**Audiencia:** DevOps, Desarrolladores  
**Funcionalidad:**
- Escaneo de vulnerabilidades con Safety
- Verificación de variables críticas
- Verificación de archivos sensibles
- Reporte de CVEs

**Ejecutar:**
```bash
cd backend
bash scripts/audit_security.sh
```

---

### 9. **scripts/crear_admin.py** 👤
**Propósito:** Crear usuario administrador  
**Audiencia:** DevOps, Backend Developers  
**Funcionalidad:**
- Crea usuario con rol "admin"
- Hashea contraseña con bcrypt
- Valida fortaleza de contraseña

**Ejecutar:**
```bash
ADMIN_EMAIL=admin@wingconcept.com \
ADMIN_PASSWORD=TuPasswordSeguro123! \
python scripts/crear_admin.py
```

---

### 10. **scripts/init_migration.sh** 🔄
**Propósito:** Guía interactiva para primera migración  
**Audiencia:** Backend Developers  
**Funcionalidad:**
- Verifica configuración de .env
- Genera migración inicial
- Muestra preview antes de aplicar
- Aplica migración con confirmación

**Ejecutar:**
```bash
cd backend
bash scripts/init_migration.sh
```

---

## 🏗️ ARQUITECTURA

### 11. **app/models/** 📊
**Archivos:**
- `usuario.py` — Modelo de usuarios y perfiles
- `producto.py` — Productos y catálogo
- `variante.py` — Variantes de productos (tamaños, colores)
- `carrito.py` — Carrito de compras (autenticado y anónimo)
- `orden.py` — Órdenes y estados
- `pago.py` — Transacciones y webhooks
- `direccion_envio.py` — Direcciones de envío
- `configuracion.py` — Configuraciones del configurador 3D

**Total de tablas:** 10

---

### 12. **app/schemas/** 📝
**Archivos:**
- `auth.py` — Login, register, tokens
- `usuario.py` — Perfil de usuario
- `producto.py` — CRUD de productos
- `carrito.py` — Operaciones de carrito
- `orden.py` — Gestión de órdenes
- `pago.py` — Checkout y pagos
- `configuracion.py` — Configurador 3D
- `__init__.py` — Exports centralizados

**Total de schemas:** ~40

---

### 13. **app/api/v1/** 🌐
**Endpoints:**
- `auth.py` — Autenticación (login, register, refresh)
- `usuarios.py` — Perfil y gestión de usuarios
- `productos.py` — Catálogo público
- `carrito.py` — Carrito (autenticado + anónimo)
- `ordenes.py` — Órdenes del usuario
- `pagos.py` — Checkout y webhooks
- `admin.py` — Panel de administración
- `configurador.py` — Configurador 3D
- `uploads.py` — Subida de imágenes/modelos 3D
- `webhooks.py` — Wompi y Stripe webhooks

**Total de endpoints:** ~35

---

### 14. **app/services/** 💼
**Servicios:**
- `auth_service.py` — Lógica de autenticación
- `producto_service.py` — Lógica de productos
- `carrito_service.py` — Lógica de carrito
- `orden_service.py` — Lógica de órdenes
- `pago_service.py` — Lógica de pagos (Wompi/Stripe)
- `email_service.py` — Envío de emails (Resend)
- `storage_service.py` — Upload a Supabase Storage
- `direccion_service.py` — Gestión de direcciones

---

## 🐳 DOCKER

### 15. **docker-compose.yml** 🐋
**Propósito:** Orquestación de servicios para desarrollo  
**Servicios:**
- `backend` — FastAPI app (puerto 8000)
- `redis` — Cache y rate limiting (puerto 6379)
- `nginx` — Proxy reverso y SSL (puertos 80/443)
- `certbot` — Gestión de certificados SSL

**Ejecutar:**
```bash
docker-compose up -d
```

---

### 16. **docker/nginx/nginx.conf** ⚙️
**Propósito:** Configuración de Nginx  
**Características:**
- Rate limiting por IP
- SSL/TLS con Let's Encrypt
- Headers de seguridad
- Docs bloqueados en producción ✅

---

## 📊 TESTING

### 17. **tests/** 🧪
**Archivos:**
- `conftest.py` — Fixtures y setup
- `test_auth.py` — Tests de autenticación
- `test_carrito_schema.py` — Tests de schemas
- `test_email_verify.py` — Tests de verificación
- `test_pago_idempotencia.py` — Tests de pagos
- `test_security.py` — Tests de seguridad

**Ejecutar:**
```bash
pytest
pytest --cov=app --cov-report=html
```

---

## 🔄 MIGRACIONES

### 18. **alembic/** 🔄
**Archivos:**
- `alembic.ini` — Configuración de Alembic
- `env.py` — Environment setup (async)
- `versions/` — Archivos de migraciones

**Comandos útiles:**
```bash
# Generar migración
alembic revision --autogenerate -m "descripción"

# Ver estado
alembic current

# Aplicar migraciones
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## 📈 MONITOREO Y LOGS

### 19. **Sentry (opcional)** 🔭
**Configuración:**
```bash
# En .env
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ENVIRONMENT=production

# Instalar
pip install sentry-sdk
```

**Automáticamente captura:**
- Excepciones no manejadas
- Performance de endpoints
- Errores de BD
- Stack traces completos

---

## 🗺️ ROADMAP DE LECTURAS

### Para un nuevo desarrollador:
1. ✅ **README.md** — Entender el proyecto
2. ✅ **.env.example** — Configurar entorno local
3. ✅ **ALEMBIC_SETUP.md** — Entender migraciones
4. 📖 **app/models/** — Revisar estructura de datos
5. 📖 **app/schemas/** — Entender validaciones
6. 📖 **app/api/v1/** — Explorar endpoints

### Para configurar producción:
1. ✅ **RESUMEN_EJECUTIVO.md** — Estado general
2. ✅ **MEJORAS_SEGURIDAD.md** — Cambios aplicados
3. ✅ **DATABASE_SETUP.md** — Elegir y configurar BD
4. ✅ **.env.production.example** — Configurar variables
5. ✅ **scripts/audit_security.sh** — Ejecutar auditoría
6. 📖 **docker-compose.yml** — Deploy con Docker

### Para DevOps:
1. ✅ **DATABASE_SETUP.md** — Setup de BD
2. ✅ **docker-compose.yml** — Orquestación
3. ✅ **nginx.conf** — Configuración web server
4. ✅ **scripts/audit_security.sh** — Auditoría
5. 📖 **alembic/** — Gestión de migraciones
6. 📖 **Sentry** — Monitoreo de errores

---

## 🔗 REFERENCIAS EXTERNAS

### APIs de Terceros:
- **Wompi:** https://docs.wompi.co
- **Stripe:** https://stripe.com/docs/api
- **Resend:** https://resend.com/docs
- **Supabase:** https://supabase.com/docs

### Herramientas:
- **FastAPI:** https://fastapi.tiangolo.com
- **SQLAlchemy:** https://docs.sqlalchemy.org/en/20/
- **Alembic:** https://alembic.sqlalchemy.org/en/latest/
- **Pydantic:** https://docs.pydantic.dev/latest/
- **Sentry:** https://docs.sentry.io/platforms/python/

---

## ❓ FAQ

**Q: ¿Dónde está la documentación de endpoints?**  
A: `/docs` en desarrollo (http://localhost:8000/docs)

**Q: ¿Cómo ejecuto las migraciones?**  
A: Ver `ALEMBIC_SETUP.md` o ejecutar `scripts/init_migration.sh`

**Q: ¿Cómo creo un admin?**  
A: Ejecutar `scripts/crear_admin.py` con variables de entorno

**Q: ¿Cómo audito vulnerabilidades?**  
A: Ejecutar `scripts/audit_security.sh`

**Q: ¿Qué base de datos usar?**  
A: Ver `DATABASE_SETUP.md` para comparación detallada

**Q: ¿Cómo configuro producción?**  
A: Seguir checklist en `RESUMEN_EJECUTIVO.md`

---

**Equipo:** ZomiDev  
**Última actualización:** 1 de julio de 2026  
**Mantenedor:** [Tu nombre]

