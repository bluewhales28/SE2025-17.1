"""
PDF generation service using ReportLab
"""
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import os
from typing import Dict, Any, List, Optional
import matplotlib.pyplot as plt
import io

from app.config import settings


class PDFService:
    """Service for generating PDF reports and certificates"""
    
    def __init__(self):
        self.output_dir = settings.pdf_output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self.styles = getSampleStyleSheet()
    
    async def generate_report_pdf(
        self,
        report_type: str,
        data: Dict[str, Any],
        filename: str,
        include_charts: bool = True
    ) -> str:
        """
        Generate a PDF report
        
        Args:
            report_type: Type of report (quiz, student, class)
            data: Report data
            filename: Output filename
            include_charts: Include charts in PDF
        
        Returns:
            Path to generated PDF file
        """
        filepath = os.path.join(self.output_dir, filename)
        doc = SimpleDocTemplate(filepath, pagesize=letter)
        story = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        if report_type == "quiz":
            story.append(Paragraph(f"Quiz Report: {data.get('quiz_title', 'Unknown')}", title_style))
        elif report_type == "student":
            story.append(Paragraph(f"Student Progress Report: {data.get('student_name', 'Unknown')}", title_style))
        elif report_type == "class":
            story.append(Paragraph(f"Class Statistics: {data.get('class_name', 'Unknown')}", title_style))
        
        story.append(Spacer(1, 0.2*inch))
        
        # Add report date
        date_style = self.styles['Normal']
        story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}", date_style))
        story.append(Spacer(1, 0.3*inch))
        
        # Add statistics section
        if report_type == "quiz":
            story.extend(self._add_quiz_statistics(data))
        elif report_type == "student":
            story.extend(self._add_student_statistics(data))
        elif report_type == "class":
            story.extend(self._add_class_statistics(data))
        
        # Add charts if requested
        if include_charts:
            chart_elements = await self._add_charts(report_type, data)
            story.extend(chart_elements)
        
        # Build PDF
        doc.build(story)
        return filepath
    
    def _add_quiz_statistics(self, data: Dict[str, Any]) -> List:
        """Add quiz statistics to PDF"""
        elements = []
        
        # Summary section
        heading_style = self.styles['Heading2']
        elements.append(Paragraph("Quiz Summary", heading_style))
        elements.append(Spacer(1, 0.1*inch))
        
        # Statistics table
        stats = data.get('statistics', {})
        table_data = [
            ['Metric', 'Value'],
            ['Total Attempts', str(data.get('total_attempts', 0))],
            ['Unique Students', str(data.get('unique_students', 0))],
            ['Average Score', f"{stats.get('mean', 0):.2f}%"],
            ['Median Score', f"{stats.get('median', 0):.2f}%"],
            ['Min Score', f"{stats.get('min_score', 0):.2f}%"],
            ['Max Score', f"{stats.get('max_score', 0):.2f}%"],
            ['Pass Rate', f"{data.get('pass_rate', 0):.2f}%"],
            ['Avg Time (minutes)', f"{data.get('average_time_minutes', 0):.2f}"],
        ]
        
        table = Table(table_data, colWidths=[3*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498DB')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 0.3*inch))
        
        return elements
    
    def _add_student_statistics(self, data: Dict[str, Any]) -> List:
        """Add student statistics to PDF"""
        elements = []
        
        heading_style = self.styles['Heading2']
        elements.append(Paragraph("Student Performance", heading_style))
        elements.append(Spacer(1, 0.1*inch))
        
        table_data = [
            ['Metric', 'Value'],
            ['Total Quizzes Attempted', str(data.get('total_quizzes_attempted', 0))],
            ['Completed Quizzes', str(data.get('total_quizzes_completed', 0))],
            ['Average Score', f"{data.get('average_score', 0):.2f}%"],
            ['Best Score', f"{data.get('best_score', 0):.2f}%"],
            ['Worst Score', f"{data.get('worst_score', 0):.2f}%"],
            ['Completion Rate', f"{data.get('completion_rate', 0):.2f}%"],
            ['Total Time Spent', f"{data.get('total_time_spent_minutes', 0):.2f} minutes"],
        ]
        
        table = Table(table_data, colWidths=[3*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2ECC71')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 0.3*inch))
        
        return elements
    
    def _add_class_statistics(self, data: Dict[str, Any]) -> List:
        """Add class statistics to PDF"""
        elements = []
        
        heading_style = self.styles['Heading2']
        elements.append(Paragraph("Class Overview", heading_style))
        elements.append(Spacer(1, 0.1*inch))
        
        table_data = [
            ['Metric', 'Value'],
            ['Total Students', str(data.get('total_students', 0))],
            ['Active Students', str(data.get('active_students', 0))],
            ['Average Score', f"{data.get('average_score', 0):.2f}%"],
            ['Completion Rate', f"{data.get('completion_rate', 0):.2f}%"],
            ['Pass Rate', f"{data.get('pass_rate', 0):.2f}%"],
        ]
        
        table = Table(table_data, colWidths=[3*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E74C3C')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 0.3*inch))
        
        return elements
    
    async def _add_charts(self, report_type: str, data: Dict[str, Any]) -> List:
        """Generate and add charts to PDF"""
        elements = []
        
        # Generate score distribution chart
        score_dist = data.get('score_distribution', {})
        if score_dist:
            plt.figure(figsize=(8, 4))
            labels = list(score_dist.keys())
            values = list(score_dist.values())
            plt.bar(labels, values, color='#3498DB')
            plt.xlabel('Score Range')
            plt.ylabel('Number of Students')
            plt.title('Score Distribution')
            plt.xticks(rotation=45)
            plt.tight_layout()
            
            # Save to BytesIO
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', dpi=150)
            img_buffer.seek(0)
            plt.close()
            
            # Add to PDF
            img = Image(img_buffer, width=6*inch, height=3*inch)
            elements.append(img)
            elements.append(Spacer(1, 0.3*inch))
        
        return elements
    
    async def generate_certificate(
        self,
        student_name: str,
        certificate_data: Dict[str, Any]
    ) -> str:
        """
        Generate a certificate PDF
        
        Args:
            student_name: Name of the student
            certificate_data: Certificate details
        
        Returns:
            Path to generated certificate
        """
        certificate_number = certificate_data.get('certificate_number', 'CERT-000000')
        filename = f"certificate_{certificate_number}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        
        doc = SimpleDocTemplate(filepath, pagesize=A4)
        story = []
        
        # Certificate border/design would go here
        # For now, simple text-based certificate
        
        # Title
        title_style = ParagraphStyle(
            'CertificateTitle',
            parent=self.styles['Heading1'],
            fontSize=36,
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        story.append(Spacer(1, 1.5*inch))
        story.append(Paragraph("CERTIFICATE OF COMPLETION", title_style))
        story.append(Spacer(1, 0.5*inch))
        
        # Student name
        name_style = ParagraphStyle(
            'StudentName',
            parent=self.styles['Normal'],
            fontSize=24,
            textColor=colors.HexColor('#3498DB'),
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        story.append(Paragraph(f"{student_name}", name_style))
        story.append(Spacer(1, 0.3*inch))
        
        # Description
        desc_style = ParagraphStyle(
            'Description',
            parent=self.styles['Normal'],
            fontSize=14,
            alignment=TA_CENTER,
            spaceAfter=10
        )
        
        title = certificate_data.get('title', 'Quiz Completion')
        description = certificate_data.get('description', 'Has successfully completed the quiz')
        
        story.append(Paragraph(f"has successfully completed", desc_style))
        story.append(Spacer(1, 0.2*inch))
        story.append(Paragraph(f"<b>{title}</b>", desc_style))
        
        if description:
            story.append(Spacer(1, 0.2*inch))
            story.append(Paragraph(description, desc_style))
        
        # Score
        score = certificate_data.get('score')
        if score is not None:
            story.append(Spacer(1, 0.3*inch))
            score_style = ParagraphStyle(
                'Score',
                parent=self.styles['Normal'],
                fontSize=18,
                alignment=TA_CENTER,
                textColor=colors.HexColor('#2ECC71')
            )
            story.append(Paragraph(f"Score: {score:.2f}%", score_style))
        
        # Date and certificate number
        story.append(Spacer(1, 0.5*inch))
        footer_style = self.styles['Normal']
        completion_date = certificate_data.get('completion_date', datetime.now())
        if isinstance(completion_date, str):
            date_str = completion_date
        else:
            date_str = completion_date.strftime('%B %d, %Y')
        
        story.append(Paragraph(f"Date: {date_str}", footer_style))
        story.append(Paragraph(f"Certificate Number: {certificate_number}", footer_style))
        
        # Build PDF
        doc.build(story)
        return filepath


# Global PDF service instance
pdf_service = PDFService()


