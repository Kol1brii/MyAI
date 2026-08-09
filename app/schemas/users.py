from pydantic import BaseModel, EmailStr, HttpUrl, Field, ConfigDict
import uuid

class UserRegistration(BaseModel):
    email: EmailStr
    name: str = Field(min_length=3, max_length=15)
    password: str = Field(min_length=8)

class UserAuthorization(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

class UserResponse(BaseModel):
    access_token: str
    refresh_token: str
    id: uuid.UUID
    email: EmailStr
    name: str = Field(min_length=3, max_length=15)
    model_config = ConfigDict(from_attributes=True)
    token_type: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenRefresh(BaseModel):
    refresh_token: str