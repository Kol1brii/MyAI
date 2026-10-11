from datetime import datetime, timezone, timedelta
from sqlalchemy import select, desc, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.db.users import Chats, Messages
import uuid_utils, uuid, datetime


async def user_chats(
        user_id: uuid.UUID,
        db: AsyncSession,
        limit: int,
        before: datetime.datetime | None = None,
):
    # before необходим для фильтрации сообщений по дате
    if before:
        stmt = (
            select(Chats)
            .where(Chats.user_id == user_id)
            # Фильтрация по дате
            .where(Chats.created_at < before)
            .order_by(desc(Chats.created_at))
            .limit(limit)
        )
    else:
        stmt = (
            select(Chats)
            .where(Chats.user_id == user_id)
            .order_by(desc(Chats.created_at))
            .limit(limit)
        )

    raw_result = await db.execute(stmt)

    return raw_result.scalars().all()

async def chat_history(
        user_id: uuid.UUID,
        chat_id: uuid.UUID,
        db: AsyncSession,
        limit: int,
        before: datetime.datetime | None = None,
):
    if before:
        stmt = (
            select(Messages)
            .join(Chats, Messages.chat_id == Chats.id)
            .where(Messages.chat_id == chat_id)
            .where(Chats.user_id == user_id)
            # Фильтрация по дате
            .where(Messages.created_at < before)
            .order_by(desc(Messages.created_at))
            .limit(limit)
        )
    else:
        stmt = (
            select(Messages)
            .join(Chats, Messages.chat_id == Chats.id)
            .where(Messages.chat_id == chat_id)
            .where(Chats.user_id == user_id)
            .order_by(desc(Messages.created_at))
            .limit(limit)
        )
    raw_result = await db.execute(stmt)

    return raw_result.scalars().all()


async def delete_chat_secure(chat_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession) -> None:
    # Удалить, если совпал id чата и текущий пользователь является владельцем
    stmt = (
        delete(Chats)
        .where(Chats.id == chat_id)
        .where(Chats.user_id == user_id)
    )

    result = await db.execute(stmt)
    await db.commit()

    if result.rowcount == 0:
        raise ValueError("Chat not found or access denied")
