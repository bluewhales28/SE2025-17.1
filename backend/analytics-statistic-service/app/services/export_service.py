from app.utils.pdf_utils import generate_pdf
from app.utils.csv_utils import generate_csv
from app.services.report_service import ReportService

class ExportService:
    def __init__(self):
        self.report_service = ReportService()

    def export_pdf(self, report_type, ref_id):
        data = self._get_report_data(report_type, ref_id)
        return generate_pdf(report_type, ref_id, data)

    def export_csv(self, report_type, ref_id):
        data = self._get_report_data(report_type, ref_id)
        return generate_csv(report_type, ref_id, data)

    def _get_report_data(self, report_type, ref_id):
        if report_type == "quiz":
            return self.report_service.quiz_report(ref_id)
        elif report_type == "student":
            return self.report_service.student_report(ref_id)
        elif report_type == "class":
            return self.report_service.class_report(ref_id)
        elif report_type == "question":
            return self.report_service.question_report(ref_id)
        else:
            return {}
