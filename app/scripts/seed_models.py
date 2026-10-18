from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Models

model_list = [
    {
        "work_name": "openai/gpt-oss-20b",
        "icon_key": "openai",
        "id": 1,
        "name": "GPT OSS 20B",
        "provider": "openai",
    },
    {
        "work_name": "openai/gpt-oss-120b",
        "icon_key": "openai",
        "id": 2,
        "name": "GPT OSS 120B",
        "provider": "openai",
    },
    {
        "work_name": "qwen/qwen3.8-27b",
        "icon_key": "qwen",
        "id": 3,
        "name": "Qwen 27B",
        "provider": "qwen",
    }
]


async def seed_models(db: AsyncSession):
    result = await db.execute(select(Models))
    if result.scalars().all():
        return
    else:
        for i in model_list:
            db.add(Models(**i))
        await db.commit()
