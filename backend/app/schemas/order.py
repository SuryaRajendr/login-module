from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class OrderCreateRequest(BaseModel):
    request_id: int


class OrderStatusUpdateRequest(BaseModel):
    status: str


class OrderItemResponse(BaseModel):
    id: int
    order_number: str
    request_id: int
    vendor_name: str
    supplier_name: str
    product_name: str
    quantity: int
    status: str
    requested_date: datetime
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str | None = None
    notification_type: str
    related_order_id: int | None = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReportSummaryItem(BaseModel):
    product_name: str
    order_count: int
    total_revenue: float


class ReportSummaryResponse(BaseModel):
    total_orders: int
    completed_orders: int
    pending_orders: int
    top_products: list[ReportSummaryItem]
    sales_summary: dict[str, float]
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)
