from typing import Optional
from app.services.analytics_service import AnalyticsService

class ReportService:
    def __init__(self):
        self.analytics = AnalyticsService()

    def quiz(self, quiz_id: int):
        return self.analytics.quiz_report(quiz_id)

    def student(self, student_id: int):
        return self.analytics.student_report(student_id)

    def class_(self, class_id: int):
        return self.analytics.class_report(class_id)
    
    def question(self, question_id: int):
        return self.analytics.question_analysis(question_id)
    
    def cross_comparison(self, student_id: int, class_id: Optional[int] = None):
        """Compare student performance vs class vs system"""
        return self.analytics.cross_comparison(student_id, class_id)