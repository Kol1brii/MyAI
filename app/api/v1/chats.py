import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import auth
from app.db.connection import get_db
from app.schemas.sessions import ChatSession, MessageItem, MessagesPage, SessionsPage
from app.services import chats as chat_service

router = APIRouter(prefix="/search", tags=["chats"])

SESSIONS_PAGE_SIZE = 20
MESSAGES_PAGE_SIZE = 30


def _parse_before(before: Optional[str]) -> Optional[datetime]:
    if not before:
        return None
    try:
        moment = datetime.fromisoformat(before.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 'before' timestamp format",
        )
    return moment if moment.tzinfo else moment.replace(tzinfo=timezone.utc)


@router.get("/sessions", response_model=SessionsPage, status_code=status.HTTP_200_OK)
async def sessions_history(
    before: Optional[str] = Query(default=None),
    limit: int = Query(default=SESSIONS_PAGE_SIZE, ge=1, le=100),
    current_user=Depends(auth.access_token_required),
    db: AsyncSession = Depends(get_db),
):
    sessions, has_more = await chat_service.list_sessions(
        db=db,
        user_id=uuid.UUID(current_user.sub),
        before=_parse_before(before),
        limit=limit,
    )

    oldest = sessions[-1].updated_at.isoformat() if sessions else None

    return SessionsPage(
        sessions=[ChatSession.model_validate(session) for session in sessions],
        has_more=has_more,
        before=oldest if has_more else None,
    )


@router.get("/{chat_id}", response_model=MessagesPage, status_code=status.HTTP_200_OK)
async def chat_messages(
    chat_id: uuid.UUID,
    before: Optional[str] = Query(default=None),
    limit: int = Query(default=MESSAGES_PAGE_SIZE, ge=1, le=100),
    current_user=Depends(auth.access_token_required),
    db: AsyncSession = Depends(get_db),
):
    user_id = uuid.UUID(current_user.sub)

    chat = await chat_service.get_chat(db=db, user_id=user_id, chat_id=chat_id)
    if chat is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found"
        )

    messages, has_more = await chat_service.list_messages(
        db=db, chat_id=chat_id, before=_parse_before(before), limit=limit
    )

    messages.reverse()

    oldest = messages[0].created_at.isoformat() if messages else None

    return MessagesPage(
        messages=[
            MessageItem(
                id=str(message.id),
                role=message.role,
                content=message.content,
                model=message.model_name,
                timestamp=message.created_at,
            )
            for message in messages
        ],
        has_more=has_more,
        before=oldest if has_more else None,
    )


@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat_session(
    chat_id: uuid.UUID,
    current_user=Depends(auth.access_token_required),
    db: AsyncSession = Depends(get_db),
):
    deleted = await chat_service.delete_chat(
        db=db, user_id=uuid.UUID(current_user.sub), chat_id=chat_id
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found"
        )