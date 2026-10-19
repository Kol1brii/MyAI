from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Identity, String
from app.db.chats import MODEL_NAME_MAX_LENGTH
from app.db.connection import Base

class Models(Base):
    __tablename__ = "models"
    id: Mapped[int] = mapped_column(Identity(), primary_key=True)
    provider: Mapped[str] = mapped_column(String(50))
    # work_name — идентификатор модели для API (напр. "openai/gpt-oss-120b"),
    # name — подпись для фронтенда. Оба поля заведомо длиннее реальных значений.
    work_name: Mapped[str] = mapped_column(String(MODEL_NAME_MAX_LENGTH))
    name: Mapped[str] = mapped_column(String(MODEL_NAME_MAX_LENGTH))
    icon_key: Mapped[str] = mapped_column(String(50))