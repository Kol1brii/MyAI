from authx import AuthX, AuthXConfig
from dotenv import load_dotenv
from pydantic import BaseModel
from pydantic_settings import BaseSettings
import os

load_dotenv()

class Settings(BaseSettings):
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8"
    }

settings = Settings()

# JWT
config = AuthXConfig()
config.JWT_SECRET_KEY = os.getenv("SECRET_KEY")
config.JWT_ALGORITHM = "HS256"
config.JWT_TOKEN_LOCATION = ["cookies"]
config.JWT_ACCESS_COOKIE_NAME = "MyAI_access_token"
config.JWT_COOKIE_CSRF_PROTECT = False
auth = AuthX(config=config)

# Своё исключение для бизнес-логики
class ServiceException(Exception):
    def __init__(self, message: str):
        super().__init__(message)