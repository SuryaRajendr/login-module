from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.profile import router as profile_router

api_router = APIRouter()


@api_router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(profile_router, prefix="/profile", tags=["Profile"])
