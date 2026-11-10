import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.db.connection import Base, get_db
from app.main import app

from app.db.users import Users, RefreshTokens

TEST_DATABASE_URL = "postgresql+asyncpg://postgres:admin@localhost:5432/test_db"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=True)
test_session = async_sessionmaker(test_engine, expire_on_commit=False)


async def override_get_db():
    async with test_session() as db:
        yield db


@pytest_asyncio.fixture(scope="function", autouse=True, loop_scope="function")
async def test_database():
    async with test_engine.begin() as connect:
        await connect.run_sync(Base.metadata.drop_all)
        await connect.run_sync(Base.metadata.create_all)

    yield

    await test_engine.dispose()


@pytest_asyncio.fixture(scope="function", autouse=True, loop_scope="function")
async def client(test_database):
    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app)

    async with AsyncClient(
        transport=transport,
        base_url="http://tests",
    ) as client:
        yield client

    app.dependency_overrides.clear()
