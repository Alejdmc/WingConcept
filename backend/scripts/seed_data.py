"""Script para insertar datos de prueba en la base de datos."""
import psycopg2
import uuid

conn = psycopg2.connect('dbname=wingconcept user=alecito host=localhost')
cur = conn.cursor()

disruptor_id = 'afcfd5fd-23cd-443c-90cf-6b64f4bd182c'
ipro_id = str(uuid.uuid4())
trike_id = str(uuid.uuid4())

# ── Variante Disruptor ──────────────────────────────────────────
cur.execute("""
INSERT INTO variantes (id, producto_id, nombre, sku, precio, stock, stock_minimo, atributos, activo, es_principal, created_at, updated_at)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, true, true, NOW(), NOW())
ON CONFLICT (sku) DO NOTHING
""", (str(uuid.uuid4()), disruptor_id, 'Disruptor Standard', 'DISC-STD-001',
      5000.00, 5, 1, '{"motor": "Vittorazi Moster 185", "peso_kg": 28, "empuje_kg": 95}'))

# ── Producto I-Pro ──────────────────────────────────────────────
cur.execute("""
INSERT INTO productos (id, nombre, slug, descripcion, descripcion_corta, categoria, subcategoria, imagenes, activo, destacado, orden_display, created_at, updated_at)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, true, true, 2, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING
""", (ipro_id, 'I-Pro', 'i-pro',
      'El I-Pro redefine lo que significa volar ligero. Materiales de ultima generacion con rendimiento profesional.',
      'Next-gen lightweight design', 'paramotors', 'lightweight',
      ['/images/ipro_ejemplo.PNG']))

cur.execute("""
INSERT INTO variantes (id, producto_id, nombre, sku, precio, stock, stock_minimo, atributos, activo, es_principal, created_at, updated_at)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, true, true, NOW(), NOW())
ON CONFLICT (sku) DO NOTHING
""", (str(uuid.uuid4()), ipro_id, 'I-Pro Standard', 'IPRO-STD-001',
      5200.00, 3, 1, '{"motor": "Vittorazi Moster 185 Plus", "peso_kg": 26, "empuje_kg": 90}'))

# ── Producto Paramotor Trike ────────────────────────────────────
cur.execute("""
INSERT INTO productos (id, nombre, slug, descripcion, descripcion_corta, categoria, subcategoria, imagenes, activo, destacado, orden_display, created_at, updated_at)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, true, true, 3, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING
""", (trike_id, 'Paramotor Trike', 'paramotor-trike',
      'El Trike ofrece estabilidad para vuelos de larga distancia. Ideal para pilotos que buscan comodidad y autonomia.',
      'Stable ride & long-range flights', 'paratrike', None,
      ['/images/paramotor_trike_ejemplo.PNG']))

cur.execute("""
INSERT INTO variantes (id, producto_id, nombre, sku, precio, stock, stock_minimo, atributos, activo, es_principal, created_at, updated_at)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, true, true, NOW(), NOW())
ON CONFLICT (sku) DO NOTHING
""", (str(uuid.uuid4()), trike_id, 'Trike Standard', 'TRIK-STD-001',
      1350.00, 8, 1, '{"peso_kg": 40, "empuje_kg": 110, "asientos": 1}'))

# ── Promover admin ──────────────────────────────────────────────
cur.execute("UPDATE usuarios SET rol='admin' WHERE email='admin@wingconcept.com' RETURNING email, rol")
row = cur.fetchone()
if row:
    print(f"Usuario promovido a admin: {row[0]} -> {row[1]}")

conn.commit()
cur.close()
conn.close()
print("✅ Seed completado: 3 productos + variantes insertados")

