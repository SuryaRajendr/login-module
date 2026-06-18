from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import UserRole
from app.schemas.common import ApiResponse
from app.schemas.invoice import (
    InvoiceCreateRequest,
    InvoiceFormDataResponse,
    InvoiceResponse,
    InvoiceUpdateRequest,
)
from app.services.invoice_service import (
    create_invoice,
    get_invoice_by_id,
    get_invoice_form_data,
    list_invoices,
    update_invoice,
)

router = APIRouter()


def ensure_admin(current_user):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")


@router.get("/invoices/form-data", response_model=ApiResponse[InvoiceFormDataResponse])
def get_form_data(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[InvoiceFormDataResponse]:
    ensure_admin(current_user)
    payload = get_invoice_form_data(db)
    return ApiResponse(success=True, message="Invoice form data fetched successfully.", data=payload)


@router.get("/invoices", response_model=ApiResponse[list[InvoiceResponse]])
def get_invoices(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list[InvoiceResponse]]:
    ensure_admin(current_user)
    payload = list_invoices(db)
    return ApiResponse(success=True, message="Invoices fetched successfully.", data=payload)


@router.get("/invoices/{invoice_id}", response_model=ApiResponse[InvoiceResponse])
def get_invoice(
    invoice_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[InvoiceResponse]:
    ensure_admin(current_user)
    try:
        payload = get_invoice_by_id(db, invoice_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return ApiResponse(success=True, message="Invoice fetched successfully.", data=payload)


@router.post("/invoices", response_model=ApiResponse[InvoiceResponse], status_code=status.HTTP_201_CREATED)
def create_new_invoice(
    payload: InvoiceCreateRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[InvoiceResponse]:
    ensure_admin(current_user)
    try:
        invoice = create_invoice(db, payload, current_user)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return ApiResponse(success=True, message="Invoice created successfully.", data=invoice)


@router.put("/invoices/{invoice_id}", response_model=ApiResponse[InvoiceResponse])
def update_existing_invoice(
    invoice_id: int,
    payload: InvoiceUpdateRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[InvoiceResponse]:
    ensure_admin(current_user)
    try:
        invoice = update_invoice(db, invoice_id, payload, current_user)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return ApiResponse(success=True, message="Invoice updated successfully.", data=invoice)