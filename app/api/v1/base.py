"""
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.connection import get_db
from app.schemas.chat import NewChatRequest, NewChatResponse
from app.services.ai import AIService
from fastapi import APIRouter, Depends, HTTPException, status
from app.config import auth, ServiceException
from app.db.users import Messages, Chats
import uuid

router = APIRouter(tags=["chats"])


@router.post("/", status_code=201, response_model=NewChatResponse)
async def new_chat(
    valid: NewChatRequest,
    ai: AIService = Depends(),
    current_user=Depends(auth.access_token_required),
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await ai.new_chat(
            user_id=uuid.UUID(current_user.sub), msg=valid.msg, model=valid.model, db=db
        )
        return NewChatResponse(answer=result)
    except ServiceException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


@router.get("/check_history")
async def history(
    current_user=Depends(auth.access_token_required), db: AsyncSession = Depends(get_db)
):
    # 1. ДОБАВЛЕН await для первого запроса
    chat_result = await db.execute(
        select(Chats).where(
            Chats.user_id == current_user.sub
        )  # лучше сразу фильтровать по юзеру
    )
    # Вытаскиваем чистые объекты чатов в виде списка
    chats_list = chat_result.scalars().all()

    # 2. ДОБАВЛЕН await для второго запроса
    message_result = await db.execute(select(Messages))
    # Вытаскиваем чистые объекты сообщений в виде списка
    messages_list = message_result.scalars().all()

    # 3. Возвращаем списки объектов, которые FastAPI сможет превратить в JSON
    return {"chats": chats_list, "messages": messages_list}
"""
