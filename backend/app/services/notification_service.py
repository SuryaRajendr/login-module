from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.notification import Notification


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str | None,
    notification_type: str,
    related_order_id: int | None = None,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        related_order_id=related_order_id,
        is_read=False,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def get_notifications_for_user(db: Session, user_id: int) -> list[Notification]:
    statement = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc())
    return db.scalars(statement).all()


def mark_notification_as_read(db: Session, notification_id: int, user_id: int) -> Notification | None:
    notification = db.scalar(select(Notification).where(Notification.id == notification_id, Notification.user_id == user_id))
    if not notification:
        return None

    notification.is_read = True
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
