from datetime import datetime

from pydantic import BaseModel, ConfigDict


class VendorProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    category: str
    stock: int
    price: float
    status: str
    image_url: str | None = None
    supplier_id: int
    supplier_name: str
    created_at: datetime
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class VendorRequestCreate(BaseModel):
    product_id: int
    quantity: int
    message: str | None = None


class VendorRequestResponse(BaseModel):
    id: int
    vendor_id: int
    product_id: int
    product_name: str
    supplier_name: str
    quantity: int
    message: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class VendorOrderResponse(BaseModel):
    id: int
    request_id: int
    product_name: str
    supplier_name: str
    quantity: int
    status: str
    created_at: datetime
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class RecentActivityItem(BaseModel):
    id: int
    title: str
    time: str


class VendorDashboardResponse(BaseModel):
    available_products: int
    open_requests: int
    fulfilled_orders: int
    favorite_suppliers: int
    recent_activity: list[RecentActivityItem]

    model_config = ConfigDict(from_attributes=True)
