from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.invoice import InvoiceStatus
from app.models.payment import PaymentStatus


class FinanceOptionResponse(BaseModel):
    id: int
    name: str


class ProductOptionResponse(BaseModel):
    id: int
    name: str
    category: str
    price: float
    supplier_id: int
    supplier_name: str


class InvoiceFormDataResponse(BaseModel):
    vendors: list[FinanceOptionResponse]
    suppliers: list[FinanceOptionResponse]
    products: list[ProductOptionResponse]


class InvoiceCreateRequest(BaseModel):
    vendor_id: int
    supplier_id: int
    product_details: str
    quantity: int
    price: float
    tax: float = 0.0
    invoice_date: date
    due_date: date
    status: InvoiceStatus = InvoiceStatus.draft


class InvoiceUpdateRequest(BaseModel):
    vendor_id: int | None = None
    supplier_id: int | None = None
    product_details: str | None = None
    quantity: int | None = None
    price: float | None = None
    tax: float | None = None
    invoice_date: date | None = None
    due_date: date | None = None
    status: InvoiceStatus | None = None


class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    vendor_id: int
    vendor_name: str
    supplier_id: int
    supplier_name: str
    product_details: str
    quantity: int
    price: float
    tax: float
    total_amount: float
    invoice_date: date
    due_date: date
    status: str
    payment_status: str | None = None
    created_at: datetime
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class PaymentResponse(BaseModel):
    id: int
    invoice_id: int
    invoice_number: str
    vendor_name: str
    supplier_name: str
    amount: float
    payment_status: PaymentStatus
    payment_method: str | None = None
    transaction_details: str | None = None
    paid_at: datetime | None = None
    created_at: datetime
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class BillingHistoryResponse(BaseModel):
    id: int
    invoice_id: int | None = None
    invoice_number: str | None = None
    event_type: str
    amount: float
    status: str
    notes: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RevenueOverviewItem(BaseModel):
    label: str
    amount: float


class BillingSummaryResponse(BaseModel):
    invoice_count: int
    total_revenue: float
    paid_amount: float
    pending_amount: float
    overdue_amount: float
    revenue_overview: list[RevenueOverviewItem]
    recent_payments: list[PaymentResponse]
    recent_history: list[BillingHistoryResponse]