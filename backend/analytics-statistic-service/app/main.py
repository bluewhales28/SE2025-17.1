from fastapi import FastAPI
from app.api.report_api import router as report_router
from app.api.export_api import router as export_router

app = FastAPI(title="Analytics Service")

app.include_router(report_router)
app.include_router(export_router)

@app.get("/health")
def health():
    return {"status": "ok"}
