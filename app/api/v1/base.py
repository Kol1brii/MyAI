from app.schemas.chat import NewChatRequest, NewChatResponse
from app.services.ai import AIService
from fastapi import APIRouter, Depends

router = APIRouter(tags=["chats"])

@router.post("/", status_code=201, response_model=NewChatResponse)
async def new_chat(valid: NewChatRequest, ai: AIService = Depends()):
    result = await ai.user_response(valid.id, msg=valid.msg, model=valid.model)
    return NewChatResponse(answer=result)