"""
Export API endpoints for PDF and CSV
"""

import csv
import io
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.report import ExportRequest, ReportType
from app.services.analytics_service import AnalyticsService
from app.services.external_service import class_service, quiz_service

router = APIRouter()


@router.get("/pdf")
async def export_pdf(
    report_type: ReportType = Query(..., description="Type of report"),
    entity_id: int = Query(..., description="ID of the entity (quiz, student, class)"),
    include_charts: bool = Query(True, description="Include charts in PDF"),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    """
    Export report as PDF

    Args:
        report_type: Type of report (quiz, student, class, question)
        entity_id: ID of the entity
        include_charts: Include charts in PDF
        db: Database session
        authorization: Bearer token

    Returns:
        PDF file
    """
    # This would use the PDF service to generate the PDF
    # For now, return a placeholder
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="PDF export will be implemented with PDF service",
    )


@router.get("/csv")
async def export_csv(
    report_type: ReportType = Query(..., description="Type of report"),
    entity_id: int = Query(..., description="ID of the entity"),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    """
    Export report data as CSV

    Args:
        report_type: Type of report
        entity_id: ID of the entity
        db: Database session
        authorization: Bearer token

    Returns:
        CSV file
    """
    token = authorization.replace("Bearer ", "") if authorization else None

    # Fetch data based on report type
    if report_type == ReportType.QUIZ:
        quiz_results = await quiz_service.get_quiz_results(entity_id, token)
        if not quiz_results:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="No data found"
            )

        # Create CSV
        output = io.StringIO()
        fieldnames = ["student_id", "score", "time_spent", "completed_at", "passed"]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()

        for result in quiz_results:
            writer.writerow(
                {
                    "student_id": result.get("student_id"),
                    "score": result.get("score"),
                    "time_spent": result.get("time_spent"),
                    "completed_at": result.get("completed_at"),
                    "passed": result.get("score", 0) >= 60,
                }
            )

        output.seek(0)
        filename = f"quiz_{entity_id}_results_{datetime.now().strftime('%Y%m%d')}.csv"

        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    elif report_type == ReportType.STUDENT:
        attempts = await quiz_service.get_student_quiz_attempts(entity_id, token)
        if not attempts:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="No data found"
            )

        output = io.StringIO()
        fieldnames = ["quiz_id", "quiz_title", "score", "time_spent", "completed_at"]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()

        for attempt in attempts:
            writer.writerow(
                {
                    "quiz_id": attempt.get("quiz_id"),
                    "quiz_title": attempt.get("quiz_title", "Unknown"),
                    "score": attempt.get("score"),
                    "time_spent": attempt.get("time_spent"),
                    "completed_at": attempt.get("completed_at"),
                }
            )

        output.seek(0)
        filename = (
            f"student_{entity_id}_attempts_{datetime.now().strftime('%Y%m%d')}.csv"
        )

        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    elif report_type == ReportType.CLASS:
        students = await class_service.get_class_students(entity_id, token)
        if not students:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="No data found"
            )

        output = io.StringIO()
        fieldnames = ["student_id", "student_name", "email", "enrolled_at"]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()

        for student in students:
            writer.writerow(
                {
                    "student_id": student.get("id"),
                    "student_name": student.get("name"),
                    "email": student.get("email"),
                    "enrolled_at": student.get("enrolled_at"),
                }
            )

        output.seek(0)
        filename = f"class_{entity_id}_students_{datetime.now().strftime('%Y%m%d')}.csv"

        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid report type"
        )
