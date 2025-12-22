from fastapi import FastAPI
from app.api.report_router import router

app = FastAPI(title="Analytics Statistic Service")
app.include_router(router)
