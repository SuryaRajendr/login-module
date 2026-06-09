from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.product import Product
from app.models.vendor_request import VendorRequest


def get_report_summary(db: Session, start_date: datetime | None = None, end_date: datetime | None = None) -> dict:
    statement = select(Order)
    if start_date:
        statement = statement.where(Order.created_at >= start_date)
    if end_date:
        statement = statement.where(Order.created_at <= end_date)

    total_orders = db.scalar(select(func.count()).select_from(statement.subquery())) or 0
    completed_orders = db.scalar(
        select(func.count()).select_from(Order).where(Order.status == "Completed")
    ) or 0
    pending_orders = db.scalar(
        select(func.count()).select_from(Order).where(Order.status == "Pending")
    ) or 0

    top_products = (
        db.execute(
            select(
                Product.name.label("product_name"),
                func.count(Order.id).label("order_count"),
                func.coalesce(func.sum(Product.price * VendorRequest.quantity), 0).label("total_revenue"),
            )
            .join(VendorRequest, Order.request_id == VendorRequest.id)
            .join(Product, VendorRequest.product_id == Product.id)
            .group_by(Product.name)
            .order_by(func.count(Order.id).desc())
            .limit(5)
        )
        .all()
    )

    sales_total = db.scalar(
        select(func.coalesce(func.sum(Product.price * VendorRequest.quantity), 0))
        .select_from(Order)
        .join(VendorRequest, Order.request_id == VendorRequest.id)
        .join(Product, VendorRequest.product_id == Product.id)
    ) or 0.0

    return {
        "total_orders": int(total_orders),
        "completed_orders": int(completed_orders),
        "pending_orders": int(pending_orders),
        "top_products": [
            {
                "product_name": row.product_name,
                "order_count": int(row.order_count),
                "total_revenue": float(row.total_revenue),
            }
            for row in top_products
        ],
        "sales_summary": {
            "total_revenue": float(sales_total),
        },
        "generated_at": datetime.utcnow(),
    }
