import datetime
import uuid

import uuid_utils
from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.connection import Base


def new_uuid() -> uuid.UUID:
    """UUIDv7 as a stdlib uuid.UUID (asyncpg expects the stdlib type)."""
    return uuid.UUID(bytes=uuid_utils.uuid7().bytes)


# Предельные длины строковых полей. Заданы здесь один раз и используются и в
# схеме БД, и в бизнес-логике (обрезка заголовка) — чтобы код и колонки не могли
# разойтись. create_all() существующие таблицы не меняет, поэтому расхождение
# "код режет длиннее, чем влезает в колонку" роняло создание чата.
TITLE_MAX_LENGTH = 60
MODEL_NAME_MAX_LENGTH = 100


class Chats(Base):
    __tablename__ = "chats"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=new_uuid
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(TITLE_MAX_LENGTH))
    model_name: Mapped[str] = mapped_column(String(MODEL_NAME_MAX_LENGTH))
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    messages: Mapped[list["Messages"]] = relationship(
        back_populates="chat", cascade="all, delete-orphan", lazy="raise"
    )


class Messages(Base):
    __tablename__ = "messages"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=new_uuid
    )
    chat_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chats.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)
    model_name: Mapped[str | None] = mapped_column(
        String(MODEL_NAME_MAX_LENGTH), default=None
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    chat: Mapped["Chats"] = relationship(back_populates="messages", lazy="raise")
