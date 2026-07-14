# WingConcept en tu Mac — wingconcept.com (gratis)

DNS en **name.com** + app en **tu Mac** + **Cloudflare Tunnel** (HTTPS sin abrir puertos).

**Costo:** $0 (Cloudflare free, Docker Desktop, Supabase free).

**Limitación:** la Mac debe estar encendida y con internet.

---

## Resumen (30–45 min)

1. Cuenta Cloudflare → añadir `wingconcept.com`
2. name.com → cambiar nameservers a Cloudflare
3. Mac → Docker + cloudflared + `backend/.env`
4. `./mac-start.sh` → levantar la app
5. Túnel Cloudflare → exponer `https://wingconcept.com`

---

## Paso 1 — Cloudflare (gratis, sin tarjeta)

1. Regístrate en [dash.cloudflare.com](https://dash.cloudflare.com).
2. **Add a site** → `wingconcept.com` → plan **Free**.
3. Cloudflare escanea DNS. Revisa que existan registros básicos (puedes añadir después).
4. Anota los **2 nameservers** que te dan, por ejemplo:
   - `ada.ns.cloudflare.com`
   - `bob.ns.cloudflare.com`

---

## Paso 2 — name.com (nameservers)

1. Entra a [name.com](https://www.name.com) → **My Domains** → `wingconcept.com`.
2. **Nameservers** (o DNS Settings → Nameservers).
3. Elige **Custom nameservers** y pon los 2 de Cloudflare.
4. Guarda. La propagación puede tardar **15 min – 48 h** (suele ser < 1 h).

Comprueba (cuando propague):

```bash
dig NS wingconcept.com +short
# Debe mostrar ns de cloudflare.com
```

---

## Paso 3 — Mac: herramientas

### Docker Desktop

- Instala [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/).
- Ábrelo y espera a que diga "Running".

### cloudflared

```bash
brew install cloudflared
```

---

## Paso 4 — Configurar el proyecto

```bash
cd /Users/alecito/PycharmProjects/WingConcept   # o donde tengas el repo
git checkout production
git pull origin production

cp backend/.env.production.example backend/.env
nano backend/.env   # o abrir en Cursor
```

Ajusta al menos (usa tus valores reales de Supabase, Stripe, Resend):

```env
ENVIRONMENT=production
SECRET_KEY=<openssl rand -hex 32>
REDIS_PASSWORD=<openssl rand -hex 16>
DATABASE_URL=postgresql+asyncpg://...@db....supabase.co:5432/postgres
SUPABASE_URL=https://....supabase.co
SUPABASE_SERVICE_KEY=...
ALLOWED_ORIGINS=https://wingconcept.com,https://www.wingconcept.com
FRONTEND_URL=https://wingconcept.com
STRIPE_SUCCESS_URL=https://wingconcept.com/checkout/exito
STRIPE_CANCEL_URL=https://wingconcept.com/checkout/cancelado
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@wingconcept.com
RUN_MIGRATIONS=true
```

Generar secrets:

```bash
openssl rand -hex 32   # SECRET_KEY
openssl rand -hex 16   # REDIS_PASSWORD
```

---

## Paso 5 — Levantar la app en la Mac

```bash
cd docker
chmod +x mac-start.sh
./mac-start.sh
```

Verifica:

```bash
curl http://localhost/health
# {"status":"ok"} o similar
```

Abre en el navegador: http://localhost (solo en tu Mac).

---

## Paso 6 — Cloudflare Tunnel

### 6.1 Login y crear túnel

```bash
cloudflared tunnel login
# Abre el navegador → elige wingconcept.com → Authorize

cloudflared tunnel create wingconcept
# Anota el Tunnel ID (UUID)
```

### 6.2 Configuración

```bash
mkdir -p ~/.cloudflared
cp docker/cloudflare/config.yml.example ~/.cloudflared/config.yml
nano ~/.cloudflared/config.yml
```

Edita `credentials-file` y `tunnel` con tu UUID y usuario de Mac:

```yaml
tunnel: TU-TUNNEL-UUID
credentials-file: /Users/alecito/.cloudflared/TU-TUNNEL-UUID.json

ingress:
  - hostname: wingconcept.com
    service: http://localhost:80
  - hostname: www.wingconcept.com
    service: http://localhost:80
  - service: http_status:404
```

### 6.3 DNS en Cloudflare (automático)

```bash
cloudflared tunnel route dns wingconcept wingconcept.com
cloudflared tunnel route dns wingconcept www.wingconcept.com
```

Esto crea CNAMEs en Cloudflare apuntando al túnel.

### 6.4 Ejecutar el túnel

```bash
cloudflared tunnel run wingconcept
```

Deja esa terminal abierta. Prueba: **https://wingconcept.com**

### 6.5 (Opcional) Túnel al arrancar la Mac

```bash
cloudflared service install
sudo cloudflared service start
```

Solo después de que `config.yml` esté correcto.

---

## Paso 7 — Stripe webhook

Stripe Dashboard → Webhooks → Add endpoint:

- **URL:** `https://wingconcept.com/api/v1/webhooks/stripe`
- **Eventos:** `checkout.session.completed`, `payment_intent.payment_failed`, `charge.refunded`
- Copia `whsec_...` → `STRIPE_WEBHOOK_SECRET` en `backend/.env`
- Reinicia backend:

```bash
cd docker
docker compose --env-file ../backend/.env -f docker-compose.yml -f docker-compose.prod.yml restart backend
```

---

## Admin inicial

```bash
cd docker
docker compose --env-file ../backend/.env -f docker-compose.yml -f docker-compose.prod.yml exec backend \
  python scripts/crear_admin.py
```

---

## Día a día

| Acción | Comando |
|--------|---------|
| Encender el sitio | Docker Desktop ON → `./mac-start.sh` → `cloudflared tunnel run wingconcept` |
| Ver logs | `docker compose ... logs -f` |
| Actualizar código | `git pull origin production` → `./mac-start.sh` |
| Apagar | `docker compose ... down` + Ctrl+C en cloudflared |

---

## Solución de problemas

| Problema | Qué hacer |
|----------|-----------|
| `wingconcept.com` no carga | Nameservers en name.com apuntando a Cloudflare; espera propagación |
| Error 502 en Cloudflare | Docker no corre o `./mac-start.sh` falló; `curl localhost/health` |
| CORS / login falla | `ALLOWED_ORIGINS` con `https://wingconcept.com` |
| Certificado SSL | Lo da Cloudflare automáticamente; no uses Let's Encrypt en Mac |
| Puerto 80 ocupado | Para Docker en Mac a veces hace falta liberar :80 o cambiar nginx a :8080 y tunnel → `localhost:8080` |

---

## name.com — no borres el dominio

Solo cambias **nameservers** a Cloudflare. El dominio sigue registrado en name.com; Cloudflare gestiona DNS y el túnel.
