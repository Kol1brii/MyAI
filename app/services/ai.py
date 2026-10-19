import uuid
from openai import AsyncOpenAI
from dotenv import load_dotenv
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
import os

from app.db.chats import Messages

class AIService:
    def __init__(self):
        load_dotenv()
        self.client = AsyncOpenAI(
            base_url=os.getenv("AI_BASE_URL"),
            api_key=os.getenv("AI_API_KEY")
        )
        self.history = []

    async def user_response(self, model: str, chat_id: uuid.UUID, db: AsyncSession):
        # Берём последние 20 сообщений чата, чтобы у модели был контекст диалога.
        # Текущая реплика пользователя к этому моменту уже сохранена в БД (см. api/v1/base.new_chat).
        stmt = (
            select(Messages)
            .where(Messages.chat_id == chat_id)
            .order_by(desc(Messages.created_at), desc(Messages.id))
            .limit(20)
        )
        result = await db.execute(stmt)
        db_messages = list(result.scalars())
        db_messages.reverse()

        history = [{"role": m.role, "content": m.content} for m in db_messages]

        response = await self.client.chat.completions.create(
            model=model,
            messages=history,
        )
        answer_text = response.choices[0].message.content
        return answer_text