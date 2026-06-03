from pydantic import BaseModel, Field

from app.models.user import UserRole
from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    mobile_number: str = Field(min_length=6, max_length=20)
    email: str | None = Field(default=None, max_length=150)
    role: UserRole
    location: str | None = Field(default=None, max_length=150)
    business_name: str | None = Field(default=None, max_length=150)
    business_type: str | None = Field(default=None, max_length=100)


class LoginRequest(BaseModel):
    mobile_number: str = Field(min_length=6, max_length=20)


class AuthResponse(BaseModel):
    token_type: str = "bearer"
    access_token: str
    role: UserRole
    redirect_to: str
    user: UserResponse
