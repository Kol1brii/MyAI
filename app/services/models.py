from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Models

async def all_models(db: AsyncSession):
    result = await db.execute(select(Models))
    return result.scalars().all()