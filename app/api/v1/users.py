import jwt
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.connection import get_db
from app.services.users import registration, authorization, refresh_logic, AuthInvalidError
from app.config import auth
from app.schemas.users import (
    UserRegistration,
    UserAuthorization,
    UserResponse,
    TokenResponse,
    TokenRefresh
)

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])
reg_router = APIRouter(prefix="/register", tags=["Authentication"])


@reg_router.post("/", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def register(response: Response, user: UserRegistration, db: AsyncSession = Depends(get_db)):
    try:
        result = await registration(
            email=user.email,
            name=user.name,
            password=user.password,
            db=db
        )
        response.set_cookie(
            key="MyAI_access_token",
            value=result["access_token"],
            httponly=True,
            samesite="lax"
        )
        return result
    except AuthInvalidError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@auth_router.post("/", status_code=status.HTTP_200_OK, response_model=UserResponse)
async def login(response: Response, user: UserAuthorization, db: AsyncSession = Depends(get_db)):
    try:
        result = await authorization(
            email=user.email,
            password=user.password,
            db=db
        )
        response.set_cookie(
            key="MyAI_access_token",
            value=result["access_token"],
            httponly=True,
            samesite="lax"
        )
        return result
    except AuthInvalidError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@auth_router.post("/refresh", status_code=status.HTTP_200_OK, response_model=TokenResponse)
async def refresh_token(response: Response, request: TokenRefresh, db: AsyncSession = Depends(get_db)):
    try:
        token_payload = jwt.decode(
            request.refresh_token,
            auth.config.JWT_SECRET_KEY,
            algorithms=[auth.config.JWT_ALGORITHM]
        )
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    try:
        result = await refresh_logic(
            token_payload=token_payload,
            db=db
        )
        response.set_cookie(
            key="MyAI_access_token",
            value=result["access_token"],
            httponly=True,
            samesite="lax"
        )
        return result
    except AuthInvalidError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))