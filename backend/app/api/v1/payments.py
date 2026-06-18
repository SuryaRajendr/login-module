from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import UserRole
from app.schemas.common import ApiResponse
from app.schemas.invoice import PaymentResponse
from app.services.invoice_service import get_payment_details

router = APIRouter()


def ensure_admin(current_user):
    if current_user.role != UserRole.admin:
        from fastapi import HTTPException, status

        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")


@router.get("/payments", response_model=ApiResponse[list[PaymentResponse]])
def get_payments(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list[PaymentResponse]]:
    ensure_admin(current_user)
    payload = get_payment_details(db)
    return ApiResponse(success=True, message="Payment details fetched successfully.", data=payload)