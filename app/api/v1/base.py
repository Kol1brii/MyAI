import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import auth
from app.db.connection import get_db
from app.schemas.chat import NewChatRequest, NewChatResponse
from app.services import chats as chat_service
from app.services.ai import AIService

router = APIRouter(tags=["chats"])


@router.post("/", status_code=201, response_model=NewChatResponse)
async def new_chat(
    valid: NewChatRequest,
    ai: AIService = Depends(),
    current_user=Depends(auth.access_token_required),
    db: AsyncSession = Depends(get_db),
):
    try:
        chat = await chat_service.get_or_create_chat(
            db=db,
            user_id=uuid.UUID(current_user.sub),
            chat_id=valid.id,
            model=valid.model,
            first_message=valid.msg,
        )
    except chat_service.ChatAccessError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found"
        )

    # Сохраняем сообщение, даже если сервис будет недоступен
    await chat_service.add_message(
        db=db, chat=chat, role="user", content=valid.msg, model_name=valid.model
    )
    await db.commit()

    try:
        answer = await ai.user_response(model=valid.model, chat_id=chat.id, db=db)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI provider error: {exc}",
        )

    await chat_service.add_message(
        db=db, chat=chat, role="assistant", content=answer, model_name=valid.model
    )
    await db.commit()

    return NewChatResponse(answer=answer, chat_id=chat.id)
