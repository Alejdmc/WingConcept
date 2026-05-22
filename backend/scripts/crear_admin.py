"""
WingConcept Backend — Script para crear un usuario admin inicial
Uso: python scripts/crear_admin.py
"""
import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()

from app.database import AsyncSessionLocal
from app.models.usuario import Usuario
from app.core.security import hash_password
from sqlalchemy import select


async def crear_admin():
    # CONFIGURAR estos valores antes de ejecutar
    EMAIL = os.getenv("ADMIN_EMAIL", "admin@wingconcept.com")
    PASSWORD = os.getenv("ADMIN_PASSWORD", "")
    NOMBRE = os.getenv("ADMIN_NOMBRE", "Admin")
    APELLIDO = os.getenv("ADMIN_APELLIDO", "WingConcept")

    if not PASSWORD:
        print("❌ Debe definir ADMIN_PASSWORD como variable de entorno")
        return

    if AsyncSessionLocal is None:
        print("❌ DATABASE_URL no configurado en .env")
        return

    async with AsyncSessionLocal() as db:
        existe = await db.execute(select(Usuario).where(Usuario.email == EMAIL))
        if existe.scalar_one_or_none():
            print(f"⚠️  Ya existe un usuario con el email: {EMAIL}")
            return

        admin = Usuario(
            email=EMAIL,
            nombre=NOMBRE,
            apellido=APELLIDO,
            hashed_password=hash_password(PASSWORD),
            rol="admin",
            activo=True,
            email_verificado=True,
        )
        db.add(admin)
        await db.commit()
        print(f"✅ Admin creado: {EMAIL}")


if __name__ == "__main__":
    asyncio.run(crear_admin())

