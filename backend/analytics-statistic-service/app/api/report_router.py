from fastapi import APIRouter, Depends, Query, Request
from typing import Optional
from app.core.security import verify_token
from app.services.report_service import ReportService
from app.services.export_service import ExportService
from app.services.certificate_service import CertificateService

router = APIRouter(prefix="/report", tags=["Reports"])
service = ReportService()
export_service = ExportService()
certificate_service = CertificateService()

@router.get("/quiz/{quiz_id}")
def quiz_report(quiz_id: int, user=Depends(verify_token)):
    return service.quiz(quiz_id)

@router.get("/student/{student_id}")
def student_report(student_id: int, user=Depends(verify_token)):
    return service.student(student_id)

@router.get("/class/{class_id}")
def class_report(class_id: int, user=Depends(verify_token)):
    return service.class_(class_id)

@router.get("/question/{question_id}")
def question_report(
    question_id: int,
    user=Depends(verify_token)
):
    return service.question(question_id)

@router.get("/compare/{student_id}")
def cross_comparison(
    student_id: int,
    class_id: Optional[int] = Query(None),
    user=Depends(verify_token)
):
    """Compare student performance vs class vs system"""
    return service.cross_comparison(student_id, class_id)

@router.get("/export/csv")
def export_csv(
    request: Request,
    quiz_id: Optional[int] = Query(None),
    class_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    user=Depends(verify_token)
):
    # Rate limiting is handled at app level, no need to check here
    # Just ensure user is authenticated (already done via verify_token)
    return export_service.export_csv(quiz_id, class_id, user_id, start_date, end_date)

@router.get("/export/pdf")
def export_pdf(
    request: Request,
    quiz_id: Optional[int] = Query(None),
    class_id: Optional[int] = Query(None),
    report_type: str = Query("quiz", regex="^(quiz|class|all)$"),
    user=Depends(verify_token)
):
    # Rate limiting is handled at app level, no need to check here
    # Just ensure user is authenticated (already done via verify_token)
    return export_service.export_pdf(quiz_id, class_id, report_type)

@router.post("/certificate/generate")
def generate_certificate(
    student_id: int,
    quiz_id: int,
    send_email: bool = Query(False),
    user=Depends(verify_token)
):
    """Generate certificate for student"""
    # Get student and quiz info (would need to call other services)
    # For now, return placeholder
    return {
        "message": "Certificate generation endpoint - implement with student/quiz data fetching"
    }
