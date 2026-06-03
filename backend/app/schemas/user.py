from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.user import UserRole


class UserResponse(BaseModel):
    id: int
    unique_user_id: str
    name: str
    mobile_number: str
    role: UserRole
    location: str | None
    business_name: str | None
    business_type: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
