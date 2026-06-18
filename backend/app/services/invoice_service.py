from datetime import date, datetime, timezone
from collections import defaultdict

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.billing_history import BillingHistory
from app.models.invoice import Invoice, InvoiceStatus
from app.models.payment import Payment, PaymentStatus
from app.models.product import Product
from app.models.user import User, UserRole


def _to_float(value: float | int | None) -> float:
    return float(value or 0)


def _total_amount(quantity: int, price: float, tax: float) -> float:
    return round((quantity * price) + tax, 2)


def _generate_invoice_number(db: Session) -> str:
    count = db.scalar(select(func.count()).select_from(Invoice)) or 0
    candidate = f"INV{count + 1:05d}"
    while db.scalar(select(Invoice).where(Invoice.invoice_number == candidate)):
        count += 1
        candidate = f"INV{count + 1:05d}"
    return candidate


def _generate_transaction_number(db: Session) -> str:
    count = db.scalar(select(func.count()).select_from(Payment)) or 0
    candidate = f"TXN{count + 1:05d}"
    while db.scalar(select(Payment).where(Payment.transaction_number == candidate)):
        count += 1
        candidate = f"TXN{count + 1:05d}"
    return candidate


def _invoice_payment_status(invoice_status: str) -> PaymentStatus:
    if invoice_status == InvoiceStatus.paid.value:
        return PaymentStatus.paid
    if invoice_status == InvoiceStatus.overdue.value:
        return PaymentStatus.pending
    if invoice_status == InvoiceStatus.pending.value:
        return PaymentStatus.pending
    if invoice_status == InvoiceStatus.sent.value:
        return PaymentStatus.pending
    return PaymentStatus.pending


def _get_user_name(db: Session, user_id: int) -> str:
    user = db.get(User, user_id)
    return user.name if user else "Unknown"


def _serialize_invoice(db: Session, invoice: Invoice) -> dict:
    payment = db.scalar(
        select(Payment).where(Payment.invoice_id == invoice.id).order_by(Payment.created_at.desc())
    )
    return {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "vendor_id": invoice.vendor_id,
        "vendor_name": _get_user_name(db, invoice.vendor_id),
        "supplier_id": invoice.supplier_id,
        "supplier_name": _get_user_name(db, invoice.supplier_id),
        "product_details": invoice.product_details,
        "quantity": invoice.quantity,
        "price": invoice.price,
        "tax": invoice.tax,
        "total_amount": invoice.total_amount,
        "invoice_date": invoice.invoice_date,
        "due_date": invoice.due_date,
        "status": invoice.status,
        "payment_status": payment.payment_status if payment else None,
        "created_at": invoice.created_at,
        "updated_at": invoice.updated_at,
    }


def _serialize_payment(db: Session, payment: Payment) -> dict:
    invoice = db.get(Invoice, payment.invoice_id)
    vendor_name = _get_user_name(db, invoice.vendor_id) if invoice else "Unknown"
    supplier_name = _get_user_name(db, invoice.supplier_id) if invoice else "Unknown"
    return {
        "id": payment.id,
        "invoice_id": payment.invoice_id,
        "invoice_number": invoice.invoice_number if invoice else "Unknown",
        "vendor_name": vendor_name,
        "supplier_name": supplier_name,
        "amount": payment.amount,
        "payment_status": payment.payment_status,
        "payment_method": payment.payment_method,
        "transaction_details": payment.transaction_details,
        "paid_at": payment.paid_at,
        "created_at": payment.created_at,
        "updated_at": payment.updated_at,
    }


def _serialize_history(db: Session, history: BillingHistory) -> dict:
    invoice_number = None
    if history.invoice_id:
        invoice = db.get(Invoice, history.invoice_id)
        invoice_number = invoice.invoice_number if invoice else None
    return {
        "id": history.id,
        "invoice_id": history.invoice_id,
        "invoice_number": invoice_number,
        "event_type": history.event_type,
        "amount": history.amount,
        "status": history.status,
        "notes": history.notes,
        "created_at": history.created_at,
    }


def _record_history(
    db: Session,
    invoice_id: int | None,
    event_type: str,
    amount: float,
    status: str,
    notes: str | None = None,
) -> BillingHistory:
    history = BillingHistory(
        invoice_id=invoice_id,
        event_type=event_type,
        amount=amount,
        status=status,
        notes=notes,
    )
    db.add(history)
    db.flush()
    return history


def _sync_payment(db: Session, invoice: Invoice, payment_method: str | None = "Manual") -> Payment:
    payment = db.scalar(select(Payment).where(Payment.invoice_id == invoice.id))
    payment_status = _invoice_payment_status(invoice.status)
    if not payment:
        payment = Payment(
            invoice_id=invoice.id,
            transaction_number=_generate_transaction_number(db),
            amount=invoice.total_amount,
            payment_status=payment_status.value,
            payment_method=payment_method,
            transaction_details=f"Auto-generated payment record for {invoice.invoice_number}",
            paid_at=datetime.now(timezone.utc) if payment_status == PaymentStatus.paid else None,
        )
        db.add(payment)
    else:
        payment.amount = invoice.total_amount
        payment.payment_status = payment_status.value
        payment.payment_method = payment_method or payment.payment_method
        payment.transaction_details = f"Updated payment record for {invoice.invoice_number}"
        payment.paid_at = datetime.now(timezone.utc) if payment_status == PaymentStatus.paid else None
        db.add(payment)
    db.flush()
    return payment


def _validate_party(db: Session, user_id: int, role: UserRole, label: str) -> User:
    user = db.get(User, user_id)
    if not user:
        raise ValueError(f"{label} not found.")
    if user.role != role:
        raise ValueError(f"Selected {label.lower()} must have a {role.value.lower()} role.")
    return user


def create_invoice(db: Session, payload, current_user) -> dict:
    _validate_party(db, payload.vendor_id, UserRole.vendor, "Vendor")
    _validate_party(db, payload.supplier_id, UserRole.supplier, "Supplier")
    if not payload.product_details.strip():
        raise ValueError("Product details are required.")

    invoice = Invoice(
        invoice_number=_generate_invoice_number(db),
        vendor_id=payload.vendor_id,
        supplier_id=payload.supplier_id,
        product_details=payload.product_details.strip(),
        quantity=payload.quantity,
        price=_to_float(payload.price),
        tax=_to_float(payload.tax),
        total_amount=_total_amount(payload.quantity, payload.price, payload.tax),
        invoice_date=payload.invoice_date,
        due_date=payload.due_date,
        status=payload.status.value,
    )
    db.add(invoice)
    db.flush()

    _sync_payment(db, invoice)
    _record_history(
        db,
        invoice.id,
        "Invoice Created",
        invoice.total_amount,
        invoice.status,
        f"Invoice {invoice.invoice_number} was created by {current_user.name}.",
    )

    db.commit()
    db.refresh(invoice)
    return _serialize_invoice(db, invoice)


def update_invoice(db: Session, invoice_id: int, payload, current_user) -> dict:
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise ValueError("Invoice not found.")

    if payload.vendor_id is not None:
        _validate_party(db, payload.vendor_id, UserRole.vendor, "Vendor")
        invoice.vendor_id = payload.vendor_id
    if payload.supplier_id is not None:
        _validate_party(db, payload.supplier_id, UserRole.supplier, "Supplier")
        invoice.supplier_id = payload.supplier_id
    if payload.product_details is not None:
        if not payload.product_details.strip():
            raise ValueError("Product details cannot be empty.")
        invoice.product_details = payload.product_details.strip()
    if payload.quantity is not None:
        invoice.quantity = payload.quantity
    if payload.price is not None:
        invoice.price = _to_float(payload.price)
    if payload.tax is not None:
        invoice.tax = _to_float(payload.tax)
    if payload.invoice_date is not None:
        invoice.invoice_date = payload.invoice_date
    if payload.due_date is not None:
        invoice.due_date = payload.due_date
    if payload.status is not None:
        invoice.status = payload.status.value

    invoice.total_amount = _total_amount(invoice.quantity, invoice.price, invoice.tax)
    db.add(invoice)
    db.flush()

    payment = _sync_payment(db, invoice)
    _record_history(
        db,
        invoice.id,
        "Invoice Updated",
        invoice.total_amount,
        invoice.status,
        f"Invoice {invoice.invoice_number} was updated by {current_user.name}.",
    )
    _record_history(
        db,
        invoice.id,
        "Payment Synced",
        payment.amount,
        payment.payment_status,
        f"Payment status is now {payment.payment_status}.",
    )

    db.commit()
    db.refresh(invoice)
    return _serialize_invoice(db, invoice)


def get_invoice_by_id(db: Session, invoice_id: int) -> dict:
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise ValueError("Invoice not found.")
    return _serialize_invoice(db, invoice)


def list_invoices(db: Session) -> list[dict]:
    statement = select(Invoice).order_by(Invoice.created_at.desc())
    invoices = db.scalars(statement).all()
    return [_serialize_invoice(db, invoice) for invoice in invoices]


def get_invoice_form_data(db: Session) -> dict:
    vendors = (
        db.scalars(select(User).where(User.role == UserRole.vendor).order_by(User.name.asc())).all()
    )
    suppliers = (
        db.scalars(select(User).where(User.role == UserRole.supplier).order_by(User.name.asc())).all()
    )
    products = db.scalars(select(Product).order_by(Product.name.asc())).all()

    return {
        "vendors": [{"id": user.id, "name": user.name} for user in vendors],
        "suppliers": [{"id": user.id, "name": user.name} for user in suppliers],
        "products": [
            {
                "id": product.id,
                "name": product.name,
                "category": product.category,
                "price": product.price,
                "supplier_id": product.supplier_id,
                "supplier_name": _get_user_name(db, product.supplier_id),
            }
            for product in products
        ],
    }


def list_payments(db: Session) -> list[dict]:
    statement = select(Payment).order_by(Payment.created_at.desc())
    payments = db.scalars(statement).all()
    return [_serialize_payment(db, payment) for payment in payments]


def get_billing_summary(db: Session) -> dict:
    invoices = db.scalars(select(Invoice)).all()
    payments = db.scalars(select(Payment).order_by(Payment.created_at.desc())).all()
    histories = db.scalars(select(BillingHistory).order_by(BillingHistory.created_at.desc())).all()

    paid_amount = 0.0
    pending_amount = 0.0
    overdue_amount = 0.0
    monthly_revenue: dict[str, float] = defaultdict(float)

    for invoice in invoices:
        status = invoice.status
        if status == InvoiceStatus.paid.value:
            paid_amount += invoice.total_amount
            monthly_revenue[invoice.invoice_date.strftime("%b %Y")] += invoice.total_amount
        elif status == InvoiceStatus.overdue.value:
            overdue_amount += invoice.total_amount
        else:
            pending_amount += invoice.total_amount

    overview = [
        {"label": label, "amount": round(amount, 2)}
        for label, amount in sorted(monthly_revenue.items(), key=lambda item: item[0])
    ]

    recent_payments = payments[:5]
    recent_history = histories[:8]

    return {
        "invoice_count": len(invoices),
        "total_revenue": round(paid_amount + pending_amount + overdue_amount, 2),
        "paid_amount": round(paid_amount, 2),
        "pending_amount": round(pending_amount, 2),
        "overdue_amount": round(overdue_amount, 2),
        "revenue_overview": overview,
        "recent_payments": [_serialize_payment(db, payment) for payment in recent_payments],
        "recent_history": [_serialize_history(db, history) for history in recent_history],
    }


def get_payment_details(db: Session) -> list[dict]:
    return list_payments(db)