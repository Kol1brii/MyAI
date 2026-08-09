from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.users import Users

user_list = [
    {
    "work_name": "allam-2-7b",
    "icon_key": "groq",
    "id": 1,
    "name": "Allam 2 7B",
    "provider": "groq"
  }
]

async def seed_users(db: AsyncSession):
    result = await db.execute(select(Users))
    if result.scalars().all():
        return
    else:
        for i in user_list:
            db.add(Users(**i))
        await db.commit()