import datetime
import uuid
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ChatSession(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    model_name: str
    created_at: datetime.datetime
    updated_at: datetime.datetime


class SessionsPage(BaseModel):
    sessions: list[ChatSession]
    has_more: bool
    before: Optional[str] = None


class MessageItem(BaseModel):
    id: str
    role: str
    content: str
    model: Optional[str] = None
    timestamp: datetime.datetime


class MessagesPage(BaseModel):
    messages: list[MessageItem]
    has_more: bool
    before: Optional[str] = None