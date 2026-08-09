import datetime
import uuid
import uuid_utils
from sqlalchemy.dialects.postgresql import UUID
from app.db.connection import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, DateTime, func


class Users(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid_utils.uuid7)
    email: Mapped[str] = mapped_column(nullable=False, index=True, unique=True)
    hashed_password: Mapped[str] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(String(20))
    avatar_url: Mapped[str | None] = mapped_column(default=None)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now())

    refresh_token: Mapped["RefreshTokens"] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="raise"
    )

class RefreshTokens(Base):
    __tablename__ = "refresh_tokens"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid_utils.uuid7
    )
    jti: Mapped[str] = mapped_column(nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False,
    unique = True
    )
    token_hash: Mapped[str] = mapped_column(nullable=False, index=True)
    expires_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    user: Mapped["Users"] = relationship(
        back_populates="refresh_token", lazy="raise"
                                         )
'''
 .options(selectinload(Users.posts)) <- асинхронно подтянуть данные
'''