from fastapi import APIRouter
from app.services.ai import AIService

router = APIRouter(prefix="/search", tags=["chats"])
ai = AIService()

@router.get('/{chat_id}')
async def test():
    result = await ai.test()
    return