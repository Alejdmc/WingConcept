"""
Reenvía al admin (ADMIN_ORDER_EMAIL) los avisos de compras ya pagadas.

Solo procesa órdenes en estado pagado/procesando/enviado/entregado/error_stock.
Omite las que ya tienen admin_notified en el registro de pago.

Uso local:
  cd backend && python3 -m scripts.resend_admin_order_emails --dry-run
  cd backend && python3 -m scripts.resend_admin_order_emails

VPS (Docker):
  docker compose --env-file backend/.env -f docker/docker-compose.yml \\
    -f docker/docker-compose.prod.yml run --rm --no-deps backend \\
    python3 -m scripts.resend_admin_order_emails --dry-run

  # Una orden específica:
  python3 -m scripts.resend_admin_order_emails --orden WC-2026-0001

  # Reenviar aunque ya se haya notificado antes:
  python3 -m scripts.resend_admin_order_emails --force
"""
from __future__ import annotations

import argparse
import asyncio
import json
import sys

from scripts.bootstrap import load_backend_env

load_backend_env()

from app.config import settings
from app.database import AsyncSessionLocal
from app.services.orden_notification_service import orden_notification_service


async def _run(args: argparse.Namespace) -> int:
    if not settings.RESEND_API_KEY:
        print("ERROR: RESEND_API_KEY no está configurado en .env")
        return 1

    print(f"Admin destino: {settings.ADMIN_ORDER_EMAIL}")
    print(f"From: {settings.FROM_EMAIL}")
    if args.dry_run:
        print("Modo dry-run — no se enviarán correos.\n")

    async with AsyncSessionLocal() as db:
        summary = await orden_notification_service.reenviar_avisos_admin_ordenes_pagadas(
            db,
            dry_run=args.dry_run,
            force=args.force,
            numero_orden=args.orden,
        )

    for row in summary["detalle"]:
        accion = row["accion"]
        numero = row["numero_orden"]
        if accion == "dry_run":
            print(f"  [dry-run] {numero} — ${row['total']:,.2f} ({row['estado']})")
        elif accion == "skipped":
            print(f"  [skip] {numero} — ya notificado")
        elif accion == "sent":
            print(f"  [sent] {numero}")
        elif accion == "failed":
            print(f"  [FAIL] {numero} — revisa logs / Resend")

    print(
        f"\nResumen: {summary['total']} pagadas | "
        f"enviadas={summary['sent']} | "
        f"omitidas={summary['skipped']} | "
        f"fallidas={summary['failed']}"
    )

    if args.json:
        print(json.dumps(summary, indent=2))

    return 1 if summary["failed"] else 0


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Reenvía avisos de compra pagada al admin (backfill).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Lista órdenes que se enviarían sin mandar correos",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Reenvía aunque admin_notified ya esté marcado",
    )
    parser.add_argument(
        "--orden",
        metavar="WC-2026-0001",
        help="Solo una orden por número",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Imprime resumen JSON al final",
    )
    args = parser.parse_args()
    raise SystemExit(asyncio.run(_run(args)))


if __name__ == "__main__":
    main()
