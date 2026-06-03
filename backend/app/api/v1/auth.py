from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest
from app.schemas.common import ApiResponse
from app.schemas.user import UserResponse
from app.services.user_service import create_user, dashboard_for_role, get_user_by_mobile

router = APIRouter()


def build_auth_response(user: User) -> AuthResponse:
    token = create_access_token(
        subject=user.mobile_number,
        claims={
            "role": user.role,
            "unique_user_id": user.unique_user_id,
        },
    )
    return AuthResponse(
        access_token=token,
        role=user.role,
        redirect_to=dashboard_for_role(user.role),
        user=UserResponse.model_validate(user),
    )


@router.post("/register", response_model=ApiResponse[AuthResponse], status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> ApiResponse[AuthResponse]:
    if payload.role == UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin registration is not allowed.",
        )

    existing_user = get_user_by_mobile(db, payload.mobile_number)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Mobile number already registered.",
        )

    user = create_user(db, payload)
    return ApiResponse(
        success=True,
        message="User registered successfully.",
        data=build_auth_response(user),
    )


@router.post("/login", response_model=ApiResponse[AuthResponse])
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> ApiResponse[AuthResponse]:
    user = get_user_by_mobile(db, payload.mobile_number)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mobile number is not registered.",
        )

    return ApiResponse(
        success=True,
        message="Login successful.",
        data=build_auth_response(user),
    )


@router.get("/me", response_model=ApiResponse[UserResponse])
def get_logged_in_user(current_user: User = Depends(get_current_user)) -> ApiResponse[UserResponse]:
    return ApiResponse(
        success=True,
        message="User details fetched successfully.",
        data=UserResponse.model_validate(current_user),
    )
