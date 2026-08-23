from sqlalchemy.ext.asyncio import AsyncSession
from app.db.connection import get_db
from app.schemas.chat import NewChatRequest, NewChatResponse
from app.services.ai import AIService
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.config import auth, ServiceException
from app.db.users import Messages, Chats
from app.services.security import protected_messages
import uuid, datetime


router = APIRouter(prefix="/search", tags=["chats"])
ai = AIService()
MIN_DATE = datetime.datetime(2026, 8, 20, tzinfo=datetime.timezone.utc)


@router.get("/{chat_id}")
async def test():
    result = await ai.test()
    return result

@router.post("/", status_code=201, response_model=NewChatResponse)
async def new_chat(
    valid: NewChatRequest,
    ai: AIService = Depends(),
    user = Depends(auth.access_token_required),
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await ai.new_chat(
            user_id=uuid.UUID(user.sub), msg=valid.msg, model=valid.model, db=db
        )

        return NewChatResponse(answer=result)
    except ServiceException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/sessions", status_code=status.HTTP_200_OK)
async def chat_history(
    ai: AIService = Depends(),
    user = Depends(auth.access_token_required),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(ge=1, le=50),
    before: datetime.datetime |None = None
):
    if before and before < MIN_DATE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Date too early")
    else:
        result = await ai.chat_history(
            user_id=user.sub,
            db=db,
            limit=limit,
            before=before
        )
        return result

@router.get("/messages/{chat_id}", status_code=status.HTTP_200_OK)
async def messages_history(
    chat_id: uuid.UUID,
    ai: AIService = Depends(),
    user=Depends(auth.access_token_required),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(ge=1, le=50),
    before: datetime.datetime | None = None,
):
    if before and before < MIN_DATE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Date too early"
        )
    else:
        # Делаем проверку прав доступа к чату с помощью функции с security сервиса
        protected_messages(
            user_id=
            chat_id=
        )
        result = await ai.chat_history(
            user_id=user.sub, db=db, limit=limit, before=before
        )
        return result



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
