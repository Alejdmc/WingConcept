# WingConcept Backend API

**E-commerce de Paramotores** | Equipo: ZomiDev

---

## Stack

| Componente | Tecnología |
|-----------|------------|
| Framework | FastAPI 0.104+ |
| Base de datos | PostgreSQL 15 (Supabase) |
| ORM | SQLAlchemy 2.0 async |
| Migraciones | Alembic |
| Caché / Rate Limit | Redis |
| Auth | JWT (python-jose + bcrypt) |
| Pagos Colombia | **Wompi** |
| Pagos Global | **Stripe** |
| Emails | **Resend** |
| Proxy / SSL | Nginx + Certbot |
| Contenedores | Docker + Docker Compose |

---

## Configuración inicial

### 1. Clonar e instalar

```bash
cd backend
pip install -r requirements.txt
```

### 2. Variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

Variables críticas a configurar:

| Variable | Dónde obtenerla |
|----------|----------------|
| `DATABASE_URL` | [Supabase](https://app.supabase.com) → Settings → Database |
| `SECRET_KEY` | `openssl rand -hex 32` |
| `WOMPI_PUBLIC_KEY` / `WOMPI_PRIVATE_KEY` | [comercios.wompi.co](https://comercios.wompi.co) |
| `WOMPI_EVENTS_SECRET` | Panel Wompi → Configuración → Webhooks |
| `STRIPE_SECRET_KEY` | [dashboard.stripe.com](https://dashboard.stripe.com) → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks |
| `RESEND_API_KEY` | [resend.com](https://resend.com/api-keys) |

### 3. Migraciones

```bash
alembic upgrade head
```

### 4. Crear admin inicial

```bash
ADMIN_EMAIL=admin@tudominio.com ADMIN_PASSWORD=MiPassword123! python scripts/crear_admin.py
```

---

## Desarrollo local

```bash
# Iniciar servidor con hot-reload
uvicorn app.main:app --reload

# Con Docker (Redis incluido):
cd ../docker
docker-compose up -d redis
uvicorn app.main:app --reload
```

Documentación interactiva: http://localhost:8000/docs

---

## Docker (producción)

```bash
cd docker
docker-compose up -d
```

### SSL (Let's Encrypt)

```bash
# Primera vez — obtener certificado:
docker-compose run --rm certbot certonly --webroot \
  -w /var/www/certbot \
  -d wingconcept.com \
  --email admin@wingconcept.com \
  --agree-tos

# Renovación automática — agregar al cron:
0 0 */60 * * cd /ruta/docker && docker-compose run --rm certbot renew
```

---

## Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Registro de usuario |
| POST | `/api/v1/auth/login` | Login → JWT tokens |
| POST | `/api/v1/auth/refresh` | Renovar access token |
| POST | `/api/v1/auth/recuperar` | Solicitar recuperación de password |
| POST | `/api/v1/auth/reset-password` | Resetear password con token |
| GET | `/api/v1/auth/me` | Perfil del usuario autenticado |

### Productos
| Método | Ruta | Auth |
|--------|------|------|
| GET | `/api/v1/productos` | Público |
| GET | `/api/v1/productos/{slug}` | Público |
| POST | `/api/v1/productos` | Admin |
| PUT | `/api/v1/productos/{id}` | Admin |
| POST | `/api/v1/productos/{id}/variantes` | Admin |

### Carrito
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/carrito` | Obtener carrito (auth o anónimo) |
| POST | `/api/v1/carrito/items` | Agregar item |
| PUT | `/api/v1/carrito/items/{id}` | Actualizar cantidad |
| DELETE | `/api/v1/carrito/items/{id}` | Eliminar item |

### Órdenes
| Método | Ruta | Auth |
|--------|------|------|
| GET | `/api/v1/ordenes` | Usuario |
| POST | `/api/v1/ordenes` | Usuario |
| GET | `/api/v1/ordenes/{id}` | Usuario/Admin |

### Pagos
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/pagos/checkout` | Iniciar pago (wompi / stripe) |
| POST | `/api/v1/webhooks/wompi` | Webhook Wompi |
| POST | `/api/v1/webhooks/stripe` | Webhook Stripe |

### Admin
| Método | Ruta |
|--------|------|
| GET | `/api/v1/admin/stats` |
| GET | `/api/v1/admin/usuarios` |
| GET | `/api/v1/admin/ordenes` |
| PUT | `/api/v1/admin/ordenes/{id}` |

---

## Pagos

### Wompi (Colombia — COP)
- Docs: https://docs.wompi.co
- Sandbox: `WOMPI_BASE_URL=https://sandbox.wompi.co/v1`
- Webhook URL: `https://tudominio.com/api/v1/webhooks/wompi`

### Stripe (Global — USD/EUR)
- Docs: https://stripe.com/docs
- Test mode: keys con prefijo `sk_test_` / `pk_test_`
- Webhook URL: `https://tudominio.com/api/v1/webhooks/stripe`
- Test local: `stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe`

---

## Tests

```bash
pytest
pytest --cov=app tests/ -v
```

---

## Migraciones Alembic

### Primera vez (generar esquema completo):
```bash
# Script automatizado
bash scripts/init_migration.sh

# Manual
alembic revision --autogenerate -m "initial_schema"
alembic upgrade head
```

### Cambios posteriores en modelos:
```bash
# Crear nueva migración cuando se modifique app/models/*.py
alembic revision --autogenerate -m "descripcion_cambio"

# Revisar el archivo generado en alembic/versions/
# Aplicar migración
alembic upgrade head

# Revertir última migración (si sale mal jeje)
alembic downgrade -1

# Ver historial de migraciones
alembic history

# Ver migración actual
alembic current
```

### Flujo completo recomendado:
1. **Modifica** un modelo en `app/models/` (ej: agregar columna)
2. **Genera** la migración: `alembic revision --autogenerate -m "add_campo_x"`
3. **Revisa** el archivo generado en `alembic/versions/` (Alembic no siempre detecta todo)
4. **Aplica** la migración: `alembic upgrade head`
5. **Commit** el archivo de migración: `git add alembic/versions/*.py`

>  **IMPORTANTE**: Nunca edites la BD manualmente si usas Alembic. Siempre genera migraciones.
>
> **Documentación completa**: `ALEMBIC_SETUP.md` explica por qué esto es crítico para producción.

