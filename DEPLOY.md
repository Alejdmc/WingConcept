# Despliegue gratuito — WingConcept en wingconcept.com

## ¿Necesito Oracle Cloud?

**No.** Oracle era solo **una opción** de servidor gratis. Para publicar en `wingconcept.com` a $0 necesitas **algún lugar que ejecute el código** — no hay magia sin eso.

| Opción | Cuenta nueva | Tarjeta | Mejor si… |
|--------|--------------|---------|-----------|
| **A. Tu PC/Mac + Cloudflare Tunnel** | Cloudflare (gratis) | No | No quieres ningún VPS ni Oracle |
| **B. Vercel + Render** | Vercel + Render (gratis) | No suele pedirse | Aceptas dos servicios PaaS gratuitos |
| **C. Oracle / AWS / GCP free** | Sí | A veces verifican | Quieres un servidor 24/7 “de verdad” |
| **D. Docker en cualquier máquina** | Ninguna extra | No | Ya tienes un VPS, NAS o servidor propio |

Lo que **ya tienes** (Supabase, dominio, GitHub, Resend, Stripe) no sustituye un servidor: solo cubren BD, DNS, repo y pagos/emails.

---

## Opción A — Recomendada si no quieres Oracle (PC + Cloudflare Tunnel)

Costo **$0**. El sitio corre en **tu computadora** (o la de alguien del equipo) con Docker; Cloudflare expone `wingconcept.com` con HTTPS **sin abrir puertos** en el router.

1. Cuenta gratis en [Cloudflare](https://dash.cloudflare.com) → añadir `wingconcept.com` y cambiar nameservers en tu registrador.
2. En la PC (macOS/Linux), instalar Docker y [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/).
3. Clonar rama `production` y configurar `backend/.env`.
4. Levantar stack (sin SSL local; Cloudflare termina HTTPS):

```bash
cd docker
export NGINX_CONF=nginx.bootstrap.conf
docker compose --env-file ../backend/.env -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

5. Crear túnel y apuntar el dominio:

```bash
cloudflared tunnel create wingconcept
cloudflared tunnel route dns wingconcept wingconcept.com
cloudflared tunnel route dns wingconcept www.wingconcept.com
# Configurar ingress: wingconcept.com → http://localhost:80
cloudflared tunnel run wingconcept
```

6. Stripe webhook: `https://wingconcept.com/api/v1/webhooks/stripe`

**Limitación:** la PC debe estar encendida y con internet. Para tienda real 24/7, usa B o C.

---

## Opción B — Vercel (frontend) + Render (backend)

Costo **$0** en planes hobby/free. **No usa Oracle.**

| Parte | Dónde | Dominio |
|-------|--------|---------|
| Next.js | [Vercel](https://vercel.com) — conectar repo GitHub, carpeta `frontend`, rama `production` | `wingconcept.com` |
| FastAPI | [Render](https://render.com) — Web Service desde `backend/Dockerfile` | `api.wingconcept.com` |

En Vercel (variables de entorno):

```env
NEXT_PUBLIC_API_URL=https://api.wingconcept.com
```

En Render (`backend/.env`): `ALLOWED_ORIGINS=https://wingconcept.com,https://www.wingconcept.com`

DNS:

| Tipo | Nombre | Valor |
|------|--------|-------|
| CNAME | `@` o A | Lo indica Vercel |
| CNAME | `www` | Vercel |
| CNAME | `api` | Lo indica Render |

**Limitación Render free:** el servicio **se duerme** tras inactividad (~50 s al despertar). Los webhooks de Stripe pueden fallar si el backend está dormido. Para producción seria conviene Opción A o C.

**Redis:** Render no incluye Redis gratis; habría que usar [Upstash Redis free](https://upstash.com) (otra cuenta) o adaptar el backend — hoy el carrito depende de Redis.

---

## Opción C — Un servidor con Docker (Oracle u otro)

Todo en **un solo dominio** con el script `docker/deploy.sh` (frontend + API + Redis + nginx + Let's Encrypt).

Oracle **Always Free** no es trial de 30 días: es gratis mientras uses solo recursos “Always Free”. A veces piden tarjeta para verificación. En algunas regiones cuesta conseguir VM Ampere.

Alternativas similares: AWS EC2 free tier (12 meses), Google e2-micro, un VPS que ya tengas.

---

## Costo: $0/mes (servicios que ya usas o son free)

| Servicio | Plan | Uso |
|----------|------|-----|
| **Servidor / PaaS** | Ver opciones A–C arriba | Ejecutar frontend + backend |
| **Supabase** | Free | PostgreSQL + Storage (ya configurado) |
| **Let's Encrypt / Cloudflare** | Gratis | HTTPS |
| **Resend** | Free (3k emails/mes) | Correos |
| **Stripe** | Sin cuota mensual | Pagos (comisión por venta) |

---

## Arquitectura (Opción C — todo en un servidor)

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

- **Frontend** y **API** en el mismo dominio → el navegador usa `/api/v1` relativo.
- No hace falta `NEXT_PUBLIC_API_URL` en producción (Opción C).

---

## Pasos Opción C — Servidor + Docker

### 1. Servidor (Oracle u otro)

1. VM Ubuntu 22.04, puertos **80** y **443** abiertos.
2. Instalar Docker:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 2. DNS

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | `@` | IP pública del servidor |
| A | `www` | IP pública del servidor |

### 3. Clonar y configurar

```bash
git clone https://github.com/Alejdmc/WingConcept.git /opt/wingconcept
cd /opt/wingconcept && git checkout production
cp backend/.env.production.example backend/.env
nano backend/.env
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

### 4. Desplegar

```bash
cd /opt/wingconcept/docker
chmod +x deploy.sh
DOMAIN=wingconcept.com CERTBOT_EMAIL=tu@email.com ./deploy.sh
```

### 5. Stripe webhook

- **URL:** `https://wingconcept.com/api/v1/webhooks/stripe`
- Eventos: `checkout.session.completed`, `payment_intent.payment_failed`, `charge.refunded`

---

## Actualizar producción

```bash
cd /opt/wingconcept && git pull origin production
cd docker && ./deploy.sh
```

---

## Rama `production`

Despliegues desde **`production`**. Desarrollo en `main`.

---

## Desarrollo local

En `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| Nginx no arranca | Certificados faltantes → `./deploy.sh` o `NGINX_CONF=nginx.bootstrap.conf` |
| 502 Bad Gateway | `docker compose logs frontend backend` |
| API CORS | `ALLOWED_ORIGINS` en `backend/.env` |
| Imágenes rotas | Bucket Supabase `productos` + `next.config.js` |
| No quiero Oracle | Usar **Opción A** (Cloudflare Tunnel) o **B** (Vercel+Render) |
