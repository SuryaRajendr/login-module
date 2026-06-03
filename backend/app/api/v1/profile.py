from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.user import UserProfileUpdate, UserResponse

router = APIRouter()


@router.get("/me", response_model=ApiResponse[UserResponse])
def get_profile(current_user: User = Depends(get_current_user)) -> ApiResponse[UserResponse]:
    return ApiResponse(
        success=True,
        message="Profile fetched successfully.",
        data=UserResponse.model_validate(current_user),
    )


@router.put("/me", response_model=ApiResponse[UserResponse])
def update_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[UserResponse]:
    current_user.name = payload.name
    current_user.email = payload.email
    current_user.location = payload.location
    current_user.business_name = payload.business_name
    current_user.business_type = payload.business_type
    current_user.specialty = payload.specialty
    current_user.availability = payload.availability
    current_user.about = payload.about
    current_user.profile_image = payload.profile_image
    current_user.updated_at = datetime.now(timezone.utc)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return ApiResponse(
        success=True,
        message="Profile updated successfully.",
        data=UserResponse.model_validate(current_user),
    )
