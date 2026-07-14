# Despliegue gratuito — WingConcept en wingconcept.com

Todo el stack corre en **un solo servidor** con Docker. Sin Vercel, sin VPS de pago.

## Costo: $0/mes

| Servicio | Plan | Uso |
|----------|------|-----|
| **Oracle Cloud** Always Free | VM ARM 4 OCPU / 24 GB RAM | Servidor (frontend + backend + Redis + nginx) |
| **Supabase** | Free | PostgreSQL + Storage (ya configurado) |
| **Let's Encrypt** | Gratis | SSL/HTTPS |
| **Resend** | Free (3k emails/mes) | Correos transaccionales |
| **Stripe** | Sin cuota mensual | Pagos (comisión por venta) |

Alternativas gratuitas al servidor: AWS EC2 free tier (12 meses), Google Cloud e2-micro.

---

## Arquitectura

```
wingconcept.com (DNS → IP del servidor)
        │
        ▼
     Nginx :443
    ┌────┴────┐
    │         │
 Frontend  Backend ──► Supabase PostgreSQL
  :3000      :8000
              │
            Redis
```

- **Frontend** y **API** comparten el mismo dominio → el navegador llama a `/api/v1` sin CORS extra.
- No hace falta `NEXT_PUBLIC_API_URL` en producción.

---

## Paso 1 — Servidor gratis (Oracle Cloud)

1. Crear cuenta en [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/).
2. Crear VM **Ampere A1** (Ubuntu 22.04), abrir puertos **80** y **443** en Security List / firewall.
3. SSH al servidor e instalar Docker:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Cerrar sesión y volver a entrar
```

---

## Paso 2 — DNS

En tu registrador del dominio `wingconcept.com`:

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | `@` | IP pública del servidor |
| A | `www` | IP pública del servidor |

Espera propagación (5–30 min). Verifica: `dig wingconcept.com +short`

---

## Paso 3 — Clonar y configurar

```bash
git clone https://github.com/TU_ORG/WingConcept.git /opt/wingconcept
cd /opt/wingconcept
git checkout production

cp backend/.env.production.example backend/.env
nano backend/.env   # Completar valores reales
```

Variables **obligatorias** en `backend/.env`:

```env
ENVIRONMENT=production
SECRET_KEY=<openssl rand -hex 32>
REDIS_PASSWORD=<openssl rand -hex 16>
DATABASE_URL=postgresql+asyncpg://...@db....supabase.co:5432/postgres
SUPABASE_URL=https://....supabase.co
SUPABASE_SERVICE_KEY=...
ALLOWED_ORIGINS=https://wingconcept.com,https://www.wingconcept.com
FRONTEND_URL=https://wingconcept.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=https://wingconcept.com/checkout/exito
STRIPE_CANCEL_URL=https://wingconcept.com/checkout/cancelado
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@wingconcept.com
RUN_MIGRATIONS=true
```

Admin inicial (después del primer `up`):

```bash
cd /opt/wingconcept/docker
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend \
  python scripts/crear_admin.py
```

---

## Paso 4 — Desplegar

```bash
cd /opt/wingconcept/docker
chmod +x deploy.sh
DOMAIN=wingconcept.com CERTBOT_EMAIL=tu@email.com ./deploy.sh
```

El script:

1. Levanta servicios con nginx HTTP (bootstrap).
2. Obtiene certificado Let's Encrypt.
3. Activa HTTPS y reconstruye si hace falta.

Verificar:

```bash
curl -I https://wingconcept.com
curl https://wingconcept.com/health
```

---

## Paso 5 — Stripe webhook

En [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks:

- **URL:** `https://wingconcept.com/api/v1/webhooks/stripe`
- **Eventos:** `checkout.session.completed`, `payment_intent.payment_failed`, `charge.refunded`
- Copiar `whsec_...` → `STRIPE_WEBHOOK_SECRET` en `backend/.env` y reiniciar backend.

---

## Actualizar producción

```bash
cd /opt/wingconcept
git pull origin production
cd docker
./deploy.sh
```

---

## Rama `production`

- Despliegues desde la rama **`production`** (estable).
- Desarrollo en `main`; merge a `production` cuando esté listo para publicar.

---

## Desarrollo local

En `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Sin esa variable en producción, la API usa rutas relativas `/api/v1`.

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| Nginx no arranca | Certificados faltantes → `./deploy.sh` de nuevo o `NGINX_CONF=nginx.bootstrap.conf` |
| 502 Bad Gateway | `docker compose logs frontend backend` |
| API CORS | Revisar `ALLOWED_ORIGINS` en `backend/.env` |
| Imágenes rotas | Supabase bucket `productos` + `next.config.js` remotePatterns |
