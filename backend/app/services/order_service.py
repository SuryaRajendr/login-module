from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session, aliased

from app.models.order import Order
from app.models.product import Product
from app.models.user import User, UserRole
from app.models.vendor_request import VendorRequest
from app.services.notification_service import create_notification


def generate_order_number(db: Session) -> str:
    count = db.scalar(select(func.count()).select_from(Order)) or 0
    candidate = f"ORD{count + 1:05d}"
    while db.scalar(select(Order).where(Order.order_number == candidate)):
        count += 1
        candidate = f"ORD{count + 1:05d}"
    return candidate


def format_order_payload(order, request, product, vendor_name, supplier_name) -> dict:
    return {
        "id": order.id,
        "order_number": order.order_number,
        "request_id": request.id,
        "vendor_name": vendor_name,
        "supplier_name": supplier_name,
        "product_name": product.name,
        "quantity": request.quantity,
        "status": order.status,
        "requested_date": order.created_at,
        "updated_at": order.updated_at,
    }


def create_order_from_request(db: Session, request_id: int, current_user) -> dict:
    request = db.scalar(select(VendorRequest).where(VendorRequest.id == request_id))
    if not request:
        raise ValueError("Vendor request not found.")

    product = db.scalar(select(Product).where(Product.id == request.product_id))
    if not product:
        raise ValueError("Product not found for request.")

    if request.status != "Approved":
        raise ValueError("Only approved requests can create orders.")

    existing_order = db.scalar(select(Order).where(Order.request_id == request.id))
    if existing_order:
        order = existing_order
    else:
        order = Order(
            request_id=request.id,
            order_number=generate_order_number(db),
            status="Pending",
        )
        db.add(order)
        db.commit()
        db.refresh(order)

    vendor = db.scalar(select(User).where(User.id == request.vendor_id))
    supplier = db.scalar(select(User).where(User.id == product.supplier_id))

    create_notification(
        db,
        request.vendor_id,
        title="Order created",
        message=f"Order {order.order_number} has been created for your request.",
        notification_type="OrderCreated",
        related_order_id=order.id,
    )

    return format_order_payload(
        order,
        request,
        product,
        vendor.name if vendor else "Unknown",
        supplier.name if supplier else "Unknown",
    )


def update_vendor_request_status(db: Session, request_id: int, status: str, current_user) -> dict:
    request = db.scalar(select(VendorRequest).where(VendorRequest.id == request_id))
    if not request:
        raise ValueError("Vendor request not found.")

    product = db.scalar(select(Product).where(Product.id == request.product_id))
    if not product:
        raise ValueError("Product not found for request.")

    if product.supplier_id != current_user.id:
        raise PermissionError("Supplier may only update requests for their own products.")

    request.status = status
    db.add(request)
    db.commit()
    db.refresh(request)

    vendor = db.scalar(select(User).where(User.id == request.vendor_id))
    supplier = db.scalar(select(User).where(User.id == product.supplier_id))

    create_notification(
        db,
        request.vendor_id,
        title="Request status updated",
        message=f"Your request for {product.name} has been {status}.",
        notification_type="VendorRequestStatus",
    )

    if status == "Approved":
        create_order_from_request(db, request.id, current_user)

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


def get_vendor_requests_for_supplier(db: Session, supplier_id: int) -> list[dict]:
    statement = (
        select(VendorRequest, Product.name.label("product_name"), User.name.label("vendor_name"))
        .join(Product, VendorRequest.product_id == Product.id)
        .join(User, VendorRequest.vendor_id == User.id)
        .where(Product.supplier_id == supplier_id)
        .order_by(VendorRequest.created_at.desc())
    )

    rows = db.execute(statement).all()
    return [
        {
            "id": request.id,
            "vendor_id": request.vendor_id,
            "product_id": request.product_id,
            "product_name": product_name,
            "vendor_name": vendor_name,
            "quantity": request.quantity,
            "message": request.message,
            "status": request.status,
            "created_at": request.created_at,
            "updated_at": request.updated_at,
        }
        for request, product_name, vendor_name in rows
    ]


def get_orders_for_user(db: Session, current_user) -> list[dict]:
    vendor_alias = aliased(User)
    supplier_alias = aliased(User)
    statement = (
        select(Order, VendorRequest, Product, vendor_alias.name.label("vendor_name"), supplier_alias.name.label("supplier_name"))
        .join(VendorRequest, Order.request_id == VendorRequest.id)
        .join(Product, VendorRequest.product_id == Product.id)
        .join(vendor_alias, VendorRequest.vendor_id == vendor_alias.id)
        .join(supplier_alias, Product.supplier_id == supplier_alias.id)
        .order_by(Order.created_at.desc())
    )

    if current_user.role == UserRole.vendor:
        statement = statement.where(VendorRequest.vendor_id == current_user.id)
    elif current_user.role == UserRole.supplier:
        statement = statement.where(Product.supplier_id == current_user.id)

    rows = db.execute(statement).all()
    return [
        {
            "id": order.id,
            "order_number": order.order_number,
            "request_id": request.id,
            "vendor_name": vendor_name,
            "supplier_name": supplier_name,
            "product_name": product.name,
            "quantity": request.quantity,
            "status": order.status,
            "requested_date": order.created_at,
            "updated_at": order.updated_at,
        }
        for order, request, product, vendor_name, supplier_name in rows
    ]


def update_order_status(db: Session, order_id: int, status: str, current_user) -> dict:
    order = db.scalar(select(Order).where(Order.id == order_id))
    if not order:
        raise ValueError("Order not found.")

    request = db.scalar(select(VendorRequest).where(VendorRequest.id == order.request_id))
    if not request:
        raise ValueError("Order request missing.")

    product = db.scalar(select(Product).where(Product.id == request.product_id))
    if not product:
        raise ValueError("Product missing for order.")

    if current_user.role == UserRole.supplier and product.supplier_id != current_user.id:
        raise PermissionError("Supplier may only update their own orders.")

    order.status = status
    order.updated_at = datetime.utcnow()
    db.add(order)

    if status == "Approved":
        product.stock = max(0, product.stock - request.quantity)
        db.add(product)
        if product.stock < 10:
            create_notification(
                db,
                product.supplier_id,
                title="Low stock alert",
                message=f"Stock for {product.name} is low ({product.stock} units remaining).",
                notification_type="LowStock",
            )

    db.commit()
    db.refresh(order)

    vendor = db.scalar(select(User).where(User.id == request.vendor_id))
    supplier = db.scalar(select(User).where(User.id == product.supplier_id))

    create_notification(
        db,
        request.vendor_id,
        title="Order status updated",
        message=f"Order {order.order_number} is now {status}.",
        notification_type="OrderStatusChange",
        related_order_id=order.id,
    )

    return format_order_payload(
        order,
        request,
        product,
        vendor.name if vendor else "Unknown",
        supplier.name if supplier else "Unknown",
    )
