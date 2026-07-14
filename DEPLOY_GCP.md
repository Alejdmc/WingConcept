# WingConcept en Google Cloud — e2-micro

VM **e2-micro** + DNS en **name.com** + Docker.

---

## ⚠️ Muy importante: 90 días vs Always Free

Google muestra **“$300 gratis / 90 días”** al registrarte. Eso es **una prueba aparte**, no es lo único que ofrecen.

| Concepto | Qué es | ¿Caduca? |
|----------|--------|----------|
| **Trial $300** | Crédito extra para probar servicios | Sí, ~90 días |
| **Always Free e2-micro** | 1 VM pequeña en regiones US | **No** — sigue gratis si te mantienes en el límite |

**e2-micro en `us-central1`, `us-west1` o `us-east1`** puede ser **$0 para siempre** aunque termine el trial de 90 días, **siempre que**:

- Solo uses **1× e2-micro** (no e2-small, e2-medium, etc.)
- Región US elegible (Oregon, Iowa, Carolina del Sur)
- Disco **≤ 30 GB** standard
- No añadas Load Balancer, Cloud SQL, etc.
- Tengas **billing account** activo (suelen pedir tarjeta; no deberían cobrar si no sales del free tier)

Después de 90 días **no pierdes** la e2-micro free si cumples lo anterior. Lo que pierdes es el crédito de $300.

**Si no quieres tarjeta ni ambigüedad de billing:** usa **Mac + Cloudflare** (`DEPLOY_MAC.md`) o sigue intentando **Oracle Always Free**.

---

**RAM:** 1 GB — justo. Usamos `docker-compose.gcp.yml` (1 worker, límites de memoria) + swap.

---

## Requisitos del free tier

| Recurso | Límite free |
|---------|-------------|
| VM | **1× e2-micro** |
| Regiones free | `us-west1`, `us-central1`, `us-east1` (Oregon, Iowa, Carolina del Sur) |
| Disco | 30 GB standard |
| IP | 1 IP externa (reserva estática incluida en free con VM) |

Fuera de esas regiones o con máquinas más grandes **sí cobran**.

---

## Parte 1 — Cuenta y proyecto (10 min)

1. [console.cloud.google.com](https://console.cloud.google.com) → cuenta Google.
2. **New Project** → nombre: `wingconcept` → Create.
3. Selecciona el proyecto arriba.
4. Menú ☰ → **APIs & Services** → **Enable APIs** → busca **Compute Engine API** → Enable.

(GCP a veces pide tarjeta para verificar; no debería cobrar si solo usas e2-micro free.)

---

## Parte 2 — Crear la VM

Menú ☰ → **Compute Engine** → **VM instances** → **Create instance**

| Campo | Valor |
|--------|--------|
| **Name** | `wingconcept` |
| **Region** | `us-central1` (Iowa) o `us-west1` (Oregon) |
| **Zone** | Cualquiera de la región |
| **Machine type** | **e2-micro** (0.25–2 vCPU, 1 GB memory) |
| **Boot disk** | **Change** → Ubuntu 22.04 LTS, **Standard persistent disk**, **30 GB** |
| **Firewall** | ✅ Allow HTTP traffic |
| | ✅ Allow HTTPS traffic |
| **SSH** | Deja default (Google gestiona keys) o añade tu clave pública |

**Create** (tarda 1–2 min).

---

## Parte 3 — IP estática (recomendado)

1. **VPC network** → **IP addresses** → **Reserve external static address**.
2. Name: `wingconcept-ip`, Region: la misma de la VM → Reserve.
3. **VM instances** → `wingconcept` → **Edit** → **Network interfaces** → External IP → selecciona la IP reservada → Save.

Anota la **IP externa** (ej. `34.123.45.67`).

---

## Parte 4 — DNS en name.com

| Type | Host | Answer |
|------|------|--------|
| **A** | `@` | IP de GCP |
| **A** | `www` | IP de GCP |

Espera 5–30 min. Verifica:

```bash
dig wingconcept.com +short
```

---

## Parte 5 — Conectar por SSH

Desde la consola GCP: botón **SSH** junto a la VM (abre terminal en el navegador).

O desde tu Mac (si configuraste gcloud):

```bash
gcloud compute ssh wingconcept --zone=us-central1-a
```

---

## Parte 6 — Instalar Docker

En la VM:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
exit
```

Vuelve a entrar por SSH y comprueba:

```bash
docker --version
```

---

## Parte 7 — Clonar y configurar

```bash
sudo mkdir -p /opt/wingconcept
sudo chown $USER:$USER /opt/wingconcept
git clone https://github.com/Alejdmc/WingConcept.git /opt/wingconcept
cd /opt/wingconcept
git checkout production

cp backend/.env.production.example backend/.env
nano backend/.env
```

Secrets:

```bash
openssl rand -hex 32   # SECRET_KEY
openssl rand -hex 16   # REDIS_PASSWORD
```

Mismo contenido que Oracle (Supabase, Stripe, Resend, `ALLOWED_ORIGINS`, etc.) — ver `DEPLOY_ORACLE.md` sección env.

---

## Parte 8 — Desplegar (GCP)

```bash
cd /opt/wingconcept/docker
chmod +x deploy-gcp.sh
DOMAIN=wingconcept.com CERTBOT_EMAIL=tu@email.com ./deploy-gcp.sh
```

El script:
- Crea **swap 2 GB** (necesario en 1 GB RAM para el build).
- Usa **1 worker** y límites de memoria (`docker-compose.gcp.yml`).
- Pide certificado Let's Encrypt.

**Primera vez:** puede tardar **10–20 min** en e2-micro (build lento).

Verifica:

```bash
curl -s https://wingconcept.com/health
```

---

## Parte 9 — Admin y Stripe

```bash
cd /opt/wingconcept/docker
docker compose --env-file ../backend/.env \
  -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.gcp.yml \
  exec backend python scripts/crear_admin.py
```

Stripe webhook: `https://wingconcept.com/api/v1/webhooks/stripe`

---

## Firewall GCP (si HTTP/HTTPS no responde)

Menú ☰ → **VPC network** → **Firewall** → deberían existir reglas `default-allow-http` y `default-allow-https`.

Si no, **Create firewall rule**:
- Targets: All instances
- Source: `0.0.0.0/0`
- Ports: `tcp:80`, `tcp:443`

---

## No pagar de más

- Solo **1 e2-micro** en region US free.
- Disco **≤ 30 GB** standard.
- No añadas Load Balancer, Cloud SQL ni IPs extra.
- Revisa **Billing** → **Reports** las primeras semanas.

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| Build Docker se cuelga / OOM | `./deploy-gcp.sh` crea swap; `free -h` debe mostrar swap |
| Muy lento | Normal en e2-micro; paciencia en primer build |
| Certbot falla | DNS debe apuntar a la IP antes del deploy |
| 502 | `docker compose ... logs frontend backend` |
| Quiero más RAM | Oracle A1 cuando haya capacidad, o e2-small (de pago) |

---

## Comandos útiles

```bash
# Logs
cd /opt/wingconcept/docker
docker compose --env-file ../backend/.env \
  -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.gcp.yml logs -f

# Actualizar
cd /opt/wingconcept && git pull origin production
cd docker && ./deploy-gcp.sh

# Memoria
free -h
docker stats
```

---

## Resumen

1. GCP → proyecto → **e2-micro** Ubuntu en **us-central1** (HTTP + HTTPS ✅).
2. IP estática → name.com A `@` y `www`.
3. SSH → Docker → clone `production` → `backend/.env`.
4. `./deploy-gcp.sh`
5. Stripe + admin.

**Tu Mac ya no es el servidor.**
