from fastapi import APIRouter
from app.api.v1.chats import router as chat_router
from app.api.v1.models import router as tech_router
from app.api.v1.users import auth_router, reg_router


api_router = APIRouter(prefix="/v1")
api_router.include_router(auth_router, tags=["Authentication"])
api_router.include_router(reg_router, tags=["Authentication"])
api_router.include_router(chat_router, tags=["chats"])
api_router.include_router(tech_router, tags=["models"])
