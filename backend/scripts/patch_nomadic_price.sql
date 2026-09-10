-- Nomadic Trike base price +$400 (4879.50 → 5329.50). Run once on production DB after deploy.
UPDATE variantes
SET precio = 5329.50, updated_at = NOW()
WHERE sku = 'NOM-BASE-001';
