from fastapi import APIRouter
from app.services.report_service import ReportService

router = APIRouter(prefix="/report", tags=["Reports"])
service = ReportService()

@router.get("/quiz/{quiz_id}")
def quiz_report(quiz_id: int):
    return service.quiz_report(quiz_id)

@router.get("/student/{student_id}")
def student_report(student_id: int):
    return service.student_report(student_id)

@router.get("/class/{class_id}")
def class_report(class_id: int):
    return service.class_report(class_id)

@router.get("/question/{question_id}")
def question_report(question_id: int):
    return service.question_report(question_id)
