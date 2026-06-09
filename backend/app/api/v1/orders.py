from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import UserRole
from app.schemas.common import ApiResponse
from app.schemas.order import (
    NotificationResponse,
    OrderCreateRequest,
    OrderItemResponse,
    OrderStatusUpdateRequest,
)
from app.services.notification_service import create_notification
from app.services.order_service import (
    create_order_from_request,
    get_orders_for_user,
    update_order_status,
)

router = APIRouter()


@router.get("/orders", response_model=ApiResponse[list[OrderItemResponse]])
def list_orders(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list[OrderItemResponse]]:
    orders = get_orders_for_user(db, current_user)
    return ApiResponse(success=True, message="Orders fetched successfully.", data=orders)


@router.post("/orders", response_model=ApiResponse[OrderItemResponse], status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreateRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[OrderItemResponse]:
    if current_user.role not in (UserRole.admin, UserRole.supplier):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied.")

    try:
        order = create_order_from_request(db, payload.request_id, current_user)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return ApiResponse(success=True, message="Order created successfully.", data=order)


@router.put("/orders/{order_id}/status", response_model=ApiResponse[OrderItemResponse])
def change_order_status(
    order_id: int,
    payload: OrderStatusUpdateRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[OrderItemResponse]:
    try:
        updated = update_order_status(db, order_id, payload.status, current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return ApiResponse(success=True, message="Order status updated successfully.", data=updated)
