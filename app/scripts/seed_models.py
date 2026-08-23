from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Models

model_list = [
  {
    "work_name": "groq/compound",
    "icon_key": "groq",
    "id": 2,
    "name": "Groq Compound",
    "provider": "groq"
  },
  {
    "work_name": "groq/compound-mini",
    "icon_key": "groq",
    "id": 3,
    "name": "Groq Compound Mini",
    "provider": "groq"
  },
  {
    "work_name": "llama-3.1-8b-instant",
    "icon_key": "meta-llama",
    "id": 4,
    "name": "Llama 3.1 8B Instant",
    "provider": "meta-llama"
  },
  {
    "work_name": "llama-3.3-70b-versatile",
    "icon_key": "meta-llama",
    "id": 5,
    "name": "Llama 3.3 70B Versatile",
    "provider": "meta-llama"
  },
  {
    "work_name": "meta-llama/llama-prompt-guard-2-22m",
    "icon_key": "meta-llama",
    "id": 7,
    "name": "Llama Prompt Guard 2 22M",
    "provider": "meta-llama"
  },
  {
    "work_name": "meta-llama/llama-prompt-guard-2-86m",
    "icon_key": "meta-llama",
    "id": 8,
    "name": "Llama Prompt Guard 2 86M",
    "provider": "meta-llama"
  },
  {
    "work_name": "openai/gpt-oss-120b",
    "icon_key": "openai",
    "id": 9,
    "name": "GPT OSS 120B",
    "provider": "openai"
  },
  {
    "work_name": "openai/gpt-oss-20b",
    "icon_key": "openai",
    "id": 10,
    "name": "GPT OSS 20B",
    "provider": "openai"
  },
  {
    "work_name": "openai/gpt-oss-safeguard-20b",
    "icon_key": "openai",
    "id": 11,
    "name": "GPT OSS Safeguard 20B",
    "provider": "openai"
  },
  {
    "work_name": "qwen/qwen3-32b",
    "icon_key": "qwen",
    "id": 12,
    "name": "Qwen3 32B",
    "provider": "qwen"
  },
  {
    "work_name": "qwen/qwen3.6-27b",
    "icon_key": "qwen",
    "id": 13,
    "name": "Qwen3.6 27B",
    "provider": "qwen"
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