from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.common import ApiResponse
from app.schemas.product import (
    DashboardStatsResponse,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)
from app.services.product_service import (
    create_product,
    delete_product,
    get_product_by_id,
    get_products_for_supplier,
    get_supplier_dashboard_stats,
    update_product,
)

router = APIRouter()


@router.get("/dashboard/stats", response_model=ApiResponse[DashboardStatsResponse])
def get_dashboard_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[DashboardStatsResponse]:
    payload = get_supplier_dashboard_stats(db, current_user.id)
    return ApiResponse(success=True, message="Dashboard stats fetched successfully.", data=payload)


@router.get("/products", response_model=ApiResponse[list[ProductResponse]])
def list_products(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list[ProductResponse]]:
    products = get_products_for_supplier(db, current_user.id)
    return ApiResponse(success=True, message="Products fetched successfully.", data=products)


@router.post("/products", response_model=ApiResponse[ProductResponse], status_code=status.HTTP_201_CREATED)
def create_new_product(
    payload: ProductCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[ProductResponse]:
    product = create_product(db, current_user.id, payload)
    return ApiResponse(success=True, message="Product created successfully.", data=product)


@router.put("/products/{product_id}", response_model=ApiResponse[ProductResponse])
def update_existing_product(
    product_id: int,
    payload: ProductUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[ProductResponse]:
    product = get_product_by_id(db, product_id, current_user.id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    updated = update_product(db, product, payload)
    return ApiResponse(success=True, message="Product updated successfully.", data=updated)


@router.delete("/products/{product_id}", response_model=ApiResponse[None])
def delete_existing_product(
    product_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[None]:
    product = get_product_by_id(db, product_id, current_user.id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    delete_product(db, product)
    return ApiResponse(success=True, message="Product deleted successfully.", data=None)
