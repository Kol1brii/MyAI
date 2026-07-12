from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Identity
from app.db.connection import Base

class Models(Base):
    __tablename__ = "models"
    id: Mapped[int] = mapped_column(Identity(), primary_key=True)
    provider: Mapped[str] = mapped_column()
    work_name: Mapped[str] = mapped_column()
    name: Mapped[str] = mapped_column()
    icon_key: Mapped[str] = mapped_column()