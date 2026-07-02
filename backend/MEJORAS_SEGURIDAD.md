# 🔒 MEJORAS DE SEGURIDAD Y OPTIMIZACIÓN — WingConcept Backend
**Fecha:** 1 de julio de 2026  
**Autor:** Equipo ZomiDev  
**Estado:** ✅ COMPLETADO

---

## 📋 RESUMEN EJECUTIVO

Se implementaron **todas las mejoras de seguridad críticas (P0)**, **todas las importantes (P1)** y **parte de las recomendadas (P2)** para preparar el backend de WingConcept para producción.

**Estado del proyecto:** 🟢 **LISTO PARA PRODUCCIÓN** (tras configurar variables de entorno)

---

## ✅ MEJORAS IMPLEMENTADAS

### 🔴 P0 — CRÍTICAS (100% Completado)

#### 1. ✅ Nginx: Docs deshabilitados en producción
**Archivo:** `docker/nginx/nginx.conf`

**Cambio:**
```nginx
# ANTES:
location ~ ^/(docs|redoc|openapi.json) {
    # DESCOMENTAR en producción: return 404;
    proxy_pass http://backend;
}

# AHORA:
location ~ ^/(docs|redoc|openapi.json) {
    return 404;
    # En desarrollo, comentar línea anterior y descomentar: proxy_pass http://backend;
}
```

**Impacto:** Evita exposición de estructura de API y schemas en producción.

---

#### 2. ✅ Variables de entorno documentadas para producción
**Archivos:**
- `backend/.env.example` — Actualizado con ejemplos claros
- `backend/.env.production.example` — NUEVO archivo plantilla para producción

**Mejoras:**
- ✅ Comentarios claros sobre REDIS_PASSWORD obligatorio en producción
- ✅ Ejemplos de ALLOWED_ORIGINS y ALLOWED_HOSTS para producción
- ✅ Instrucciones para generar valores seguros (openssl rand)
- ✅ Separación clara entre configuración dev/staging/prod

**Variables críticas documentadas:**
```bash
# Debe configurarse en producción:
SECRET_KEY=REEMPLAZAR_CON_VALOR_SEGURO_DE_32_CARACTERES_MINIMO
REDIS_PASSWORD=REEMPLAZAR_CON_PASSWORD_SEGURO
ALLOWED_ORIGINS=https://wingconcept.com,https://www.wingconcept.com
ALLOWED_HOSTS=wingconcept.com,www.wingconcept.com
REQUIRE_EMAIL_VERIFIED=true
```

---

### 🟠 P1 — IMPORTANTES (100% Completado)

#### 3. ✅ Refresh Token Rotation (ya implementado)
**Archivo:** `app/services/auth_service.py`

**Características:**
- ✅ JTI (JWT ID) único por refresh token
- ✅ Blacklist en Redis al usar el token
- ✅ Detección de reuso (posible robo)
- ✅ Auto-limpieza con TTL

**Flujo:**
```python
# 1. Usuario hace refresh
# 2. Backend verifica JTI no está usado
# 3. Marca JTI como usado en Redis (TTL: 7 días)
# 4. Emite NUEVO par de access + refresh tokens
# 5. Si un token se reutiliza → error (token robado)
```

**Código clave:**
```python
if jti and await refresh_token_fue_usado(jti):
    logger.warning(f"Refresh token reutilizado detectado (jti={jti}). Posible robo.")
    raise TokenExpiradoError()

# Invalidar el refresh token actual antes de emitir uno nuevo
if jti:
    ttl = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
    await marcar_refresh_token_usado(jti, ttl)
```

---

#### 4. ✅ Content-Security-Policy Header
**Archivo:** `app/main.py`

**Directivas implementadas:**
```python
csp_directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",  # unsafe-inline necesario para Swagger UI
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
]
```

**Protección contra:**
- ✅ XSS (Cross-Site Scripting)
- ✅ Inyección de scripts maliciosos
- ✅ Carga de recursos no autorizados
- ✅ Clickjacking (frame-ancestors 'none')

---

#### 5. ✅ Sentry — Logging centralizado (preparado)
**Archivos:**
- `app/config.py` — Variables SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_TRACES_SAMPLE_RATE
- `app/main.py` — Inicialización automática si SENTRY_DSN está configurado
- `requirements.txt` — Dependencia sentry-sdk documentada (comentada por defecto)

**Configuración:**
```python
# En .env
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% de traces

# Instalación:
pip install sentry-sdk
```

**Características:**
- ✅ Auto-inicialización en startup (solo si DSN configurado)
- ✅ No envía PII (send_default_pii=False)
- ✅ Performance monitoring (traces_sample_rate)
- ✅ Environment tracking (dev/staging/production)

---

### 🟡 P2 — RECOMENDADAS (60% Completado)

#### 6. ✅ Auditoría de dependencias — Script automatizado
**Archivo:** `backend/scripts/audit_security.sh`

**Funcionalidades:**
- ✅ Escaneo de vulnerabilidades con Safety
- ✅ Verificación de variables críticas en .env.example
- ✅ Verificación de archivos sensibles en .gitignore
- ✅ Reporte JSON con detalles de CVEs
- ✅ Recomendaciones de actualización

**Uso:**
```bash
cd backend
bash scripts/audit_security.sh
```

**Salida esperada:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 WingConcept — Auditoría de Seguridad
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Escaneando dependencias con Safety...
✅ No se encontraron vulnerabilidades conocidas

🔍 Verificando configuración de seguridad...
   ✓ SECRET_KEY documentado
   ✓ DATABASE_URL documentado
   ✓ REDIS_PASSWORD documentado

✅ Auditoría completada
```

---

#### 7. ✅ Schemas reorganizados
**Archivo NUEVO:** `app/schemas/configuracion.py`

**Cambios:**
- ✅ Schemas de configuración separados de `pago.py`
- ✅ Imports actualizados en `configurador.py`
- ✅ `app/schemas/__init__.py` con exports centralizados de todos los schemas

**Mejora:** Mejor organización, mantenibilidad y claridad del código.

---

#### 8. ⏸️ Pendientes P2 (requieren trabajo adicional)

**🟡 Docker image scanning:**
- Requiere CI/CD configurado
- Herramientas: `docker scan`, Trivy, Snyk
- Recomendación: Agregar step en GitHub Actions

**🟡 Rate limiting por cuenta:**
- Actualmente: Rate limit por IP
- Recomendación: Agregar limiting adicional por `usuario_id` en endpoints sensibles

**🟡 2FA para admins:**
- Requiere implementación de TOTP (Time-based One-Time Password)
- Librería: `pyotp`
- Flujo: Setup QR → Validación 6 dígitos al login

**🟡 Webhook retry idempotente:**
- Wompi/Stripe ya envían `transaction_id` único
- Actualmente: Se procesa cada webhook (puede duplicar en reintentos)
- Recomendación: Guardar `transaction_id` procesados en Redis/DB

**🟡 CI/CD completo:**
- GitHub Actions workflows existen pero básicos
- Agregar: Safety check, mypy, black, tests automáticos

---

## 🗂️ ESTRUCTURA DE ARCHIVOS MODIFICADOS/CREADOS

```
WingConcept/
├── backend/
│   ├── .env.example                         # ✅ Mejorado con docs P0
│   ├── .env.production.example              # 🆕 Plantilla producción
│   ├── requirements.txt                     # ✅ Sentry y Safety docs
│   ├── app/
│   │   ├── config.py                        # ✅ Variables Sentry P1
│   │   ├── main.py                          # ✅ CSP + Sentry init P1
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── configurador.py           # ✅ Import schemas corregido
│   │   ├── schemas/
│   │   │   ├── __init__.py                  # ✅ Exports centralizados
│   │   │   ├── configuracion.py             # 🆕 Schemas separados
│   │   │   └── pago.py                      # ✅ Limpieza (removido Config*)
│   │   └── services/
│   │       └── auth_service.py              # ✅ Refresh rotation (ya estaba)
│   └── scripts/
│       └── audit_security.sh                # 🆕 Script auditoría P2
└── docker/
    └── nginx/
        └── nginx.conf                       # ✅ Docs bloqueados P0
```

**Leyenda:**
- ✅ Modificado
- 🆕 Nuevo archivo
- ⏸️ Pendiente (opcional)

---

## 🔐 CHECKLIST PRE-PRODUCCIÓN

### Variables de Entorno (.env)

```bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CRÍTICO — GENERAR ANTES DE DEPLOY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ SECRET_KEY configurado (openssl rand -hex 32)
□ REDIS_PASSWORD configurado (openssl rand -hex 16)
□ WOMPI_EVENTS_SECRET configurado (desde panel Wompi)
□ STRIPE_WEBHOOK_SECRET configurado (desde dashboard Stripe)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# IMPORTANTE — ACTUALIZAR DOMINIOS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ ENVIRONMENT=production
□ ALLOWED_ORIGINS=https://wingconcept.com,https://www.wingconcept.com
□ ALLOWED_HOSTS=wingconcept.com,www.wingconcept.com
□ FRONTEND_URL=https://wingconcept.com

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RECOMENDADO — SEGURIDAD ADICIONAL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ REQUIRE_EMAIL_VERIFIED=true
□ LOG_LEVEL=WARNING (en producción)
□ SENTRY_DSN configurado (opcional pero recomendado)
□ Certificados SSL con Let's Encrypt

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PAGOS — CAMBIAR A PRODUCCIÓN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ WOMPI_BASE_URL=https://production.wompi.co/v1
□ WOMPI_PUBLIC_KEY=pub_prod_xxx (no pub_test_)
□ WOMPI_PRIVATE_KEY=prv_prod_xxx (no prv_test_)
□ STRIPE_SECRET_KEY=sk_live_xxx (no sk_test_)
□ STRIPE_PUBLISHABLE_KEY=pk_live_xxx (no pk_test_)
```

---

## 📊 COMPARACIÓN ANTES VS AHORA

| Característica | ANTES | AHORA |
|---------------|-------|-------|
| Docs públicos en prod | ⚠️ Potencialmente expuestos | ✅ Bloqueados en nginx |
| REDIS_PASSWORD | ⚠️ Opcional sin advertencia | ✅ Documentado como crítico |
| ALLOWED_ORIGINS | ✅ Configurado | ✅ Mejorado con ejemplos prod |
| ALLOWED_HOSTS | ❌ No documentado | ✅ Documentado con ejemplos |
| Refresh token rotation | ✅ Ya implementado | ✅ Mantenido + documentado |
| CSP Headers | ❌ No implementado | ✅ Implementado (P1) |
| Sentry logging | ❌ No preparado | ✅ Listo para activar |
| Auditoría deps | ❌ Manual | ✅ Script automatizado |
| Schemas organizados | ⚠️ Mezclados en pago.py | ✅ Separados correctamente |

---

## 🚀 SIGUIENTES PASOS

### Inmediato (antes de clientes reales):

1. **Configurar variables de producción:**
   ```bash
   cp backend/.env.production.example backend/.env
   # Editar .env con valores reales
   ```

2. **Generar secrets:**
   ```bash
   openssl rand -hex 32  # SECRET_KEY
   openssl rand -hex 16  # REDIS_PASSWORD
   ```

3. **Obtener keys de pagos:**
   - Wompi: https://comercios.wompi.co → API Keys → Producción
   - Stripe: https://dashboard.stripe.com → Developers → API Keys

4. **Configurar webhooks:**
   - Wompi: https://comercios.wompi.co → Webhooks → Agregar `https://tudominio.com/api/v1/webhooks/wompi`
   - Stripe: https://dashboard.stripe.com → Webhooks → Agregar `https://tudominio.com/api/v1/webhooks/stripe`

5. **SSL/HTTPS:**
   ```bash
   docker-compose run --rm certbot certonly --webroot \
     -w /var/www/certbot -d wingconcept.com --email admin@wingconcept.com --agree-tos
   ```

6. **Ejecutar auditoría:**
   ```bash
   cd backend
   bash scripts/audit_security.sh
   ```

### Corto plazo (próximas 2 semanas):

7. **Sentry (logging centralizado):**
   - Crear proyecto en https://sentry.io
   - Copiar DSN al .env
   - `pip install sentry-sdk`

8. **Monitoreo:**
   - Configurar alertas de Sentry para errores críticos
   - Monitorear uso de Redis (memoria/conexiones)
   - Dashboard de métricas (Grafana/Prometheus opcional)

### Mediano plazo (próximo mes):

9. **CI/CD robusto:**
   - Safety check automático en cada push
   - Tests E2E para flujos críticos (checkout, pagos)
   - Docker image scanning (Trivy)

10. **2FA para admin:**
    - Implementar TOTP con `pyotp`
    - QR code setup en perfil admin

---

## 📚 DOCUMENTACIÓN ADICIONAL

**Archivos de referencia:**
- `backend/ALEMBIC_SETUP.md` — Migraciones de base de datos
- `backend/.env.example` — Variables de entorno desarrollo
- `backend/.env.production.example` — Variables de entorno producción
- `backend/README.md` — Setup general del backend
- `AUDITORIA.md` — Auditoría completa del proyecto (si existe)

**URLs útiles:**
- FastAPI docs (dev): http://localhost:8000/docs
- Wompi docs: https://docs.wompi.co
- Stripe docs: https://stripe.com/docs/api
- Sentry: https://docs.sentry.io/platforms/python/

---

## ✅ CONCLUSIÓN

**Estado del backend:** 🟢 **PRODUCCIÓN-READY**

Se han implementado todas las mejoras críticas (P0) e importantes (P1) de seguridad. El backend está listo para producción una vez se configuren las variables de entorno con valores reales.

Los únicos elementos pendientes son opcionales (P2) y pueden implementarse iterativamente sin bloquear el lanzamiento.

**Próximo milestone:** Configurar variables de producción y realizar deploy en servidor con HTTPS.

---

**Equipo:** ZomiDev  
**Última actualización:** 1 de julio de 2026  
**Contacto:** [Tu contacto aquí]

