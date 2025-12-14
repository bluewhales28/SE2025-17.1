from fastapi import APIRouter
from fastapi.responses import FileResponse
from app.services.export_service import ExportService

router = APIRouter(prefix="/export", tags=["Export"])
service = ExportService()

@router.get("/pdf", response_class=FileResponse)
def export_pdf(type: str, ref_id: int):
    file_path = service.export_pdf(type, ref_id)
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=f"{type}_{ref_id}.pdf"
    )

@router.get("/csv", response_class=FileResponse)
def export_csv(type: str, ref_id: int):
    file_path = service.export_csv(type, ref_id)
    return FileResponse(
        file_path,
        media_type="text/csv",
        filename=f"{type}_{ref_id}.csv"
    )
