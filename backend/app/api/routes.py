from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.profile import router as profile_router
from app.api.v1.supplier import router as supplier_router
from app.api.v1.vendor import router as vendor_router
from app.api.v1.orders import router as orders_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.reports import router as reports_router

api_router = APIRouter()


@api_router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(profile_router, prefix="/profile", tags=["Profile"])
api_router.include_router(supplier_router, prefix="/supplier", tags=["Supplier"])
api_router.include_router(vendor_router, prefix="/vendor", tags=["Vendor"])
api_router.include_router(orders_router, tags=["Orders"])
api_router.include_router(notifications_router, tags=["Notifications"])
api_router.include_router(reports_router, tags=["Reports"])
