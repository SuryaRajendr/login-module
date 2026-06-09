from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.common import ApiResponse
from app.schemas.order import ReportSummaryResponse
from app.services.report_service import get_report_summary

router = APIRouter()


@router.get("/reports/summary", response_model=ApiResponse[ReportSummaryResponse])
def get_reports(
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[ReportSummaryResponse]:
    payload = get_report_summary(db, start_date, end_date)
    return ApiResponse(success=True, message="Report summary fetched successfully.", data=payload)
