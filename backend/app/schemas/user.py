from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.user import UserRole


class UserResponse(BaseModel):
    id: int
    unique_user_id: str
    name: str
    mobile_number: str
    email: str | None
    role: UserRole
    location: str | None
    business_name: str | None
    business_type: str | None
    specialty: str | None
    availability: str
    about: str | None
    profile_image: str | None
    created_at: datetime
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class UserProfileUpdate(BaseModel):
    name: str
    email: str | None = None
    location: str | None = None
    business_name: str | None = None
    business_type: str | None = None
    specialty: str | None = None
    availability: str = "Available"
    about: str | None = None
    profile_image: str | None = None
