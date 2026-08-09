from pydantic import BaseModel, Field

class NewChatRequest(BaseModel):
    msg: str = Field(min_length=1, max_length=100000)
    model: str = Field(min_length=1, max_length=100)

class NewChatResponse(BaseModel):
    answer: str