from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.user import User
from app.models.vendor_request import VendorRequest
from app.schemas.vendor import VendorRequestCreate
from app.services.notification_service import create_notification


def get_vendor_products(db: Session) -> list[dict]:
    statement = (
        select(Product, User.name.label("supplier_name"))
        .join(User, Product.supplier_id == User.id)
        .order_by(Product.updated_at.desc(), Product.created_at.desc())
    )

    rows = db.execute(statement).all()
    return [
        {
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "category": product.category,
            "stock": product.stock,
            "price": product.price,
            "status": product.status,
            "image_url": product.image_url,
            "supplier_id": product.supplier_id,
            "supplier_name": supplier_name,
            "created_at": product.created_at,
            "updated_at": product.updated_at,
        }
        for product, supplier_name in rows
    ]


def create_vendor_request(db: Session, vendor_id: int, payload: VendorRequestCreate) -> dict:
    product = db.scalar(select(Product).where(Product.id == payload.product_id))
    if not product:
        raise ValueError("Product not found.")

    request = VendorRequest(
        vendor_id=vendor_id,
        product_id=payload.product_id,
        quantity=payload.quantity,
        message=payload.message,
        status="Pending",
    )
    db.add(request)
    db.commit()
    db.refresh(request)

    supplier = db.scalar(select(User).where(User.id == product.supplier_id))
    vendor = db.scalar(select(User).where(User.id == vendor_id))

    create_notification(
        db,
        product.supplier_id,
        title="New vendor request",
        message=f"{vendor.name if vendor else 'A vendor'} requested {request.quantity} x {product.name}.",
        notification_type="VendorRequestCreated",
        related_order_id=None,
    )
    return {
        "id": request.id,
        "vendor_id": request.vendor_id,
        "product_id": request.product_id,
        "product_name": product.name,
        "supplier_name": supplier.name if supplier else "Unknown",
        "quantity": request.quantity,
        "message": request.message,
        "status": request.status,
        "created_at": request.created_at,
        "updated_at": request.updated_at,
    }


def get_vendor_orders(db: Session, vendor_id: int) -> list[dict]:
    statement = (
        select(VendorRequest, Product.name.label("product_name"), User.name.label("supplier_name"))
        .join(Product, VendorRequest.product_id == Product.id)
        .join(User, Product.supplier_id == User.id)
        .where(VendorRequest.vendor_id == vendor_id)
        .order_by(VendorRequest.created_at.desc())
    )

    rows = db.execute(statement).all()
    return [
        {
            "id": request.id,
            "request_id": request.id,
            "product_name": product_name,
            "supplier_name": supplier_name,
            "quantity": request.quantity,
            "status": request.status,
            "created_at": request.created_at,
            "updated_at": request.updated_at,
        }
        for request, product_name, supplier_name in rows
    ]


def get_vendor_dashboard_stats(db: Session, vendor_id: int) -> dict:
    available_products = db.scalar(select(func.count()).select_from(Product)) or 0
    open_requests = (
        db.scalar(
            select(func.count())
            .select_from(VendorRequest)
            .where(VendorRequest.vendor_id == vendor_id, VendorRequest.status == "Pending")
        )
        or 0
    )
    fulfilled_orders = (
        db.scalar(
            select(func.count())
            .select_from(VendorRequest)
            .where(VendorRequest.vendor_id == vendor_id, VendorRequest.status == "Approved")
        )
        or 0
    )
    favorite_suppliers = (
        db.scalar(
            select(func.count(func.distinct(Product.supplier_id)))
            .select_from(VendorRequest)
            .join(Product, VendorRequest.product_id == Product.id)
            .where(VendorRequest.vendor_id == vendor_id)
        )
        or 0
    )

    recent_rows = (
        db.execute(
            select(VendorRequest, Product.name.label("product_name"))
            .join(Product, VendorRequest.product_id == Product.id)
            .where(VendorRequest.vendor_id == vendor_id)
            .order_by(VendorRequest.created_at.desc())
            .limit(3)
        )
        .all()
    )

    recent_activity = [
        {
            "id": request.id,
            "title": f"{request.status} request for {product_name}",
            "time": request.created_at.isoformat() if request.created_at else "Just now",
        }
        for request, product_name in recent_rows
    ]

    if not recent_activity:
        recent_activity = [
            {
                "id": 0,
                "title": "No vendor activity yet.",
                "time": "Just now",
            }
        ]

    return {
        "available_products": available_products,
        "open_requests": open_requests,
        "fulfilled_orders": fulfilled_orders,
        "favorite_suppliers": favorite_suppliers,
        "recent_activity": recent_activity,
    }
