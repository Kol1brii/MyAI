import asyncio
import pytest
from sqlalchemy.ext.asyncio  import create_async_engine, async_sessionmaker, AsyncSession
from app.db.connection import Base, get_db
from app.main import app


TEST_DATABASE_URL = "postgresql+asyncpg://user:pass@localhost:5432/test_db"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=True)
test_session = async_sessionmaker(test_engine,
                                  expire_on_commit=False,
                                  class_=AsyncSession)

@pytest.fixture(scope="session", autouse=True)
async def test_database():
    async with test_engine.begin() as connect:
        connect.run_sync(Base.metadata.create_all)

    yield
    connect.run_sync(Base.metadata.drop_all)

