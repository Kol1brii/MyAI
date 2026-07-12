from fastapi import APIRouter
from app.api.v1.chats import router as chat_router
from app.api.v1.base import router as base_router
from app.api.v1.models import router as tech_router

api_router = APIRouter(prefix="/v1")

api_router.include_router(base_router, tags=["chats"])
api_router.include_router(chat_router, tags=["chats"])
api_router.include_router(tech_router, tags=["models"])