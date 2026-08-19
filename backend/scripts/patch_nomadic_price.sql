-- Nomadic Trike base price +$500 (4379.50 → 4879.50). Run once on production DB after deploy.
UPDATE variantes
SET precio = 4879.50, updated_at = NOW()
WHERE sku = 'NOM-BASE-001';
