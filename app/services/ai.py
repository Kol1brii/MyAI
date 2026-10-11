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
        # 1. Достаем последние 20 сообщений этого чата (сортируем desc, чтобы взять самые свежие)
        stmt = (
            select(Messages)
            .where(Messages.chat_id == chat_id)
            .order_by(desc(Messages.created_at))
            .limit(20)
        )
        result = await db.execute(stmt)

        # 2. Так как мы взяли их с конца, их нужно перевернуть обратно (asc),
        # чтобы ИИ читал диалог в правильном порядке, а не задом наперед
        db_messages = list(result.scalars())
        db_messages.reverse()

        history = []
        for i in db_messages:
            history.append({"role": i.role, "content": i.content})

        # 3. Добавляем новое сообщение пользователя в конец контекста
        history.append({"role": "user", "content": msg})

        # Send to OpenAI
        response = await self.client.chat.completions.create(
            model=model, messages=history
        )

        answer_text = response.choices[0].message.content

        # 4. Сохраняем обе реплики в БД
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
            content=answer_text,
            model_name=model,
        )

        db.add(user_message)
        db.add(ai_message)

        return answer_text