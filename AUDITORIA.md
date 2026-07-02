# AUDITORÍA TÉCNICA INTEGRAL — WingConcept

**Fecha:** 20 de junio de 2026  
**Versión evaluada:** 1.0.0 (post-mejoras backend)  
**Clasificación:** Confidencial — Uso interno  
**Alcance:** Backend FastAPI, Frontend Next.js 15, Infraestructura Docker/Nginx, CI/CD, Seguridad, Readiness producción  
**Referencias:** Apple (confiabilidad UX), Shopify (e-commerce), Stripe (pagos y seguridad)

---

## TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura y Diseño](#2-arquitectura-y-diseño)
3. [Seguridad](#3-seguridad)
4. [Calidad de Código](#4-calidad-de-código)
5. [Testing](#5-testing)
6. [Frontend](#6-frontend)
7. [Infraestructura y DevOps](#7-infraestructura-y-devops)
8. [Funcionalidad de Negocio](#8-funcionalidad-de-negocio)
9. [Hallazgos Detallados](#9-hallazgos-detallados)
10. [Roadmap Priorizado](#10-roadmap-priorizado)
11. [Respuestas a Criterios de Excelencia](#11-respuestas-a-criterios-de-excelencia)
12. [Apéndices](#12-apéndices)

---

## 1. RESUMEN EJECUTIVO

### Estado general: 🟡 AMARILLO — No listo para producción comercial

WingConcept tiene un **backend sólido y bien estructurado**, comparable en diseño a un MVP de Shopify/Stripe: capas separadas, async end-to-end, pagos dual-gateway, carrito híbrido, snapshots de orden, y controles de seguridad recientes (rate limiting global, refresh token rotation, idempotencia de pagos). El **frontend ha avanzado** respecto a auditorías anteriores (`lib/api.js` implementado, login/register/carrito/admin parcialmente conectados), pero **aún existen brechas críticas** que impiden procesar ventas reales de forma segura.

### Top 3 fortalezas

1. **Arquitectura backend madura** — Separación API → Services → Models, SQLAlchemy 2.0 async, excepciones HTTP semánticas, caché Redis, migración Alembic inicial generada.
2. **Pagos con estándares Stripe-like** — Webhooks HMAC, idempotencia, bloqueo pesimista de stock (`SELECT FOR UPDATE`), snapshots JSONB en órdenes.
3. **Defensa en profundidad** — Rate limiting en 3 capas (Nginx + Redis auth + middleware global), headers HTTP, validación Pydantic, ORM parametrizado anti-SQLi.

### Top 3 riesgos

1. **🔴 No hay flujo de checkout funcional** — El carrito enlaza a `/checkout` que no existe; sin esto no hay ingresos.
2. **🔴 Panel admin desprotegido en frontend** — El middleware protege rutas incorrectas (`/dashboard` vs `/admin/dashboard`); tokens en `localStorage` sin cookie sincronizada.
3. **🔴 Migración Alembic no verificada en Supabase** — El archivo existe pero debe aplicarse (`alembic upgrade head`); sin BD operativa nada persiste.

### Recomendación Go/No-go

| Escenario | Veredicto |
|---|---|
| Demo interna / staging controlado | ✅ **Go condicional** (2 semanas de hardening) |
| Clientes reales con pagos | ❌ **No-go** hasta Fase 1 completa |
| 10.000 usuarios concurrentes | ❌ **No-go** — requiere load testing, observabilidad, CDN |

**Estimación para producción mínima viable:** 2–3 semanas enfocadas (1 dev full-time backend + 1 frontend).

---

## 2. ARQUITECTURA Y DISEÑO

### 2.1 Diagrama de componentes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                                │
│  Next.js 15 · React 19 · Zustand · localStorage (JWT + session_id)      │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Nginx (Docker)          Rate limit HTTP · TLS 1.2/1.3 · HSTS           │
│  :80 → :443 redirect     30 req/min API · 10 req/min auth               │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  FastAPI Backend (Docker/Uvicorn)                                        │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌────────────────┐ │
│  │ Middleware  │  │ API Routers  │  │  Services   │  │    Models      │ │
│  │ rate limit  │→ │ auth, cart,  │→ │ auth, pago, │→ │ SQLAlchemy 2.0 │ │
│  │ body 2MB    │  │ productos... │  │ orden...    │  │ 10 tablas      │ │
│  └─────────────┘  └──────────────┘  └─────────────┘  └────────────────┘ │
└───────┬─────────────────┬──────────────────────┬──────────────────────────┘
        │                 │                      │
        ▼                 ▼                      ▼
┌──────────────┐  ┌──────────────┐    ┌─────────────────────────────────┐
│ PostgreSQL   │  │ Redis 7      │    │ Servicios externos               │
│ (Supabase)   │  │ caché, RL,   │    │ Wompi · Stripe · Resend ·        │
│ managed      │  │ carrito anon │    │ Supabase Storage (imgs + 3D)     │
└──────────────┘  └──────────────┘    └─────────────────────────────────┘
```

### 2.2 Evaluación por criterio

| Criterio | Estado | Notas |
|---|---|---|
| Separación de capas | 🟢 BIEN | Routers delgados; lógica en `services/` |
| Async FastAPI | 🟢 BIEN | `AsyncSession`, `asyncpg`, pool configurado (`pool_size=10`, `max_overflow=20`) |
| Escalabilidad horizontal | 🟡 MODERADO | Stateless API; Redis y Supabase externalizados; falta load balancer config |
| Consistencia transaccional | 🟢 BIEN | `get_db()` con commit/rollback; stock con `FOR UPDATE` |
| Modelos normalizados | 🟢 BIEN | UUIDs PK, JSONB donde corresponde, FK con `ondelete` explícito |
| Timestamps timezone-aware | 🟢 BIEN | `DateTime(timezone=True)` + UTC |
| Migraciones Alembic | 🟡 MODERADO | Archivo `20260620_0001` creado; **pendiente aplicar en Supabase** |
| Dependencias circulares | 🟢 BIEN | No detectadas; imports lazy donde necesario |

### 2.3 Decisiones bien tomadas (estilo Shopify/Stripe)

- **Carrito dual:** PostgreSQL (autenticado) + Redis TTL 24h (anónimo) con fusión en login — patrón estándar e-commerce.
- **Snapshot de orden:** Integridad histórica aunque el producto cambie — requisito Shopify para disputas.
- **Soft delete productos:** Campo `activo` protege referencias en órdenes históricas.
- **Uploads 3D vía Supabase Storage:** Correcto no pasar archivos grandes por FastAPI/Docker.
- **Dual gateway:** Wompi (COP/Colombia) + Stripe (internacional) desde un servicio unificado.

### 2.4 Mejoras recomendadas

| Mejora | Esfuerzo |
|---|---|
| Aplicar y versionar migraciones en CI (ya en pipeline) | Bajo |
| Enum PostgreSQL para `rol` y `categoria` | Medio |
| Reglas de envío/impuestos en `orden_service` | Medio |
| Event-driven para emails post-pago (cola Redis/RQ) | Alto |

---

## 3. SEGURIDAD

### 3.1 Matriz de controles

| Control | Implementado | Nivel | Ubicación |
|---|---|---|---|
| JWT access 15 min | ✅ | 🟢 | `core/security.py` |
| Refresh token rotation + blacklist | ✅ | 🟢 | `auth_service.py`, `redis_client.py` |
| bcrypt passwords | ✅ | 🟢 | `core/security.py` |
| Rate limit login/registro/recuperar | ✅ | 🟢 | `api/v1/auth.py` |
| Rate limit global 120/min | ✅ | 🟢 | `core/middleware.py` |
| Rate limit Nginx | ✅ | 🟢 | `docker/nginx/nginx.conf` |
| Verificación email (backend) | ✅ | 🟢 | `POST /auth/verify-email` |
| Verificación email (frontend) | ❌ | 🔴 | Página `/verify-email` no existe |
| Roles admin/client | ✅ | 🟢 | `dependencies.py`, schemas |
| Admin API protegido | ✅ | 🟢 | `get_current_admin` |
| Admin frontend protegido | ❌ | 🔴 | `middleware.js` rutas incorrectas |
| Webhook HMAC Wompi/Stripe | ✅ | 🟢 | `webhooks.py`, `pago_service.py` |
| Idempotencia pagos | ✅ | 🟢 | `procesar_pago_aprobado()` |
| Stock race condition | ✅ | 🟢 | `SELECT FOR UPDATE` |
| SECRET_KEY validado | ✅ | 🟢 | `config.py` model_validator |
| Secretos prod obligatorios | ✅ | 🟢 | WOMPI/STRIPE webhooks en prod |
| SQL injection | ✅ | 🟢 | ORM parametrizado |
| XSS backend | ✅ | 🟢 | JSON responses, Pydantic |
| XSS frontend | ⚠️ | 🟠 | JWT en localStorage |
| CORS whitelist | ✅ | 🟢 | `ALLOWED_ORIGINS` |
| TrustedHost | ✅ | 🟢 | `TrustedHostMiddleware` |
| Body size limit 2MB | ✅ | 🟢 | `main.py` |
| X-Frame-Options | ✅ | 🟢 | FastAPI + Nginx |
| X-Content-Type-Options | ✅ | 🟢 | FastAPI + Nginx |
| HSTS | ✅ | 🟢 | Prod en FastAPI; Nginx |
| Content-Security-Policy | ❌ | 🟠 | No configurado |
| Redis password (prod) | ⚠️ | 🟡 | `docker-compose.prod.yml` listo; dev sin password |

### 3.2 Plan de remediación — críticos de seguridad

| # | Hallazgo | Acción | Esfuerzo |
|---|---|---|---|
| S1 | Admin frontend sin protección real | Corregir `middleware.js`: matcher `/admin/:path*`, sincronizar cookie httponly en login | Bajo |
| S2 | JWT en localStorage | Migrar a httpOnly cookie + `credentials: 'include'` en `api.js` | Medio |
| S3 | Sin CSP | Añadir header en Nginx para scripts Stripe/Wompi | Medio |
| S4 | Email no verificado puede comprar | Opcional: bloquear `POST /ordenes` si `!email_verificado` | Bajo |

### 3.3 Escenarios de ataque

**DDoS:** Mitigación parcial. Nginx (30r/m) + Redis global (120r/m) + body limit. Sin WAF/CDN (Cloudflare), un ataque volumétrico L3/L4 agotaría el servidor. **Recomendación:** Cloudflare delante de Nginx.

**SQL Injection:** Riesgo **bajo**. SQLAlchemy parametriza queries; búsquedas usan `.ilike(f"%{buscar}%")` — seguro con ORM. Tests en `test_security.py` validan payloads maliciosos.

**Robo de refresh token:** Mitigado con rotation + blacklist Redis (`jti`). Reuso detectado y rechazado.

**Webhook falso:** Mitigado en prod (HMAC obligatorio). En dev sin secret, webhooks aceptan sin firma — correcto solo para sandbox local.

---

## 4. CALIDAD DE CÓDIGO

### 4.1 Fortalezas

- Nombres descriptivos en español para dominio de negocio
- Type hints consistentes en Python
- Docstrings en servicios y endpoints
- Pydantic V2 con validadores (`categorías`, `roles`, passwords)
- Logging estructurado sin query params sensibles (`request.url.path`)

### 4.2 Deuda técnica

| ID | Problema | Severidad | Ubicación | Esfuerzo |
|---|---|---|---|---|
| DT1 | `models/base.py` duplicado, no usado | 🟡 | `models/base.py` vs `database.py` | Bajo |
| DT2 | `cartStore.js` incompleto y sin uso real | 🟡 | `store/cartStore.js` | Bajo |
| DT3 | Schemas configurador en `schemas/pago.py` | 🟡 | `schemas/pago.py` | Bajo |
| DT4 | `useCart.addConfiguredProduct` payload incompatible con API | 🟠 | `hooks/useCart.js` — envía `producto_id`, API exige `variante_id` | Medio |
| DT5 | Sin refresh automático de access token en frontend | 🟠 | `lib/api.js` | Medio |
| DT6 | Impuestos/envío hardcodeados a 0 | 🟠 | `orden_service.py` | Medio |

### 4.3 Dependencias

- Versiones mayoritariamente fijadas en `requirements.txt` ✅
- Algunas con `>=` (sqlalchemy, asyncpg) — riesgo de divergencia entre entornos 🟡
- Sin escaneo automatizado de vulnerabilidades (Dependabot/Snyk) 🟠

---

## 5. TESTING

### 5.1 Cobertura actual

| Tipo | Archivos | Tests | Estado |
|---|---|---|---|
| Auth básico | `test_auth.py` | 6 | ⚠️ Parcial — tolera 500 sin DB |
| Seguridad | `test_security.py` | 8 | 🟢 Session ID, body limit, headers, SQLi |
| Email verify | `test_email_verify.py` | 4 | 🟢 Token JWT + endpoints |
| Integración DB | — | 0 | ❌ |
| Pagos/webhooks | — | 0 | ❌ |
| E2E | — | 0 | ❌ |

**Total:** ~18 tests, **~15 pasan en CI** con PostgreSQL + Redis.

### 5.2 Ambiente de testing

| Componente | Estado |
|---|---|
| PostgreSQL test (CI) | ✅ GitHub Actions service |
| Redis test (CI) | ✅ GitHub Actions service |
| Alembic en CI | ✅ `alembic upgrade head` |
| Mocks Wompi/Stripe | ❌ |
| Fixtures de datos | ❌ |
| Coverage report | ❌ |

### 5.3 Casos críticos faltantes

1. Flujo completo registro → verificar email → login → carrito → orden → webhook → stock
2. Webhook duplicado (idempotencia) con mock
3. Compra concurrente mismo SKU (race condition)
4. Refresh token rotation (reuso rechazado)
5. Admin CRUD productos con auth

---

## 6. FRONTEND

### 6.1 Estado de integración API

| Componente | Conectado | Archivo |
|---|---|---|
| `lib/api.js` | ✅ | Cliente centralizado con Bearer + X-Session-ID |
| Login | ✅ | `app/(auth)/login/page.js` |
| Register | ✅ | `app/(auth)/register/page.js` |
| Forgot/Reset password | ✅ | `forgot-password`, `reset-password` |
| Carrito (hook) | ✅ | `hooks/useCart.js` → API backend |
| Productos destacados | ✅ | `FeaturedProducts.jsx` |
| Admin dashboard | ✅ | `admin/dashboard/page.js` |
| Admin productos | ✅ | `admin/products/page.js` |
| Admin órdenes | ✅ | `admin/orders/page.js` |
| Refresh token auto | ❌ | No implementado |
| AuthContext global | ❌ | Solo localStorage |
| Checkout | ❌ | Link a `/checkout` → 404 |
| Verify email | ❌ | Backend envía link; página no existe |
| Perfil / mis órdenes | ❌ | Sin rutas |
| Configurador → API | ❌ | Datos hardcoded; carrito mal formado |

### 6.2 Problema crítico: middleware admin

```javascript
// frontend/middleware.js — INCORRECTO
const adminPaths = ['/dashboard', '/products', '/orders']
matcher: ['/dashboard/:path*', '/products/:path*', '/orders/:path*']

// Rutas reales del admin:
// /admin/dashboard, /admin/products, /admin/orders
```

**Impacto:** Cualquier usuario puede acceder al panel admin en el navegador. La API rechazará requests sin token admin, pero la UI y datos en tránsito quedan expuestos.

**Además:** Login guarda token en `localStorage` pero middleware lee `cookies.access_token`. El backend sí setea cookie httponly en login, pero el fetch del frontend no usa `credentials: 'include'`, por lo que la cookie puede no persistir cross-origin.

### 6.3 Páginas y rutas

| Ruta | Estado |
|---|---|
| `/` | ✅ Landing |
| `/cart` | ✅ Conectado API |
| `/checkout` | ❌ No existe |
| `/verify-email` | ❌ No existe |
| `/login`, `/register` | ✅ |
| `/admin/*` | ⚠️ UI sí; protección no |
| `/shows`, `/events`, `/dealers`, `/manuals`, `/schools`, `/about`, `/milestones`, `/contact` | ❌ 404 |
| `/paramotors` | ⚠️ Parcial (`Catalog.js` no usado en routing principal) |

### 6.4 Performance frontend

- `next/image` usado en componentes clave ✅
- Sin análisis de bundle size documentado 🟡
- Zustand store duplicado e incompleto vs `useCart` 🟡

---

## 7. INFRAESTRUCTURA Y DEVOPS

### 7.1 CI/CD

| Pipeline | Estado |
|---|---|
| Backend CI (`.github/workflows/backend-ci.yml`) | ✅ Lint + migrate + pytest + Docker build |
| Frontend CI | ❌ No existe |
| Deploy automático | ❌ |
| Secrets en GitHub Actions | ⚠️ Solo env vars de test en workflow |

### 7.2 Docker

| Archivo | Propósito | Estado |
|---|---|---|
| `backend/Dockerfile` | Python 3.11, non-root user, healthcheck | ✅ |
| `docker/docker-compose.yml` | Dev con `--reload` | ✅ |
| `docker/docker-compose.prod.yml` | 4 workers, Redis password, sin volumes | ✅ |
| Nginx + Certbot | SSL, rate limit, security headers | ✅ (CSP pendiente) |

### 7.3 Observabilidad

| Capacidad | Estado |
|---|---|
| Logs estructurados | ✅ stdout |
| Sentry / Datadog | ❌ |
| Alertas pagos fallidos | ❌ |
| APM / tracing | ❌ |
| Health check `/health` | ✅ DB + Redis |

### 7.4 Backup y DR

| Aspecto | Estado |
|---|---|
| Backup Supabase (managed) | ⚠️ Depende del plan Supabase |
| Procedimiento restore documentado | ❌ |
| Redis persistence | ⚠️ RDB snapshots en Docker |
| Load testing | ❌ |

---

## 8. FUNCIONALIDAD DE NEGOCIO

### 8.1 Matriz funcional

| Módulo | Backend | Frontend | Producción |
|---|---|---|---|
| Catálogo + variantes | ✅ | ⚠️ Parcial | 🟡 |
| Búsqueda/filtros | ✅ API | ❌ UI | 🟡 |
| Carrito dual + merge | ✅ | ✅ | 🟢 |
| Checkout Wompi | ✅ API | ❌ | 🔴 |
| Checkout Stripe | ✅ API | ❌ | 🔴 |
| Emails confirmación | ✅ Resend | N/A | 🟡 (requiere dominio DNS) |
| Órdenes + tracking | ✅ | ❌ cliente | 🟡 |
| Direcciones CRUD | ✅ | ❌ | 🟡 |
| Verificación email | ✅ backend | ❌ frontend | 🟡 |
| Admin stats/productos/órdenes | ✅ | ⚠️ sin guard admin | 🟡 |
| Upload imágenes/3D | ✅ Supabase | ❌ UI admin | 🟡 |
| Configurador 3D | ✅ guardar config | ⚠️ mock local | 🟡 |

---

## 9. HALLAZGOS DETALLADOS

### 🔴 CRÍTICOS

#### C1 — Checkout inexistente
- **Descripción:** `cart/page.js` enlaza a `/checkout` que no está implementado.
- **Impacto:** Imposible completar compra; pérdida total de conversión.
- **Ubicación:** `frontend/app/cart/page.js:43`
- **Recomendación:** Crear flujo checkout: dirección → resumen → `POST /ordenes` → `POST /pagos/checkout`.
- **Esfuerzo:** Alto (3–5 días)

#### C2 — Panel admin frontend desprotegido
- **Descripción:** Middleware protege `/dashboard` pero rutas reales son `/admin/*`.
- **Impacto:** UI administrativa accesible sin autenticación; riesgo reputacional y de información.
- **Ubicación:** `frontend/middleware.js:3-39`
- **Recomendación:** Cambiar matcher a `/admin/:path*`, sincronizar auth cookie + localStorage.
- **Esfuerzo:** Bajo (2–4 horas)

#### C3 — Migración Alembic pendiente de aplicar
- **Descripción:** Existe `alembic/versions/20260620_0001_inicial_esquema_completo.py` pero no hay evidencia de aplicación en Supabase.
- **Impacto:** BD vacía o inconsistente; errores 500 en runtime.
- **Ubicación:** `backend/alembic/versions/`
- **Recomendación:** `cd backend && alembic upgrade head` contra Supabase; verificar 10 tablas.
- **Esfuerzo:** Bajo (1 hora)

#### C4 — Configurador envía payload inválido al carrito
- **Descripción:** `addConfiguredProduct` envía `producto_id: 1` y `configuracion`; API exige `variante_id: UUID`.
- **Impacto:** Configurador paratrike no puede agregar al carrito real.
- **Ubicación:** `frontend/hooks/useCart.js:51-63`, `backend/schemas/carrito.py:11-13`
- **Recomendación:** Crear variante "configurable" en seed o endpoint dedicado configurador→carrito.
- **Esfuerzo:** Medio (1–2 días)

### 🟠 IMPORTANTES

#### I1 — Sin refresh automático de JWT
- **Descripción:** Access token expira en 15 min; `api.js` no intercepta 401 para refresh.
- **Impacto:** Sesiones cortadas abruptamente; mala UX tipo Shopify.
- **Ubicación:** `frontend/lib/api.js`
- **Recomendación:** Interceptor: 401 → `POST /auth/refresh` → reintentar request.
- **Esfuerzo:** Medio

#### I2 — JWT en localStorage (XSS)
- **Descripción:** Tokens accesibles desde JavaScript.
- **Impacto:** Un XSS roba sesión completa (estándar OWASP).
- **Ubicación:** `frontend/lib/api.js:26`, `login/page.js:29-31`
- **Recomendación:** httpOnly cookie + SameSite=Lax; eliminar localStorage para tokens.
- **Esfuerzo:** Medio

#### I3 — Sin observabilidad (Sentry)
- **Descripción:** Errores de pago/stock críticos solo en logs stdout.
- **Impacto:** Fallos silenciosos en producción; imposible responder como Stripe ops.
- **Recomendación:** `sentry-sdk[fastapi]` + alertas Slack/email.
- **Esfuerzo:** Bajo

#### I4 — Impuestos y envío en cero
- **Descripción:** `total = subtotal` sin cálculo fiscal/logístico.
- **Impacto:** Incumplimiento fiscal Colombia; pérdida en envíos internacionales.
- **Ubicación:** `backend/app/services/orden_service.py:111`
- **Recomendación:** Tabla reglas por país o integración carrier API.
- **Esfuerzo:** Alto

#### I5 — Página verify-email ausente
- **Descripción:** Backend envía `{FRONTEND_URL}/verify-email?token=...` pero ruta no existe.
- **Impacto:** Usuarios no pueden verificar cuenta.
- **Recomendación:** Página que llame `POST /auth/verify-email`.
- **Esfuerzo:** Bajo

#### I6 — Tests de pagos inexistentes
- **Descripción:** Webhooks e idempotencia no tienen tests automatizados.
- **Impacto:** Regresiones en flujo de dinero no detectadas pre-deploy.
- **Recomendación:** Tests con mocks httpx/stripe en CI.
- **Esfuerzo:** Medio

### 🟡 MODERADOS

#### M1 — Sin Content-Security-Policy
- **Ubicación:** `docker/nginx/nginx.conf`
- **Recomendación:** CSP allowlist para `'self'`, `*.stripe.com`, `*.wompi.co`
- **Esfuerzo:** Medio

#### M2 — Frontend CI ausente
- **Recomendación:** `next build` + ESLint en GitHub Actions
- **Esfuerzo:** Bajo

#### M3 — ~10 rutas navbar → 404
- **Ubicación:** `components/layout/NavBar.jsx:11-13`
- **Recomendación:** Páginas placeholder o ocultar links hasta implementar
- **Esfuerzo:** Medio

#### M4 — Buckets Supabase no verificados
- **Recomendación:** Crear `productos` y `modelos3d` en panel Supabase
- **Esfuerzo:** Bajo

### 🟢 BIEN IMPLEMENTADO

| ID | Qué | Por qué |
|---|---|---|
| G1 | Idempotencia webhooks | Evita doble descuento stock — estándar Stripe |
| G2 | Refresh token rotation | Detecta tokens robados — OWASP ASVS L2 |
| G3 | Snapshot JSONB en órdenes | Auditoría e-commerce Shopify |
| G4 | Rate limiting multicapa | Defensa DDoS aplicación |
| G5 | Validación SECRET_KEY | Previene arranque inseguro en prod |
| G6 | Health check degradado | Redis opcional; DB crítica — patrón Kubernetes |
| G7 | CI backend con migrate+test | Pipeline reproducible |

---

## 10. ROADMAP PRIORIZADO

### Fase 1 — Crítico (antes de clientes reales) · ~8–10 días

| # | Tarea | Esfuerzo | Owner |
|---|---|---|---|
| 1 | Aplicar Alembic en Supabase + seed productos | 1d | Backend |
| 2 | Corregir middleware admin + auth cookies | 0.5d | Frontend |
| 3 | Implementar `/checkout` (orden + pago Wompi sandbox) | 3d | Full-stack |
| 4 | Página `/verify-email` | 0.5d | Frontend |
| 5 | Fix configurador → carrito (variante_id) | 1d | Full-stack |
| 6 | Crear buckets Supabase + probar uploads | 0.5d | DevOps |
| 7 | Integrar Sentry | 0.5d | Backend |
| 8 | Tests webhook idempotencia | 1d | Backend |

### Fase 2 — Importante (antes del lanzamiento) · ~8–10 días

| # | Tarea | Esfuerzo |
|---|---|---|
| 9 | Refresh token automático en api.js | 1d |
| 10 | Migrar tokens a httpOnly cookies | 1d |
| 11 | Perfil usuario + direcciones + mis órdenes | 3d |
| 12 | Reglas envío/impuestos Colombia | 2d |
| 13 | CSP en Nginx | 0.5d |
| 14 | Frontend CI pipeline | 0.5d |
| 15 | Dependabot + escaneo vulnerabilidades | 0.5d |
| 16 | Documentar backup/restore Supabase | 0.5d |

### Fase 3 — Mejoras (roadmap futuro) · ongoing

- Load testing (k6/Locust) — objetivo 1.000 RPS catálogo
- CDN Cloudflare + WAF
- Páginas navbar faltantes
- Configurador 3D con modelos GLB reales
- Stripe Checkout internacional completo
- Dark mode / preferencias
- Admin: upload UI imágenes/3D
- Enum PostgreSQL roles/categorías
- Cola async para emails (Redis Queue)

---

## 11. RESPUESTAS A CRITERIOS DE EXCELENCIA

### ¿Listo para producción en 2 semanas?

**Parcialmente.** Con Fase 1 completa (checkout + admin fix + BD migrada), se puede lanzar un **piloto controlado en sandbox de pagos**. Producción comercial con tráfico real requiere Fase 1 + Fase 2 (~3–4 semanas total).

### ¿Riesgos regulatorios (pagos, datos)?

| Riesgo | Nivel | Mitigación |
|---|---|---|
| PCI-DSS | Bajo | Stripe/Wompi hosted checkout — no se almacenan tarjetas |
| Habeas Data Colombia | Medio | Falta política privacidad, consentimiento cookies, registro de tratamiento |
| Facturación electrónica DIAN | Alto | No implementada — requerida para ventas B2C Colombia |
| IVA en órdenes | Alto | Impuestos = 0 actualmente |

### ¿Qué pasa con 10.000 usuarios mañana?

- **Catálogo (lectura):** Probablemente aguanta con Redis caché + Supabase connection pooler.
- **Checkout concurrente:** Stock protegido con `FOR UPDATE`, pero sin load test no hay garantía.
- **Redis carrito anónimo:** 10k sesiones × ~2KB = ~20MB — trivial.
- **Sin CDN:** Imágenes/productos saturarían ancho de banda.
- **Veredicto:** 🔴 Caída probable en picos de checkout sin CDN, autoscaling y load testing.

### ¿Qué pasa con DDoS o SQL injection?

- **SQLi:** Protegido por ORM — riesgo bajo.
- **DDoS L7:** Rate limits ayudan; sin Cloudflare/WAF, ataque grande tumba el servidor.
- **DDoS L3/L4:** Requiere protección a nivel red (Cloudflare, AWS Shield).

### ¿Qué pasa si se pierde la BD?

- Supabase managed incluye backups en planes pagos.
- **Sin procedimiento restore documentado** — tiempo de recuperación desconocido (RTO).
- Migración Alembic permite recrear esquema; **datos de órdenes se pierden** sin backup.

### ¿Esfuerzo para escalar o iterar?

| Acción | Esfuerzo |
|---|---|
| Añadir categoría de producto | Bajo (schema validado) |
| Nuevo proveedor de pago | Medio (patrón en `pago_service`) |
| Nuevo país de envío | Alto (reglas fiscales) |
| Nuevo microservicio (ej. notificaciones) | Alto — monolito actual es coherente para MVP |

---

## 12. APÉNDICES

### A. Checklist de seguridad pre-producción

- [ ] `SECRET_KEY` ≥ 32 chars, generado con `openssl rand -hex 32`
- [ ] `ENVIRONMENT=production` en servidor
- [ ] `WOMPI_EVENTS_SECRET` y `STRIPE_WEBHOOK_SECRET` configurados
- [ ] Docs FastAPI deshabilitados (`is_production`)
- [ ] Nginx: bloquear `/docs` (descomentar return 404)
- [ ] Redis con contraseña (`docker-compose.prod.yml`)
- [ ] CORS solo dominios producción
- [ ] CSP header configurado
- [ ] Admin frontend protegido
- [ ] Tokens en httpOnly cookies
- [ ] HTTPS válido (Certbot)
- [ ] Rate limits verificados bajo carga
- [ ] Sentry/alertas activas
- [ ] Backup Supabase verificado con restore de prueba

### B. Checklist de performance pre-lanzamiento

- [ ] Índices BD verificados (incluidos en migración)
- [ ] Caché Redis productos activo (TTL 5 min)
- [ ] `next/image` en todo el catálogo
- [ ] Bundle analysis (`@next/bundle-analyzer`)
- [ ] Load test catálogo: 500 RPS objetivo
- [ ] Load test checkout: 50 concurrent purchases mismo SKU
- [ ] CDN para assets estáticos e imágenes Supabase
- [ ] Connection pooler Supabase (PgBouncer) en prod

### C. Referencias y estándares

- [OWASP ASVS 4.0](https://owasp.org/www-project-application-security-verification-standard/) — Autenticación, sesiones, validación
- [Stripe Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices) — Idempotencia, firma HMAC
- [Shopify Order API Design](https://shopify.dev/docs/api/admin-rest/latest/resources/order) — Snapshots, estados
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/) — JWT, dependencies
- [PCI DSS SAQ A](https://www.pcisecuritystandards.org/) — Hosted payment pages
- Ley 1581 de 2012 (Colombia) — Protección datos personales

### D. Inventario de endpoints backend (referencia)

| Prefijo | Endpoints clave |
|---|---|
| `/api/v1/auth` | login, register, refresh, verify-email, recuperar, me |
| `/api/v1/productos` | listar, destacados, `{slug}`, CRUD admin |
| `/api/v1/carrito` | CRUD items, merge |
| `/api/v1/ordenes` | crear, listar, `{id}` |
| `/api/v1/pagos` | checkout Wompi/Stripe |
| `/api/v1/webhooks` | wompi, stripe |
| `/api/v1/admin` | stats, productos, órdenes, usuarios |
| `/api/v1/usuarios` | me, direcciones CRUD |
| `/api/v1/admin/uploads` | imagen, modelo-3d |
| `/api/v1/configurador` | guardar/obtener configs 3D |

### E. Archivos clave del proyecto

| Área | Ruta |
|---|---|
| App principal | `backend/app/main.py` |
| Seguridad middleware | `backend/app/core/middleware.py` |
| Auth service | `backend/app/services/auth_service.py` |
| Pagos + idempotencia | `backend/app/services/pago_service.py` |
| Migración Alembic | `backend/alembic/versions/20260620_0001_inicial_esquema_completo.py` |
| CI backend | `.github/workflows/backend-ci.yml` |
| API cliente frontend | `frontend/lib/api.js` |
| Middleware admin (⚠️) | `frontend/middleware.js` |
| Docker prod | `docker/docker-compose.prod.yml` |
| Nginx | `docker/nginx/nginx.conf` |

---

## CONCLUSIÓN

WingConcept está en un punto de **inflexión positivo**: el backend alcanza un nivel de madurez adecuado para un MVP de e-commerce técnico (comparable a un early-stage Shopify clone), con decisiones de pagos y seguridad alineadas a estándares Stripe. El **cuello de botella es el frontend operacional**: checkout, protección admin, y flujos post-compra.

**Veredicto final:** 🟡 **Amarillo** — Invertir 2 semanas en Fase 1 habilita un piloto con pagos sandbox. Producción comercial responsable requiere ~4 semanas incluyendo Fase 2, cumplimiento fiscal Colombia, y observabilidad.

---

*Auditoría generada el 20 de junio de 2026. Próxima revisión recomendada: post-implementación Fase 1.*
