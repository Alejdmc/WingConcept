#!/usr/bin/env bash
# Remove WingConcept containers with fixed container_name values.
# Orphan instances block `docker compose up` when compose lost track of them
# (e.g. project directory or compose project name changed on the VPS).
#
# wingconcept_nginx is excluded by default: on this VPS it also reverse-proxies
# other projects on 80/443. Recreating it causes brief downtime for every site.

WINGCONCEPT_CONTAINER_NAMES=(
  wingconcept_backend
  wingconcept_redis
  wingconcept_frontend
  wingconcept_certbot
)

# Only use when nginx itself is the conflicting container.
WINGCONCEPT_CONTAINER_NAMES_WITH_NGINX=(
  "${WINGCONCEPT_CONTAINER_NAMES[@]}"
  wingconcept_nginx
)

cleanup_stale_wingconcept_containers() {
  local include_nginx="${1:-false}"
  local names=("${WINGCONCEPT_CONTAINER_NAMES[@]}")
  if [ "$include_nginx" = true ]; then
    names=("${WINGCONCEPT_CONTAINER_NAMES_WITH_NGINX[@]}")
  fi

  local removed=false
  for name in "${names[@]}"; do
    if docker inspect "$name" >/dev/null 2>&1; then
      echo "==> Eliminando contenedor previo ($name)..."
      docker rm -f "$name"
      removed=true
    fi
  done
  if [ "$removed" = false ]; then
    echo "==> No hay contenedores wingconcept_* huérfanos (nginx omitido)"
  fi
}
