import uuid
import asyncio
from datetime import datetime, timezone, timedelta
import uuid_utils
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.db.users import Users, RefreshTokens
from app.services.security import (
    password_validator,
    hash_password,
    verify_password,
    hash_token,
    PasswordValidationError
)
from app.config import auth


class AuthInvalidError(Exception):
    def __init__(self, status_code: int, message: str):
        super().__init__(message)
        self.status_code = status_code


async def registration(email: str, name: str, password: str, db: AsyncSession):
    raw_result = await db.execute(
        select(Users).where(Users.email == email)
    )
    result = raw_result.scalars().first()
    if result:
        raise AuthInvalidError(status_code=400, message="Invalid email or password")

    try:
        password_validator(v=password)
    except PasswordValidationError as e:
        raise AuthInvalidError(status_code=422, message=str(e))

    hashed_password = await hash_password(password=password)

    user = Users(
        email=email,
        hashed_password=hashed_password,
        name=name,
        avatar_url=None
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    user_jti = str(uuid_utils.uuid7())
    custom_claims = {
        "jti": user_jti,
        "name": user.name,
        "email": user.email
    }

    tokens = auth.create_token_pair(uid=str(user.id), data=custom_claims)
    hashed_token = hash_token(tokens.refresh_token)
    expires_time = datetime.now(timezone.utc) + timedelta(days=30)

    db.add(
        RefreshTokens(
            jti=user_jti,
            user_id=user.id,
            token_hash=hashed_token,
            expires_at=expires_time
        )
    )
    await db.commit()

    return {
        "access_token": tokens.access_token,
        "refresh_token": tokens.refresh_token,
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "token_type": "bearer"
    }


async def authorization(email: str, password: str, db: AsyncSession):
    raw = await db.execute(
        select(Users).options(joinedload(Users.refresh_token)).where(Users.email == email)
    )
    user = raw.scalars().first()
    if user is None:
        raise AuthInvalidError(status_code=400, message="Invalid email or password")

    verify = await verify_password(password=password, hashed_password=user.hashed_password)
    if not verify:
        raise AuthInvalidError(status_code=400, message="Invalid email or password")

    user_jti = str(uuid_utils.uuid7())
    custom_claims = {
        "jti": user_jti,
        "name": user.name,
        "email": user.email
    }

    tokens = auth.create_token_pair(uid=str(user.id), data=custom_claims)
    hashed_token = hash_token(token=tokens.refresh_token)
    expires_time = datetime.now(timezone.utc) + timedelta(days=30)

    if user.refresh_token:
        user.refresh_token.jti = user_jti
        user.refresh_token.token_hash = hashed_token
        user.refresh_token.expires_at = expires_time
    else:
        new_token = RefreshTokens(
            jti=user_jti,
            user_id=user.id,
            token_hash=hashed_token,
            expires_at=expires_time
        )
        db.add(new_token)

    await db.commit()

    return {
        "access_token": tokens.access_token,
        "refresh_token": tokens.refresh_token,
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "token_type": "bearer"
    }


async def refresh_logic(token_payload: dict, db: AsyncSession):
    token_jti = token_payload.get("jti")
    user_id = token_payload.get("sub")

    stmt = (
        select(RefreshTokens)
        .options(joinedload(RefreshTokens.user))
        .where(RefreshTokens.jti == token_jti)
    )
    raw_result = await db.execute(stmt)
    result = raw_result.scalars().first()

    if result is None:
        raise AuthInvalidError(status_code=401, message="Token not found")

    new_jti = str(uuid_utils.uuid7())
    custom_claims = {
        "jti": new_jti,
        "name": result.user.name,
        "email": result.user.email
    }

    tokens = auth.create_token_pair(uid=str(user_id), data=custom_claims)
    hashed_token = hash_token(token=tokens.refresh_token)
    expires_time = datetime.now(timezone.utc) + timedelta(days=30)

    result.jti = new_jti
    result.token_hash = hashed_token
    result.expires_at = expires_time
    await db.commit()

    return {
        "access_token": tokens.access_token,
        "refresh_token": tokens.refresh_token,
        "token_type": "bearer"
    }