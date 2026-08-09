from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import auth as authx_instance
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.routers import api_router
from app.db.connection import Base, engine
from app.scripts.seed_models import seed_models
# from app.scripts.seed_users import seed_users


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as connect:
        await connect.run_sync(Base.metadata.create_all)
        async with AsyncSession(connect) as db:

            await seed_models(db=db)
           # await seed_users(db=db)
    yield

app = FastAPI(
        lifespan=lifespan,
        title="MyAI"
    )
authx_instance.handle_errors(app)
app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router)