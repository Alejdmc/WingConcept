# 🗄️ PREPARACIÓN DE BASE DE DATOS — WingConcept
**Fecha:** 1 de julio de 2026  
**Estado:** ⏸️ ESPERANDO DECISIÓN DEL CLIENTE

---

## 📋 OPCIONES DE BASE DE DATOS

El cliente debe elegir entre:

### Opción A: Supabase (Managed PostgreSQL) 🌐
**Ventajas:**
- ✅ Setup en 5 minutos
- ✅ Backups automáticos incluidos
- ✅ Storage integrado (imágenes, modelos 3D)
- ✅ Panel gráfico para visualizar datos
- ✅ SSL/TLS incluido por defecto
- ✅ Escalado automático
- ✅ Free tier generoso (500 MB DB + 1 GB Storage)

**Desventajas:**
- ❌ Costo a largo plazo si escala mucho
- ❌ Vendor lock-in parcial (Storage API específico)
- ❌ Latencia si servidor está fuera de región

**Costo estimado:**
- **Free:** Hasta 500 MB + 1 GB storage
- **Pro:** $25/mes (8 GB DB + edge functions + 100 GB storage)
- **Producción:** ~$25-$50/mes inicialmente

---

### Opción B: Servidor Propio PostgreSQL 🖥️
**Ventajas:**
- ✅ Control total sobre configuración
- ✅ Costo predecible (servidor fijo)
- ✅ Sin vendor lock-in
- ✅ Mejor para compliance específico
- ✅ Posibilidad de optimizar queries

**Desventajas:**
- ❌ Requiere setup manual (~2 horas)
- ❌ Backups manuales/scripts
- ❌ Mantenimiento (actualizaciones, seguridad)
- ❌ Requiere monitoreo activo
- ❌ Escalado manual

**Costo estimado:**
- **VPS básico:** $10-$20/mes (DigitalOcean, Linode, Hetzner)
- **Dedicado:** $50-$100/mes
- **Tiempo dev:** 2-4 horas setup inicial + mantenimiento mensual

---

## 🚀 SETUP RÁPIDO — OPCIÓN A: SUPABASE

### Paso 1: Crear proyecto (5 minutos)

1. Ir a https://app.supabase.com
2. Crear cuenta o login
3. **"New Project"**:
   - Nombre: `wingconcept-production`
   - Password DB: Generar segura y guardar
   - Region: `South America (São Paulo)` o más cercana
4. Esperar ~2 minutos (aprovisionamiento automático)

### Paso 2: Obtener credenciales (2 minutos)

**Panel → Settings → Database:**
```bash
# Copiar "Connection string - Async"
DATABASE_URL=postgresql+asyncpg://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

**Panel → Settings → API:**
```bash
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_SERVICE_KEY=eyJhbG...  # service_role key (secreto)
SUPABASE_ANON_KEY=eyJhbG...     # anon key (público)
```

### Paso 3: Crear buckets de storage (3 minutos)

**Panel → Storage → Create bucket:**

1. **Bucket: productos**
   - Public: ✅ Yes
   - File size limit: 10 MB
   - Allowed MIME types: `image/jpeg,image/png,image/webp`

2. **Bucket: modelos3d**
   - Public: ✅ Yes
   - File size limit: 50 MB
   - Allowed MIME types: `model/gltf-binary,model/gltf+json`

### Paso 4: Configurar .env (1 minuto)

```bash
cd backend
nano .env

# Pegar valores copiados:
DATABASE_URL=postgresql+asyncpg://...
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
```

### Paso 5: Ejecutar migraciones (2 minutos)

```bash
# Generar migración inicial
alembic revision --autogenerate -m "initial_schema"

# Revisar el archivo generado en alembic/versions/

# Aplicar migración
alembic upgrade head

# Verificar en Supabase → Table Editor
# Debe ver: usuarios, productos, variantes, ordenes, pagos, carritos, direcciones_envio, configuraciones
```

### Paso 6: Crear usuario admin (1 minuto)

```bash
ADMIN_EMAIL=admin@wingconcept.com \
ADMIN_PASSWORD=TuPasswordSeguro123! \
python scripts/crear_admin.py
```

**Total tiempo Supabase:** ~15 minutos ✅

---

## 🖥️ SETUP COMPLETO — OPCIÓN B: SERVIDOR PROPIO

### Requisitos previos:
- VPS con Ubuntu 22.04 LTS (mínimo 2 GB RAM)
- Acceso SSH root
- Dominio apuntado al servidor

### Paso 1: Instalar PostgreSQL 15 (10 minutos)

```bash
# Conectar al servidor
ssh root@tu-servidor.com

# Actualizar sistema
apt update && apt upgrade -y

# Instalar PostgreSQL 15
apt install -y postgresql-15 postgresql-contrib

# Verificar instalación
systemctl status postgresql

# Cambiar a usuario postgres
sudo -u postgres psql
```

**En psql:**
```sql
-- Crear base de datos
CREATE DATABASE wingconcept;

-- Crear usuario
CREATE USER wingconcept_user WITH ENCRYPTED PASSWORD 'GENERAR_PASSWORD_SEGURO';

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE wingconcept TO wingconcept_user;

-- Habilitar extensiones necesarias
\c wingconcept
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Salir
\q
```

### Paso 2: Configurar acceso remoto (5 minutos)

**Editar `postgresql.conf`:**
```bash
nano /etc/postgresql/15/main/postgresql.conf

# Buscar y cambiar:
listen_addresses = '*'  # En lugar de 'localhost'
```

**Editar `pg_hba.conf`:**
```bash
nano /etc/postgresql/15/main/pg_hba.conf

# Agregar al final (CAMBIAR 0.0.0.0/0 por IP específica en producción):
host    wingconcept    wingconcept_user    0.0.0.0/0    scram-sha-256
```

**Reiniciar PostgreSQL:**
```bash
systemctl restart postgresql

# Verificar puerto abierto
ss -tuln | grep 5432
```

### Paso 3: Firewall (2 minutos)

```bash
# Permitir PostgreSQL (solo si usas UFW)
ufw allow 5432/tcp

# O mejor: permitir solo desde IP del servidor backend
ufw allow from TU_IP_BACKEND to any port 5432
```

### Paso 4: SSL/TLS (10 minutos — OBLIGATORIO EN PRODUCCIÓN)

```bash
# Instalar certbot
apt install -y certbot

# Generar certificados (requiere dominio apuntado)
certbot certonly --standalone -d db.wingconcept.com

# Copiar certificados para PostgreSQL
cp /etc/letsencrypt/live/db.wingconcept.com/fullchain.pem /var/lib/postgresql/15/server.crt
cp /etc/letsencrypt/live/db.wingconcept.com/privkey.pem /var/lib/postgresql/15/server.key
chown postgres:postgres /var/lib/postgresql/15/server.*
chmod 600 /var/lib/postgresql/15/server.key

# Editar postgresql.conf
nano /etc/postgresql/15/main/postgresql.conf

# Agregar:
ssl = on
ssl_cert_file = '/var/lib/postgresql/15/server.crt'
ssl_key_file = '/var/lib/postgresql/15/server.key'

# Reiniciar
systemctl restart postgresql
```

### Paso 5: Backups automáticos (15 minutos)

**Crear script de backup:**
```bash
nano /root/backup_wingconcept.sh
```

**Contenido:**
```bash
#!/bin/bash
BACKUP_DIR="/root/backups/db"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="wingconcept"

mkdir -p $BACKUP_DIR

# Backup completo
sudo -u postgres pg_dump $DB_NAME | gzip > $BACKUP_DIR/wingconcept_$DATE.sql.gz

# Mantener solo últimos 7 días
find $BACKUP_DIR -name "wingconcept_*.sql.gz" -mtime +7 -delete

echo "Backup completado: wingconcept_$DATE.sql.gz"
```

**Hacer ejecutable y automatizar:**
```bash
chmod +x /root/backup_wingconcept.sh

# Agregar a crontab (diario a las 3 AM)
crontab -e

# Agregar línea:
0 3 * * * /root/backup_wingconcept.sh >> /var/log/wingconcept_backup.log 2>&1
```

### Paso 6: Monitoreo (10 minutos)

**Instalar pgAdmin (opcional):**
```bash
# En tu máquina local, no en el servidor
# Descargar: https://www.pgadmin.org/download/
```

**O instalar Prometheus + Grafana (avanzado):**
```bash
# Exportador PostgreSQL
apt install -y prometheus-postgres-exporter
```

### Paso 7: Storage para imágenes (20 minutos)

**Opción 1: MinIO (S3-compatible, self-hosted)**
```bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=GENERAR_PASSWORD_SEGURO" \
  -v /mnt/storage/minio:/data \
  minio/minio server /data --console-address ":9001"

# Crear buckets: productos, modelos3d
# Acceder a http://tu-servidor.com:9001
```

**Opción 2: Usar Supabase Storage solo (híbrido)**
- BD en servidor propio
- Storage en Supabase (free tier)
- Mejor de ambos mundos

### Paso 8: Configurar .env (1 minuto)

```bash
cd backend
nano .env

DATABASE_URL=postgresql+asyncpg://wingconcept_user:PASSWORD@db.wingconcept.com:5432/wingconcept

# Si usas MinIO:
SUPABASE_URL=http://tu-servidor.com:9000
SUPABASE_SERVICE_KEY=TU_ACCESS_KEY_MINIO
```

### Paso 9: Ejecutar migraciones (2 minutos)

*(Igual que Supabase — ver Paso 5 arriba)*

**Total tiempo servidor propio:** ~2-3 horas (incluye aprendizaje) ⚠️

---

## 📊 COMPARACIÓN RÁPIDA

| Característica | Supabase | Servidor Propio |
|---------------|----------|-----------------|
| **Setup inicial** | 15 min | 2-3 horas |
| **Backups** | Automáticos | Script manual (15 min) |
| **Storage** | Incluido (1 GB free) | MinIO o externo (+30 min) |
| **SSL/TLS** | Incluido | Manual (10 min) |
| **Escalado** | Automático | Manual |
| **Monitoreo** | Panel incluido | Prometheus/Grafana (+1 hora) |
| **Costo mensual** | $25-$50 | $10-$20 VPS |
| **Mantenimiento** | 0 horas/mes | 2-4 horas/mes |
| **Costo total 1er año** | $300-$600 | $120-$240 + ~10 horas dev |

---

## 🎯 RECOMENDACIÓN

### Para MVP/Lanzamiento rápido:
🟢 **SUPABASE**
- Setup en 15 minutos
- Cero mantenimiento
- Backups automáticos
- Ideal para validar producto

### Para escala grande (>10k usuarios):
🟡 **Servidor Propio**
- Control total
- Costo predecible
- Mejor performance tuneando queries
- Requiere equipo DevOps

### Solución híbrida (RECOMENDACIÓN):
🔵 **SUPABASE BD + MinIO/S3 Storage**
- BD en Supabase (managed, confiable)
- Storage en MinIO self-hosted (más barato a escala)
- Lo mejor de ambos mundos

---

## ✅ PRÓXIMOS PASOS

1. **Cliente decide:** Supabase vs Servidor Propio
2. **Ejecutar setup** correspondiente (15 min vs 3 horas)
3. **Ejecutar migración inicial:** `alembic upgrade head`
4. **Crear usuario admin:** `python scripts/crear_admin.py`
5. **Seed data (opcional):** `python scripts/seed_data.py`
6. **Verificar conexión:** `curl http://localhost:8000/health`
7. **Deploy backend:** Docker Compose con variables configuradas

---

## 📚 RECURSOS ADICIONALES

**Supabase:**
- Docs: https://supabase.com/docs
- Pricing: https://supabase.com/pricing
- Status: https://status.supabase.com

**PostgreSQL:**
- Docs: https://www.postgresql.org/docs/15/
- Tuning: https://pgtune.leopard.in.ua/
- Monitoring: https://www.pgadmin.org/

**MinIO (Storage):**
- Docs: https://min.io/docs/minio/
- S3-compatible API

---

**Equipo:** ZomiDev  
**Última actualización:** 1 de julio de 2026

