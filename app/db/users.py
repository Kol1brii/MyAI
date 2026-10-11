import datetime
import uuid
import uuid_utils
from sqlalchemy.dialects.postgresql import UUID
from app.db.connection import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, DateTime, func, Text


def generate_uuid7() -> uuid.UUID:
    # Генератор UUIDv7
    return uuid.UUID(bytes=uuid_utils.uuid7().bytes)

class Users(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=generate_uuid7,
    )
    email: Mapped[str] = mapped_column(nullable=False, index=True, unique=True)
    hashed_password: Mapped[str] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(String(20))
    avatar_url: Mapped[str | None] = mapped_column(default=None)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    refresh_token: Mapped["RefreshTokens"] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="raise", uselist=False
    )


class RefreshTokens(Base):
    __tablename__ = "refresh_tokens"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=generate_uuid7,
    )
    jti: Mapped[str] = mapped_column(nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    token_hash: Mapped[str] = mapped_column(nullable=False, index=True)
    expires_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    user: Mapped["Users"] = relationship(back_populates="refresh_token", lazy="raise")


class Chats(Base):
    __tablename__ = "chats"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=generate_uuid7,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(35))
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), index=True, server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        index=True,
        server_default=func.now(),
        onupdate=func.now(),
    )
    model_name: Mapped[str] = mapped_column(String(35))
    message: Mapped[list["Messages"]] = relationship(
        back_populates="chat", cascade="all, delete-orphan", lazy="raise"
    )


class Messages(Base):
    __tablename__ = "messages"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=generate_uuid7,
    )
    chat_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("chats.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)
    model_name: Mapped[str] = mapped_column(String(35))
    # thinking_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), index=True, server_default=func.now()
    )
    chat: Mapped["Chats"] = relationship(back_populates="message", lazy="raise")
