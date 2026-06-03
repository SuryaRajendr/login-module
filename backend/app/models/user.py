from datetime import datetime, timezone
from enum import StrEnum

from sqlalchemy import DateTime, Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class UserRole(StrEnum):
    admin = "Admin"
    supplier = "Supplier"
    vendor = "Vendor"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    unique_user_id: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    mobile_number: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, values_callable=lambda roles: [role.value for role in roles]),
        index=True,
    )
    location: Mapped[str | None] = mapped_column(String(150), nullable=True)
    business_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    business_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
