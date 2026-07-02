from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):
    name: str
    sku: str
    category: str
    stock: int
    price: float
    status: str = "In Stock"
    image_url: str | None = None
    description: str | None = None
    unit: str | None = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    sku: str | None = None
    category: str | None = None
    stock: int | None = None
    price: float | None = None
    status: str | None = None
    image_url: str | None = None
    description: str | None = None
    unit: str | None = None


class BulkProductRow(BaseModel):
    sku: str | None = None
    name: str
    category: str
    description: str | None = None
    price: float
    stock: int
    unit: str | None = None
    image_url: str | None = None
    status: str


class BulkProductImportPayload(BaseModel):
    products: list[BulkProductRow]


class ProductResponse(ProductBase):
    id: int
    supplier_id: int
    created_at: datetime
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class RecentActivityItem(BaseModel):
    id: int
    title: str
    time: str


class DashboardStatsResponse(BaseModel):
    total_products: int
    overall_stock: int
    pending_vendor_requests: int
    recent_activity: list[RecentActivityItem]

    model_config = ConfigDict(from_attributes=True)
