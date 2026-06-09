from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def get_products_for_supplier(db: Session, supplier_id: int) -> list[Product]:
    statement = select(Product).where(Product.supplier_id == supplier_id).order_by(Product.updated_at.desc(), Product.created_at.desc())
    return db.scalars(statement).all()


def get_product_by_id(db: Session, product_id: int, supplier_id: int) -> Optional[Product]:
    statement = select(Product).where(Product.id == product_id, Product.supplier_id == supplier_id)
    return db.scalars(statement).first()


def create_product(db: Session, supplier_id: int, payload: ProductCreate) -> Product:
    product = Product(
        name=payload.name,
        sku=payload.sku,
        category=payload.category,
        stock=payload.stock,
        price=payload.price,
        status=payload.status,
        image_url=payload.image_url,
        supplier_id=supplier_id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product: Product, payload: ProductUpdate) -> Product:
    if payload.name is not None:
        product.name = payload.name
    if payload.sku is not None:
        product.sku = payload.sku
    if payload.category is not None:
        product.category = payload.category
    if payload.stock is not None:
        product.stock = payload.stock
    if payload.price is not None:
        product.price = payload.price
    if payload.status is not None:
        product.status = payload.status
    if payload.image_url is not None:
        product.image_url = payload.image_url

    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product: Product) -> None:
    db.delete(product)
    db.commit()


def get_supplier_dashboard_stats(db: Session, supplier_id: int) -> dict:
    total_products = db.scalar(
        select(func.count()).select_from(Product).where(Product.supplier_id == supplier_id)
    ) or 0
    overall_stock = db.scalar(
        select(func.coalesce(func.sum(Product.stock), 0)).where(Product.supplier_id == supplier_id)
    ) or 0
    pending_vendor_requests = db.scalar(
        select(func.count()).select_from(Product).where(Product.supplier_id == supplier_id, Product.stock < 20)
    ) or 0

    products = get_products_for_supplier(db, supplier_id)
    activity = []
    for product in products[:3]:
        activity.append(
            {
                "id": product.id,
                "title": f"{product.name} inventory review",
                "time": product.updated_at.isoformat() if product.updated_at else product.created_at.isoformat(),
            }
        )

    if not activity:
        activity = [
            {
                "id": 0,
                "title": "No recent product activity yet.",
                "time": "Just now",
            }
        ]

    return {
        "total_products": total_products,
        "overall_stock": int(overall_stock),
        "pending_vendor_requests": pending_vendor_requests,
        "recent_activity": activity,
    }
