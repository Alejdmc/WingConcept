#!/usr/bin/env bash
# Attach wingconcept_nginx to the same Docker network as backend/frontend.
# Needed when nginx was created by an older compose project and new app
# containers landed on a different wingnet instance.

reconnect_nginx_to_app_network() {
  if ! docker inspect wingconcept_nginx >/dev/null 2>&1; then
    echo "==> nginx no existe — se creará con compose"
    return 1
  fi

  if ! docker inspect wingconcept_backend >/dev/null 2>&1; then
    echo "ERROR: wingconcept_backend no existe — levántalo antes de recargar nginx"
    return 1
  fi

  local app_network
  app_network="$(
    docker inspect wingconcept_backend \
      --format '{{range $name, $_ := .NetworkSettings.Networks}}{{printf "%s\n" $name}}{{end}}' \
      | head -n 1
  )"

  if [ -z "$app_network" ]; then
    echo "ERROR: backend no está conectado a ninguna red Docker"
    return 1
  fi

  local nginx_networks
  nginx_networks="$(
    docker inspect wingconcept_nginx \
      --format '{{range $name, $_ := .NetworkSettings.Networks}}{{printf "%s " $name}}{{end}}'
  )"

  if [[ "$nginx_networks" != *"$app_network"* ]]; then
    echo "==> Conectando nginx a la red de la app ($app_network)..."
    docker network connect "$app_network" wingconcept_nginx
  else
    echo "==> nginx ya está en la red $app_network"
  fi

  if docker exec wingconcept_nginx getent hosts backend >/dev/null 2>&1; then
    echo "==> nginx resuelve backend OK"
    return 0
  fi

  echo "ERROR: nginx sigue sin resolver backend — revisa redes Docker"
  return 1
}

reload_wingconcept_nginx() {
  reconnect_nginx_to_app_network || return 1
  docker exec wingconcept_nginx nginx -t
  docker exec wingconcept_nginx nginx -s reload
}
