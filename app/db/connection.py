from sqlalchemy.orm import DeclarativeBase, Mapped
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker, AsyncAttrs
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL)
session = async_sessionmaker(engine, expire_on_commit=False)

async def get_db():
    async with session() as db:
        yield db

class Base(DeclarativeBase, AsyncAttrs):
    pass