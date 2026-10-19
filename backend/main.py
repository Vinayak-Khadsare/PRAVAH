import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import db_manager
from backend.services.deadline_service import DeadlineMonitorService
from backend.routers import (
    auth, applications, workflow, evc, compliance, 
    documents, alerts, audit, policies
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pravah.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and initial deadline monitor pass
    logger.info("Starting PRAVAH AICTE Operations Backend Engine...")
    await db_manager.connect()
    try:
        monitor_result = await DeadlineMonitorService.evaluate_application_deadlines()
        logger.info(f"Initial deadline evaluation complete: {monitor_result}")
    except Exception as e:
        logger.warning(f"Error during initial deadline evaluation: {e}")
    yield
    # Shutdown: Clean DB disconnect
    logger.info("Shutting down PRAVAH AICTE Operations Backend Engine...")
    await db_manager.disconnect()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Unified backend API for AICTE Approval Process Operations.",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check Endpoint
@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "operational",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": {
            "mode": "MongoDB Atlas" if db_manager.is_atlas_connected else "Local Demonstration Persistence Store",
            "connected": True,
        },
        "deadlineMonitor": DeadlineMonitorService.get_health(),
        "regulatoryStandard": "AICTE Approval Process Handbook (APH) 2026-2027",
    }

# Register Routers under /api
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(applications.router, prefix=settings.API_PREFIX)
app.include_router(workflow.router, prefix=settings.API_PREFIX)
app.include_router(evc.router, prefix=settings.API_PREFIX)
app.include_router(compliance.router, prefix=settings.API_PREFIX)
app.include_router(documents.router, prefix=settings.API_PREFIX)
app.include_router(alerts.router, prefix=settings.API_PREFIX)
app.include_router(audit.router, prefix=settings.API_PREFIX)
app.include_router(policies.router, prefix=settings.API_PREFIX)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
