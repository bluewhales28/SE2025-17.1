import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from datetime import date

class CertificateService:
    def generate(self, student, quiz, score):
        buf = io.BytesIO()
        c = canvas.Canvas(buf, pagesize=A4)
        c.drawCentredString(300, 700, "CERTIFICATE")
        c.drawCentredString(300, 650, student)
        c.drawCentredString(300, 620, f"Quiz: {quiz}")
        c.drawCentredString(300, 590, f"Score: {score}%")
        c.drawCentredString(300, 560, str(date.today()))
        c.save()
        buf.seek(0)
        return buf
