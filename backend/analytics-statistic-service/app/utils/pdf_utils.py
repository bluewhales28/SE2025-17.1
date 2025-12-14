from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

def generate_pdf(report_type, ref_id, data):
    path = f"/tmp/{report_type}_{ref_id}.pdf"
    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(path)

    elements = []
    elements.append(
        Paragraph(f"{report_type.upper()} REPORT #{ref_id}", styles["Title"])
    )
    elements.append(Spacer(1, 12))

    if isinstance(data, dict) and data:
        for key, value in data.items():
            elements.append(
                Paragraph(f"<b>{key}</b>: {value}", styles["Normal"])
            )
            elements.append(Spacer(1, 6))
    else:
        elements.append(Paragraph("No data available", styles["Normal"]))

    doc.build(elements)
    return path
