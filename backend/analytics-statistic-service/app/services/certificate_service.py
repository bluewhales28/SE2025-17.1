import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.units import inch
from datetime import date
from typing import Optional, Dict, Any
from app.services.http_clients import NotificationServiceClient

class CertificateService:
    """Service for generating certificates"""
    
    def __init__(self):
        self.notification_client = NotificationServiceClient()
    
    def generate(
        self, 
        student_name: str, 
        quiz_name: str, 
        score: float,
        total_score: float,
        class_name: Optional[str] = None,
        organization_name: Optional[str] = "Quiz System"
    ) -> io.BytesIO:
        """Generate a beautiful certificate PDF"""
        buf = io.BytesIO()
        c = canvas.Canvas(buf, pagesize=A4)
        width, height = A4
        
        # Background color
        c.setFillColor(colors.HexColor('#F5F5F5'))
        c.rect(0, 0, width, height, fill=1)
        
        # Border
        c.setStrokeColor(colors.HexColor('#D4AF37'))
        c.setLineWidth(5)
        c.rect(0.5*inch, 0.5*inch, width - 1*inch, height - 1*inch, fill=0)
        
        # Inner border
        c.setLineWidth(2)
        c.rect(0.7*inch, 0.7*inch, width - 1.4*inch, height - 1.4*inch, fill=0)
        
        # Title
        c.setFillColor(colors.HexColor('#1a1a1a'))
        c.setFont("Helvetica-Bold", 36)
        c.drawCentredString(width/2, height - 2*inch, "CERTIFICATE")
        c.setFont("Helvetica-Bold", 20)
        c.drawCentredString(width/2, height - 2.5*inch, "OF COMPLETION")
        
        # Decorative line
        c.setStrokeColor(colors.HexColor('#D4AF37'))
        c.setLineWidth(3)
        c.line(width/2 - 2*inch, height - 2.8*inch, width/2 + 2*inch, height - 2.8*inch)
        
        # Body text
        c.setFillColor(colors.HexColor('#333333'))
        c.setFont("Helvetica", 14)
        c.drawCentredString(width/2, height - 3.5*inch, "This is to certify that")
        
        # Student name
        c.setFont("Helvetica-Bold", 24)
        c.setFillColor(colors.HexColor('#1a1a1a'))
        c.drawCentredString(width/2, height - 4.2*inch, student_name)
        
        # Achievement text
        c.setFont("Helvetica", 14)
        c.setFillColor(colors.HexColor('#333333'))
        c.drawCentredString(width/2, height - 4.8*inch, "has successfully completed")
        
        # Quiz name
        c.setFont("Helvetica-Bold", 18)
        c.setFillColor(colors.HexColor('#1a1a1a'))
        c.drawCentredString(width/2, height - 5.4*inch, quiz_name)
        
        # Score
        percentage = (score / total_score * 100) if total_score > 0 else 0
        c.setFont("Helvetica", 14)
        c.setFillColor(colors.HexColor('#333333'))
        c.drawCentredString(width/2, height - 6*inch, f"with a score of {score:.1f}/{total_score:.1f} ({percentage:.1f}%)")
        
        # Class name (if provided)
        if class_name:
            c.setFont("Helvetica", 12)
            c.drawCentredString(width/2, height - 6.5*inch, f"Class: {class_name}")
        
        # Date
        c.setFont("Helvetica", 12)
        c.drawCentredString(width/2, height - 7.2*inch, f"Date: {date.today().strftime('%B %d, %Y')}")
        
        # Organization
        c.setFont("Helvetica-Bold", 14)
        c.setFillColor(colors.HexColor('#1a1a1a'))
        c.drawCentredString(width/2, 1.5*inch, organization_name)
        
        c.save()
        buf.seek(0)
        return buf
    
    def generate_and_send(
        self,
        student_id: int,
        student_email: str,
        student_name: str,
        quiz_id: int,
        quiz_name: str,
        score: float,
        total_score: float,
        class_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate certificate and send via notification service"""
        certificate_pdf = self.generate(
            student_name=student_name,
            quiz_name=quiz_name,
            score=score,
            total_score=total_score,
            class_name=class_name
        )
        
        # Send via notification service
        try:
            self.notification_client.send_certificate(
                email=student_email,
                student_name=student_name,
                quiz_name=quiz_name,
                certificate_pdf=certificate_pdf
            )
            return {
                "success": True,
                "message": "Certificate generated and sent successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Certificate generated but failed to send: {str(e)}",
                "certificate": certificate_pdf
            }
