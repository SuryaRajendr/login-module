from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import UserRole
from app.schemas.common import ApiResponse
from app.schemas.vendor import (
    VendorDashboardResponse,
    VendorOrderResponse,
    VendorProductResponse,
    VendorRequestCreate,
    VendorRequestResponse,
)
from app.services.vendor_service import (
    create_vendor_request,
    get_vendor_dashboard_stats,
    get_vendor_orders,
    get_vendor_products,
)

router = APIRouter()


def ensure_vendor(current_user):
    if current_user.role != UserRole.vendor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vendor access required.",
        )


@router.get("/dashboard/summary", response_model=ApiResponse[VendorDashboardResponse])
def get_dashboard_summary(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[VendorDashboardResponse]:
    ensure_vendor(current_user)
    payload = get_vendor_dashboard_stats(db, current_user.id)
    return ApiResponse(success=True, message="Vendor dashboard summary fetched successfully.", data=payload)


@router.get("/products", response_model=ApiResponse[list[VendorProductResponse]])
def list_products(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list[VendorProductResponse]]:
    ensure_vendor(current_user)
    products = get_vendor_products(db)
    return ApiResponse(success=True, message="Products fetched successfully.", data=products)


@router.post("/requests", response_model=ApiResponse[VendorRequestResponse], status_code=status.HTTP_201_CREATED)
def create_request(
    payload: VendorRequestCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[VendorRequestResponse]:
    ensure_vendor(current_user)
    try:
        request_payload = create_vendor_request(db, current_user.id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return ApiResponse(success=True, message="Product request submitted successfully.", data=request_payload)


@router.get("/orders", response_model=ApiResponse[list[VendorOrderResponse]])
def get_orders(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list[VendorOrderResponse]]:
    ensure_vendor(current_user)
    orders = get_vendor_orders(db, current_user.id)
    return ApiResponse(success=True, message="Vendor orders fetched successfully.", data=orders)
