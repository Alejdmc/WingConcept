"""
WingConcept Backend — Dealers públicos
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.dealer import DealerResponse
from app.services.dealer_service import dealer_service

router = APIRouter(prefix="/dealers", tags=["Dealers"])


@router.get("", response_model=list[DealerResponse])
async def listar_dealers(db: AsyncSession = Depends(get_db)):
    return await dealer_service.listar_publico(db)
