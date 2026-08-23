from sqlalchemy.exc import IntegrityError
from openai import AsyncOpenAI
from dotenv import load_dotenv
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.users import Chats, Messages
from app.config import ServiceException
import uuid_utils, os, uuid, datetime


class AIService:
    def __init__(self):
        load_dotenv()
        self.client = AsyncOpenAI(
            base_url=os.getenv("AI_BASE_URL"), api_key=os.getenv("AI_API_KEY")
        )
        self.history = []

    async def test(self):
        return {
            "status": "success",
            "message": "Работаем!",
        }

    async def chat_history(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        limit: int,
        before: datetime.datetime | None = None,
    ):
        stmt = (
            select(Chats.id)
            .where(Chats.user_id == user_id)
            .order_by(desc(Chats.created_at))
            .limit(limit)
        )
        if before:
            stmt = stmt.where(Chats.created_at < before)

        raw_result = await db.execute(stmt)

        return raw_result.scalars().all()

    async def new_chat(
        self, user_id: uuid.UUID, model: str, msg: str, db: AsyncSession
    ):
        title = msg[:35]
        chat_id = uuid.UUID(bytes=uuid_utils.uuid7().bytes)

        result = Chats(id=chat_id, user_id=user_id, title=title, model_name=model)

        try:
            db.add(result)
            await db.flush()
            response = await self.user_response(
                model=model, msg=msg, db=db, chat_id=chat_id
            )
            await db.commit()
            return response
        except Exception as e:
            await db.rollback()
            raise ServiceException(message=f"Failed create to chat: {e}")

    async def user_response(
        self, model: str, msg: str, chat_id: uuid.UUID, db: AsyncSession
    ):
        stmt = (
            select(Messages)
            .where(Messages.chat_id == chat_id)
            .order_by(Messages.created_at.asc())
        )
        result = await db.execute(stmt)
        history = []
        for i in result.scalars():
            mes = {"role": i.role, "content": i.content}
            history.append(mes)
        message = {"role": "user", "content": msg}
        history.append(message)

        response = await self.client.chat.completions.create(
            model=model, messages=history
        )

        answer_text = response.choices[0].message.content

        user_message = Messages(
            id=uuid.UUID(bytes=uuid_utils.uuid7().bytes),
            chat_id=chat_id,
            role="user",
            content=msg,
            model_name=model,
        )
        ai_message = Messages(
            id=uuid.UUID(bytes=uuid_utils.uuid7().bytes),
            chat_id=chat_id,
            role="assistant",
            content=response.choices[0].message.content,
            model_name=model,
        )

        db.add(user_message)
        db.add(ai_message)

        return answer_text
