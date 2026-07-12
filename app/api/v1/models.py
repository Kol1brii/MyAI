from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.models import all_models
from app.db.connection import get_db

router = APIRouter(prefix="/models", tags=["models"])

@router.get("/", status_code=200)
async def models_list(db: AsyncSession = Depends(get_db)):
    result = await all_models(db=db)
    return result