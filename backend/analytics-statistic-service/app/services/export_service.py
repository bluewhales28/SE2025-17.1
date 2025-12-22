import csv
import io
import tempfile
from datetime import datetime

from fastapi import HTTPException
from fastapi.responses import StreamingResponse, FileResponse

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors

from app.db.connection import get_db_connection


class ExportService:

    # =====================================================
    # CSV EXPORT
    # =====================================================
    def export_csv(
            self,
            quiz_id: int | None = None,
            class_id: int | None = None,
            user_id: int | None = None,
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
    # PDF EXPORT (BAR CHART)
    # =====================================================
    def export_pdf(self):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT
                    quiz_id,
                    COUNT(*) AS attempts,
                    AVG(score) AS avg_score
                FROM quiz_attempt_events
                GROUP BY quiz_id
                ORDER BY quiz_id
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

        # ================= PDF SETUP =================
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        pdf = canvas.Canvas(tmp.name, pagesize=A4)

        width, height = A4

        # ================= HEADER =================
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(50, height - 50, "Quiz Analytics Report")

        pdf.setFont("Helvetica", 10)
        pdf.drawString(
            50,
            height - 70,
            f"Generated at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC"
        )

        # ================= BAR CHART CONFIG =================
        chart_x = 50
        chart_y = height - 350
        chart_height = 200

        bar_width = 30
        gap = 20

        # Ép kiểu float để tránh lỗi Decimal / str
        max_avg = max(float(r["avg_score"]) for r in rows) or 1.0

        # ================= AXES =================
        pdf.setStrokeColor(colors.black)
        pdf.line(chart_x, chart_y, chart_x, chart_y + chart_height)
        pdf.line(chart_x, chart_y, width - 50, chart_y)

        # ================= DRAW BARS =================
        x = chart_x + 40
        pdf.setFont("Helvetica", 9)

        for r in rows:
            quiz_id = r["quiz_id"]
            avg_score = float(r["avg_score"])

            bar_height = (avg_score / max_avg) * chart_height

            pdf.setFillColor(colors.HexColor("#4F81BD"))
            pdf.rect(x, chart_y, bar_width, bar_height, fill=1)

            pdf.setFillColor(colors.black)

            # Quiz ID label
            pdf.drawCentredString(
                x + bar_width / 2,
                chart_y - 15,
                str(quiz_id)
            )

            # Value label
            pdf.drawCentredString(
                x + bar_width / 2,
                chart_y + bar_height + 5,
                f"{avg_score:.1f}"
            )

            x += bar_width + gap

        # ================= LEGEND =================
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(
            50,
            chart_y + chart_height + 20,
            "Average Score per Quiz"
        )

        pdf.showPage()
        pdf.save()

        return FileResponse(
            tmp.name,
            filename="quiz_analytics_report.pdf",
            media_type="application/pdf"
        )
