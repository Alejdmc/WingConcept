#!/usr/bin/env bash
# Run idempotent catalog seeds inside the backend container.
# Requires COMPOSE array (see docker/update.sh).
set -euo pipefail

run_seed() {
  local name="$1"
  shift
  echo "==> $name..."
  # Seeds usan --no-deps: Redis aún no está levantado → omitir invalidación de caché.
  if ! "${COMPOSE[@]}" run --rm --no-deps \
    -e SKIP_REDIS_CACHE=1 \
    backend "$@"; then
    echo "ERROR: $name falló."
    exit 1
  fi
}

run_seed "Seed catálogo de productos (Vanguard, Nomadic, Disruptor)" \
  python3 scripts/seed_data.py

run_seed "Seed CMS y opciones del configurador" \
  python3 -m scripts.seed_cms_configurador

# Parts catalog: idempotent upsert; STOCK_RESET=0 preserves live inventory on redeploys.
if [ "${RUN_PARTS_SEED:-0}" = "1" ]; then
  run_seed "Seed catálogo /parts (repuestos y accesorios)" \
    env STOCK_RESET=0 python3 scripts/seed_parts_catalog.py
fi
