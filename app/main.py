from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.routers import api_router
from app.db.connection import Base, engine

@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as connect:
        await connect.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
        lifespan=lifespan,
        title="MyAI"
    )

app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router)