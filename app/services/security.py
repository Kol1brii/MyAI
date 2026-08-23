from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import asyncio, hashlib, re, uuid


ph = PasswordHasher()


class PasswordValidationError(Exception):
    pass


def hash_token(token: str):
    hashed_token = hashlib.sha256(token.encode()).hexdigest()
    return hashed_token


def password_validator(v: str) -> bool:
    if len(v) < 8:
        raise PasswordValidationError("Длина пароля должна быть не менее 8 символов")
    if not re.search(r"[A-Z]", v):
        raise PasswordValidationError("Пароль должен содержать заглавные буквы")
    return True


async def protected_messages(user_id: uuid.UUID, chat_id: uuid.UUID, db: AsyncSession):
    pass


async def hash_password(password: str) -> str:
    # Пулл в другой поток так как тяжёлая функция даже для asyncio
    return await asyncio.to_thread(ph.hash, password)


async def verify_password(password: str, hashed_password: str) -> bool:
    try:
        # Пулл в другой поток так как тяжёлая функция даже для asyncio
        await asyncio.to_thread(ph.verify, hashed_password, password)
        return True
    except VerifyMismatchError:
        return False
