from pydantic import BaseModel, Field
import uuid

class NewChatRequest(BaseModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    msg: str = Field(min_length=1, max_length=100000)

class NewChatResponse(BaseModel):
    answer: str