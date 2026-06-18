from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import UserRole
from app.schemas.common import ApiResponse
from app.schemas.invoice import BillingHistoryResponse, BillingSummaryResponse
from app.services.invoice_service import get_billing_summary

router = APIRouter()


def ensure_admin(current_user):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")


@router.get("/billing/summary", response_model=ApiResponse[BillingSummaryResponse])
def get_summary(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[BillingSummaryResponse]:
    ensure_admin(current_user)
    payload = get_billing_summary(db)
    return ApiResponse(success=True, message="Billing summary fetched successfully.", data=payload)


@router.get("/billing/history", response_model=ApiResponse[list[BillingHistoryResponse]])
def get_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list[BillingHistoryResponse]]:
    ensure_admin(current_user)
    payload = get_billing_summary(db)["recent_history"]
    return ApiResponse(success=True, message="Billing history fetched successfully.", data=payload)