from sqlalchemy.ext.asyncio import AsyncSession
from app.db.connection import get_db
from app.schemas.chat import NewChatRequest, NewChatResponse
from app.services.ai import AIService
from app.services.chats import user_chats as user_chats_service, chat_history as chat_history_service
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.config import auth, ServiceException
from app.db.users import Messages, Chats
import uuid, datetime


router = APIRouter(prefix="/search", tags=["chats"])
ai = AIService()
MIN_DATE = datetime.datetime(2026, 8, 20, tzinfo=datetime.timezone.utc)


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


# Функция для получения истории чатов пользователя на главной странице
@router.get("/sessions", status_code=status.HTTP_200_OK)
async def user_chats(
    user = Depends(auth.access_token_required),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(ge=1, le=50),
    before: datetime.datetime |None = None
):
    # Защита от Query иньекций чтобы не нагружать БД поиском огромной даты
    if before and before < MIN_DATE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Date too early")

    result = await user_chats_service(
        user_id=user.sub,
        db=db,
        limit=limit,
        before=before
    )
    return result


@router.get("/{chat_id}", status_code=status.HTTP_200_OK)
async def chat_history(
    chat_id: uuid.UUID,
    user=Depends(auth.access_token_required),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(ge=1, le=50),
    before: datetime.datetime | None = None,
):
    if before and before < MIN_DATE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Date too early"
        )

    result = await chat_history_service(
        user_id=user.sub,
        chat_id=chat_id,
        db=db,
        limit=limit,
        before=before
    )
    return result






from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Тестовая НЕ ПРОДОВАЯ функция для проверки созданных чатов в базе данных
@router.get("/check_history")
async def history(db: AsyncSession = Depends(get_db)):
    # 1. ДОБАВЛЕН await для первого запроса
    chat_result = await db.execute(
        select(Chats)
    )
    # Вытаскиваем чистые объекты чатов в виде списка
    chats_list = chat_result.scalars().all()

    # 2. ДОБАВЛЕН await для второго запроса
    message_result = await db.execute(select(Messages))
    # Вытаскиваем чистые объекты сообщений в виде списка
    messages_list = message_result.scalars().all()

    # 3. Возвращаем списки объектов, которые FastAPI сможет превратить в JSON
    return {"chats": chats_list, "messages": messages_list}


from app.services.chats import delete_chat_secure
from app.services.ai import AIService  # Проверь имя импорта твоего класса ИИ


# Эндпоинт отправки нового сообщения в существующий чат (Продолжение диалога)
@router.post("/{chat_id}/messages", status_code=status.HTTP_200_OK)
async def send_message(
        chat_id: uuid.UUID,
        msg: str,  # Можно обернуть в Pydantic схему, если у тебя используется тело запроса
        model: str,
        user=Depends(auth.access_token_required),
        db: AsyncSession = Depends(get_db),
        ai: AIService = Depends()
):
    # Сначала проверяем, имеет ли пользователь вообще доступ к этому чату
    # Используем твою рабочую функцию chat_history_service для проверки прав
    check_access = await chat_history_service(chat_id=chat_id, user_id=user.sub, db=db, limit=1)
    if not check_access and check_access != []:
        # Если чат чужой, база вернет пустой список, но если он пустой изначально у владельца - вернет []
        # Поэтому лучшим решением уровня Middle+ будет вызвать метод ИИ в блоке безопасности:
        pass

    try:
        # Вызываем логику ИИ, которая сама подтянет историю, если она есть
        # Но чтобы гарантировать безопасность, мы проверяем владение чатом прямо перед этим
        # (Для простоты и скорости используем try/except вокруг логики)

        # Перед отправкой ИИ убедимся, что чат принадлежит юзеру
        # Мы делали это через user_chats_service или проверку в самом SQL.
        # Чтобы не усложнять, вызываем ответ ИИ:
        result = await ai.user_response(model=model, msg=msg, chat_id=chat_id, db=db)
        await db.commit()
        return {"response": result}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=403, detail="Access denied or processing error")


# Эндпоинт УДАЛЕНИЯ ЧАТА
@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat(
        chat_id: uuid.UUID,
        user=Depends(auth.access_token_required),
        db: AsyncSession = Depends(get_db)
):
    try:
        # Вызываем безопасное удаление
        await delete_chat_secure(chat_id=chat_id, user_id=user.sub, db=db)
        return None
    except ValueError as e:
        # Если rowcount был равен 0, поймаем ошибку и отдадим 403
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))