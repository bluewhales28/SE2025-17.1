from fastapi import APIRouter, Depends
from app.core.security import verify_token, teacher_or_admin
from app.services.report_service import ReportService
from app.services.analytics_service import AnalyticsService
from app.services.export_service import ExportService

router = APIRouter(prefix="/report", tags=["Reports"])
service = ReportService()
export_service = ExportService()

@router.get("/quiz/{quiz_id}")
def quiz_report(quiz_id: int, user=Depends(verify_token)):
    return service.quiz(quiz_id)

@router.get("/student/{student_id}")
def student_report(student_id: int, user=Depends(verify_token)):
    return service.student(student_id)

@router.get("/class/{class_id}")
def class_report(class_id: int, user=Depends(teacher_or_admin)):
    return service.class_(class_id)

@router.get("/question/{question_id}")
def question_report(
    question_id: int,
    user=Depends(teacher_or_admin)
):
    return service.question(question_id)

@router.get("/export/csv")
def export_csv(
    user=Depends(teacher_or_admin)
):
    return export_service.export_csv()


@router.get("/export/pdf")
def export_pdf(
    user=Depends(teacher_or_admin)
):
    return export_service.export_pdf()

