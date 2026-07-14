# WingConcept en Oracle Cloud — gratis 24/7

Servidor **Always Free** en Oracle + DNS en **name.com** + Docker (frontend + API + Redis + HTTPS).

**Costo:** $0/mes (Oracle Always Free + Supabase free + Let's Encrypt).

**Ventaja vs Mac:** el sitio queda **24/7** sin depender de tu computadora.

---

## Qué vas a tener

```
wingconcept.com (name.com → IP Oracle)
        │
        ▼
   Oracle VM (Ubuntu)
   Docker: nginx + frontend + backend + redis
        │
        ▼
   Supabase (BD + imágenes)
```

---

## Parte 1 — Cuenta Oracle Cloud (15–30 min)

### 1.1 Registro

1. [oracle.com/cloud/free](https://www.oracle.com/cloud/free/) → **Start for free**.
2. Completa el registro (a veces piden tarjeta para **verificación**, no deberían cobrar si solo usas recursos Always Free).
3. Elige región cercana (ej. **US East Ashburn**, **US West Phoenix**, **São Paulo**).

### 1.2 Crear la VM (Always Free Ampere)

1. Menú ☰ → **Compute** → **Instances** → **Create instance**.
2. Nombre: `wingconcept`.
3. **Image:** Ubuntu 22.04 (Canonical).
4. **Shape:** Click **Change shape** → **Ampere** → **VM.Standard.A1.Flex**
   - OCPUs: **2** (deja margen dentro del free tier)
   - Memory: **12 GB** (suficiente; máximo free es 24 GB total)
5. **Networking:** deja la VCN por defecto; marca **Assign a public IPv4 address**.
6. **SSH keys:** **Generate a key pair** → descarga la clave privada (`ssh-key-*.key`). Guárdala bien.
7. **Create**.

> Si sale **"Out of capacity"** en Ampere: prueba otra **Availability Domain** o otra **región**. Es común; reintenta en horas distintas.

### 1.3 Abrir puertos (firewall Oracle)

1. En la instancia → click en el **Subnet** → **Security List** (default).
2. **Add Ingress Rules:**

| Source CIDR | Protocol | Dest port | Descripción |
|-------------|----------|-----------|-------------|
| `0.0.0.0/0` | TCP | 22 | SSH |
| `0.0.0.0/0` | TCP | 80 | HTTP (Certbot + redirect) |
| `0.0.0.0/0` | TCP | 443 | HTTPS |

3. Guarda.

### 1.4 Firewall en Ubuntu (iptables)

Oracle Ubuntu suele usar `iptables`. En la VM:

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save 2>/dev/null || sudo sh -c 'iptables-save > /etc/iptables/rules.v4'
```

(A veces no hace falta si ya responde en 80/443.)

### 1.5 Anotar IP pública

En **Instance details** → **Public IP address** (ej. `123.45.67.89`).

---

## Parte 2 — DNS en name.com (5 min)

**No necesitas Cloudflare.** Dejas nameservers de name.com.

1. [name.com](https://www.name.com) → **My Domains** → `wingconcept.com` → **DNS Records**.
2. Añade o edita:

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| **A** | `@` | `TU_IP_ORACLE` | 300 |
| **A** | `www` | `TU_IP_ORACLE` | 300 |

3. Guarda. Espera 5–30 min.

Verifica desde tu Mac:

```bash
dig wingconcept.com +short
# Debe mostrar la IP de Oracle
```

---

## Parte 3 — Conectar por SSH

Desde tu Mac:

```bash
chmod 600 ~/Downloads/ssh-key-XXXX.key
ssh -i ~/Downloads/ssh-key-XXXX.key ubuntu@TU_IP_ORACLE
```

Usuario por defecto en Ubuntu Oracle: **`ubuntu`**.

---

## Parte 4 — Instalar Docker en la VM

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
exit
```

Vuelve a entrar por SSH (para aplicar el grupo `docker`):

```bash
ssh -i ~/Downloads/ssh-key-XXXX.key ubuntu@TU_IP_ORACLE
docker --version
```

---

## Parte 5 — Clonar el proyecto

```bash
sudo mkdir -p /opt/wingconcept
sudo chown ubuntu:ubuntu /opt/wingconcept
git clone https://github.com/Alejdmc/WingConcept.git /opt/wingconcept
cd /opt/wingconcept
git checkout production
```

---

## Parte 6 — Configurar `backend/.env`

```bash
cp backend/.env.production.example backend/.env
nano backend/.env
```

Genera secrets (en la VM o en tu Mac):

```bash
openssl rand -hex 32   # SECRET_KEY
openssl rand -hex 16   # REDIS_PASSWORD
```

Ejemplo mínimo (usa tus valores reales):

```env
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=...
REDIS_PASSWORD=...
DATABASE_URL=postgresql+asyncpg://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres
SUPABASE_URL=https://PROJECT.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
ALLOWED_ORIGINS=https://wingconcept.com,https://www.wingconcept.com
FRONTEND_URL=https://wingconcept.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=https://wingconcept.com/checkout/exito
STRIPE_CANCEL_URL=https://wingconcept.com/checkout/cancelado
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@wingconcept.com
RUN_MIGRATIONS=true
REQUIRE_EMAIL_VERIFIED=true
```

---

## Parte 7 — Desplegar (un comando)

```bash
cd /opt/wingconcept/docker
chmod +x deploy.sh
DOMAIN=wingconcept.com CERTBOT_EMAIL=tu@email.com ./deploy.sh
```

El script:

1. Construye frontend + backend + redis + nginx.
2. Pide certificado **Let's Encrypt** (gratis).
3. Activa **HTTPS** en `https://wingconcept.com`.

Espera 5–10 min la primera vez (build de Docker).

Verifica:

```bash
curl -s https://wingconcept.com/health
curl -I https://wingconcept.com
```

Abre en el navegador: **https://wingconcept.com**

---

## Parte 8 — Admin y Stripe

### Admin inicial

```bash
cd /opt/wingconcept/docker
docker compose --env-file ../backend/.env \
  -f docker-compose.yml -f docker-compose.prod.yml exec backend \
  python scripts/crear_admin.py
```

### Webhook Stripe

Stripe Dashboard → Developers → Webhooks → Add endpoint:

- **URL:** `https://wingconcept.com/api/v1/webhooks/stripe`
- **Eventos:** `checkout.session.completed`, `payment_intent.payment_failed`, `charge.refunded`
- Copia `whsec_...` → `STRIPE_WEBHOOK_SECRET` en `backend/.env`

```bash
docker compose --env-file ../backend/.env \
  -f docker-compose.yml -f docker-compose.prod.yml restart backend
```

---

## Mantenimiento

| Acción | Comando (en la VM) |
|--------|---------------------|
| Ver logs | `cd /opt/wingconcept/docker && docker compose --env-file ../backend/.env -f docker-compose.yml -f docker-compose.prod.yml logs -f` |
| Actualizar | `cd /opt/wingconcept && git pull origin production && cd docker && ./deploy.sh` |
| Reiniciar todo | `docker compose ... restart` |
| Estado | `docker compose ... ps` |

---

## Always Free — no pagar de más

Quédate solo en recursos **Always Free**:

- **VM Ampere A1:** máx. 4 OCPUs + 24 GB RAM **en total** en la tenancy (1 VM con 2+12 GB está bien).
- **No** crees Block Volume extra de pago, Load Balancer de pago, ni instancias AMD micro si ya tienes Ampere.
- Revisa **Billing** → **Cost analysis** las primeras semanas (debería ser $0).

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| **Out of capacity** (Ampere) | Otra AD/región; reintentar más tarde |
| `dig` no muestra IP Oracle | Revisa registros A en name.com |
| Certbot falla | DNS debe apuntar a la VM **antes** de `./deploy.sh`; puerto 80 abierto |
| 502 Bad Gateway | `docker compose logs frontend backend nginx` |
| No puedo SSH | Security List puerto 22; IP correcta; clave `.key` con chmod 600 |
| Sitio lento al inicio | Normal tras deploy; primera visita compila caché |

---

## Resumen rápido

1. Oracle: VM Ubuntu Ampere (Always Free) + puertos 22/80/443.
2. name.com: A `@` y A `www` → IP Oracle.
3. SSH → Docker → clone rama `production`.
4. `backend/.env` → `./deploy.sh`.
5. Stripe webhook + admin.

**Tu Mac ya no es el servidor** — solo la usas para SSH y administrar.
