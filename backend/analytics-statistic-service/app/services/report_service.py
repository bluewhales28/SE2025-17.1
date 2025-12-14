from app.repositories.analytics_repo import AnalyticsRepository

class ReportService:
    def __init__(self):
        self.repo = AnalyticsRepository()

    def quiz_report(self, quiz_id):
        return self.repo.get_quiz_metrics(quiz_id)

    def student_report(self, student_id):
        return self.repo.get_student_summary(student_id)

    def class_report(self, class_id):
        return self.repo.get_class_stats(class_id)

    def question_report(self, question_id):
        return self.repo.get_question_analytics(question_id)
