from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Models


"""
Данный скрипт необходим для того, чтобы добавлять AI модели в список доступных, прямо на сайт.
В готовом шаблоне используются стабильные бесплатные модели из openrouter, обратите внимание на то что некоторые из них
могут быть временно недоступны со стороны провайдера.

В ином случае если вы используете groq.com, то раскоментируйте строку ниже.

    {
        "work_name": "openrouter/free", - Рабочее имя для обращения к API [см. app/services/ai.py]
        "icon_key": "openrouter", - Наименование иконки для фронтенда [см. frontend/src/assets/icons/]
        "id": 1, - Id для БД
        "name": "Auto Free Router", - Название, отображаемое на фронтенде
        "provider": "openrouter", - Название провайдера для БД
    },

"""
# openrouter.ai
model_list = [
    {
        "work_name": "openrouter/free",
        "icon_key": "openrouter",
        "id": 1,
        "name": "Auto Free Router",
        "provider": "openrouter",
    },
    {
        "work_name": "nvidia/nemotron-3.5-lightning",
        "icon_key": "nvidia",
        "id": 2,
        "name": "Nemotron 3.5 Lightning",
        "provider": "nvidia",
    },
    {
        "work_name": "meta-llama/llama-3.1-8b-instruct",
        "icon_key": "meta-llama",
        "id": 3,
        "name": "Meta Llama 3.1 8B",
        "provider": "meta",
    },
]

# groq.com
"""
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
"""


async def seed_models(db: AsyncSession):
    result = await db.execute(select(Models))
    if result.scalars().all():
        return
    else:
        for i in model_list:
            db.add(Models(**i))
        await db.commit()
