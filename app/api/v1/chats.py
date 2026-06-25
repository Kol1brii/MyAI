from fastapi import APIRouter
from app.services.ai import AIService

router = APIRouter(prefix="/chats", tags=["chats"])
ai = AIService()

@router.get('/test')
async def test():
    result = await ai.test()
    return result