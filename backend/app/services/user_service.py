from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.schemas.auth import RegisterRequest


ROLE_PREFIX = {
    UserRole.admin: "ADM",
    UserRole.supplier: "SUP",
    UserRole.vendor: "VEN",
}


def dashboard_for_role(role: UserRole) -> str:
    routes = {
        UserRole.admin: "/admin/dashboard",
        UserRole.supplier: "/supplier/dashboard",
        UserRole.vendor: "/vendor/dashboard",
    }
    return routes[role]


def generate_unique_user_id(db: Session, role: UserRole) -> str:
    prefix = ROLE_PREFIX[role]
    count = db.scalar(select(func.count()).select_from(User).where(User.role == role)) or 0

    while True:
        candidate = f"{prefix}{count + 1:03d}"
        exists = db.scalar(select(User).where(User.unique_user_id == candidate))
        if not exists:
            return candidate
        count += 1


def get_user_by_mobile(db: Session, mobile_number: str) -> User | None:
    return db.scalar(select(User).where(User.mobile_number == mobile_number))


def create_user(db: Session, payload: RegisterRequest) -> User:
    user = User(
        unique_user_id=generate_unique_user_id(db, payload.role),
        name=payload.name,
        mobile_number=payload.mobile_number,
        role=payload.role,
        location=payload.location,
        business_name=payload.business_name,
        business_type=payload.business_type,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def ensure_admin_user() -> None:
    db = SessionLocal()
    try:
        existing_admin = db.scalar(select(User).where(User.role == UserRole.admin))
        if existing_admin:
            return

        admin = User(
            unique_user_id="ADM001",
            name=settings.admin_name,
            mobile_number=settings.admin_mobile_number,
            role=UserRole.admin,
            location="",
            business_name="",
            business_type="Admin",
        )
        db.add(admin)
        db.commit()
    finally:
        db.close()
