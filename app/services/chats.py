import datetime
import uuid
from typing import Optional

from sqlalchemy import delete as sa_delete
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.chats import Chats, Messages, TITLE_MAX_LENGTH, new_uuid


class ChatAccessError(Exception):
    """ Возникает в том случае, если ID чата существует, но не принадлежит текущему пользователю """

def now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


async def get_chat(
    *, db: AsyncSession, user_id: uuid.UUID, chat_id: uuid.UUID
) -> Optional[Chats]:
    result = await db.execute(
        select(Chats).where(Chats.id == chat_id, Chats.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def get_or_create_chat(
    *,
    db: AsyncSession,
    user_id: uuid.UUID,
    chat_id: Optional[uuid.UUID],
    model: str,
    first_message: str,
) -> Chats:
    chat: Optional[Chats] = None

    if chat_id is not None:
        result = await db.execute(select(Chats).where(Chats.id == chat_id))
        chat = result.scalar_one_or_none()
        if chat is not None and chat.user_id != user_id:
            raise ChatAccessError("Chat not found")

    if chat is None:
        moment = now()
        chat = Chats(
            id=chat_id if chat_id is not None else new_uuid(),
            user_id=user_id,
            title=first_message.strip()[:TITLE_MAX_LENGTH] or "New chat",
            model_name=model,
            created_at=moment,
            updated_at=moment,
        )
        db.add(chat)
        await db.flush()
    else:
        chat.model_name = model

    return chat


async def add_message(
    *,
    db: AsyncSession,
    chat: Chats,
    role: str,
    content: str,
    model_name: Optional[str],
    created_at: Optional[datetime.datetime] = None,
) -> Messages:
    moment = created_at or now()
    message = Messages(
        id=new_uuid(),
        chat_id=chat.id,
        role=role,
        content=content,
        model_name=model_name,
        created_at=moment,
    )
    chat.updated_at = moment
    db.add(message)
    return message


async def list_sessions(
    *,
    db: AsyncSession,
    user_id: uuid.UUID,
    before: Optional[datetime.datetime] = None,
    limit: int = 20,
) -> tuple[list[Chats], bool]:
    stmt = select(Chats).where(Chats.user_id == user_id)
    if before is not None:
        stmt = stmt.where(Chats.updated_at < before)
    stmt = stmt.order_by(Chats.updated_at.desc(), Chats.id.desc()).limit(limit + 1)

    result = await db.execute(stmt)
    chats = list(result.scalars().all())
    has_more = len(chats) > limit
    return chats[:limit], has_more


async def list_messages(
    *,
    db: AsyncSession,
    chat_id: uuid.UUID,
    before: Optional[datetime.datetime] = None,
    limit: int = 30,
) -> tuple[list[Messages], bool]:
    """Return the newest page of messages (newest first) plus a `has_more` flag."""
    stmt = select(Messages).where(Messages.chat_id == chat_id)
    if before is not None:
        stmt = stmt.where(Messages.created_at < before)
    stmt = stmt.order_by(Messages.created_at.desc(), Messages.id.desc()).limit(limit + 1)

    result = await db.execute(stmt)
    messages = list(result.scalars().all())
    has_more = len(messages) > limit
    return messages[:limit], has_more


async def delete_chat(
    *, db: AsyncSession, user_id: uuid.UUID, chat_id: uuid.UUID
) -> bool:
    result = await db.execute(
        sa_delete(Chats).where(Chats.id == chat_id, Chats.user_id == user_id)
    )
    if result.rowcount == 0:
        await db.rollback()
        return False

    await db.commit()
    return True
