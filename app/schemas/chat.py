import uuid
from typing import Optional

from pydantic import BaseModel, Field

from app.db.chats import MODEL_NAME_MAX_LENGTH


class NewChatRequest(BaseModel):
    id: Optional[uuid.UUID] = None
    msg: str = Field(min_length=1, max_length=100000)
    model: str = Field(min_length=1, max_length=MODEL_NAME_MAX_LENGTH)


class NewChatResponse(BaseModel):
    answer: str
    chat_id: Optional[uuid.UUID] = None
