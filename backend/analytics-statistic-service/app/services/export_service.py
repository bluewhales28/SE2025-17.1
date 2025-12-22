import csv
import io
import base64
import tempfile
from datetime import datetime
from typing import Optional

from fastapi import HTTPException, Query
from fastapi.responses import StreamingResponse, FileResponse

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

from app.db.connection import get_db_connection
from app.services.chart_service import ChartService


class ExportService:

    def __init__(self):
        self.chart_service = ChartService()

    # =====================================================
    # CSV EXPORT
    # =====================================================
    def export_csv(
            self,
            quiz_id: Optional[int] = None,
            class_id: Optional[int] = None,
            user_id: Optional[int] = None,
            start_date: Optional[str] = None,
            end_date: Optional[str] = None,
        ):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()  # thường là RealDictCursor

            query = """
                SELECT
                    quiz_id,
                    user_id,
                    class_id,
                    score,
                    total_score,
                    topic,
                    difficulty,
                    submitted_at
                FROM quiz_attempt_events
                WHERE 1 = 1
            """
            params = []

            if quiz_id is not None:
                query += " AND quiz_id = %s"
                params.append(quiz_id)

            if class_id is not None:
                query += " AND class_id = %s"
                params.append(class_id)

            if user_id is not None:
                query += " AND user_id = %s"
                params.append(user_id)

            if start_date:
                query += " AND submitted_at >= %s"
                params.append(start_date)

            if end_date:
                query += " AND submitted_at <= %s"
                params.append(end_date)

            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()

            if not rows:
                raise HTTPException(
                    status_code=404,
                    detail="No data available for export"
                )

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Export CSV failed: {str(e)}"
            )

        finally:
            cursor.close()
            conn.close()

        # ===============================
        # CSV STREAM (DICT-SAFE)
        # ===============================
        def csv_generator():
            output = io.StringIO()
            output.write("\ufeff")  # UTF-8 BOM cho Excel

            # 👉 rows là list[dict]
            headers = rows[0].keys()

            writer = csv.DictWriter(output, fieldnames=headers)
            writer.writeheader()
            writer.writerows(rows)

            yield output.getvalue()
            output.close()

        return StreamingResponse(
            csv_generator(),
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=quiz_attempts.csv"
            }
        )

    # =====================================================
    # PDF EXPORT (ENHANCED WITH CHARTS)
    # =====================================================
    def export_pdf(
            self,
            quiz_id: Optional[int] = None,
            class_id: Optional[int] = None,
            report_type: str = "quiz"
        ):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Build query based on report type
            if report_type == "quiz" and quiz_id:
                cursor.execute("""
                    SELECT
                        quiz_id,
                        COUNT(*) AS attempts,
                        AVG(score::float / total_score * 100) AS avg_score,
                        MIN(score::float / total_score * 100) AS min_score,
                        MAX(score::float / total_score * 100) AS max_score
                    FROM quiz_attempt_events
                    WHERE quiz_id = %s
                    GROUP BY quiz_id
                """, (quiz_id,))
            elif report_type == "class" and class_id:
                cursor.execute("""
                    SELECT
                        user_id,
                        COUNT(*) AS attempts,
                        AVG(score::float / total_score * 100) AS avg_score
                    FROM quiz_attempt_events
                    WHERE class_id = %s
                    GROUP BY user_id
                    ORDER BY avg_score DESC
                    LIMIT 10
                """, (class_id,))
            else:
                cursor.execute("""
                    SELECT
                        quiz_id,
                        COUNT(*) AS attempts,
                        AVG(score::float / total_score * 100) AS avg_score
                    FROM quiz_attempt_events
                    GROUP BY quiz_id
                    ORDER BY quiz_id
                    LIMIT 20
                """)

            rows = cursor.fetchall()

            if not rows:
                raise HTTPException(
                    status_code=404,
                    detail="No data available for PDF export"
                )

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Export PDF failed: {str(e)}"
            )

        finally:
            cursor.close()
            conn.close()

        # ================= PDF SETUP (Using SimpleDocTemplate) =================
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        doc = SimpleDocTemplate(tmp.name, pagesize=A4)
        story = []
        styles = getSampleStyleSheet()

        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        story.append(Paragraph("Analytics Report", title_style))
        story.append(Spacer(1, 0.2*inch))

        # Metadata
        meta_style = ParagraphStyle(
            'Meta',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.grey
        )
        story.append(Paragraph(
            f"Generated at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC",
            meta_style
        ))
        story.append(Spacer(1, 0.3*inch))

        # Generate chart
        if report_type == "quiz" and quiz_id:
            chart_data = {str(r["quiz_id"]): float(r["avg_score"]) for r in rows}
            chart_title = f"Quiz {quiz_id} Performance"
        elif report_type == "class" and class_id:
            chart_data = {f"Student {r['user_id']}": float(r["avg_score"]) for r in rows}
            chart_title = f"Class {class_id} Top Students"
        else:
            chart_data = {str(r["quiz_id"]): float(r["avg_score"]) for r in rows}
            chart_title = "Quiz Performance Overview"

        chart_base64 = self.chart_service.generate_bar_chart(chart_data, chart_title)
        chart_img = Image(io.BytesIO(base64.b64decode(chart_base64)), width=6*inch, height=3.6*inch)
        story.append(chart_img)
        story.append(Spacer(1, 0.3*inch))

        # Data table
        table_data = [["ID", "Attempts", "Avg Score", "Min", "Max"]]
        for r in rows[:10]:  # Limit to 10 rows
            row_data = [
                str(r.get("quiz_id") or r.get("user_id", "")),
                str(r["attempts"]),
                f"{float(r['avg_score']):.2f}%",
                f"{float(r.get('min_score', 0)):.2f}%" if 'min_score' in r else "-",
                f"{float(r.get('max_score', 0)):.2f}%" if 'max_score' in r else "-"
            ]
            table_data.append(row_data)

        table = Table(table_data, colWidths=[1.5*inch, 1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F81BD')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(table)

        doc.build(story)

        filename = f"{report_type}_report_{quiz_id or class_id or 'all'}.pdf"
        return FileResponse(
            tmp.name,
            filename=filename,
            media_type="application/pdf"
        )
