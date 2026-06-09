from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.common import ApiResponse
from app.schemas.order import NotificationResponse
from app.services.notification_service import get_notifications_for_user, mark_notification_as_read

router = APIRouter()


@router.get("/notifications", response_model=ApiResponse[list[NotificationResponse]])
def list_notifications(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list[NotificationResponse]]:
    notifications = get_notifications_for_user(db, current_user.id)
    return ApiResponse(success=True, message="Notifications fetched successfully.", data=notifications)


@router.put("/notifications/{notification_id}/read", response_model=ApiResponse[NotificationResponse])
def mark_as_read(
    notification_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[NotificationResponse]:
    notification = mark_notification_as_read(db, notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    return ApiResponse(success=True, message="Notification marked as read.", data=notification)
