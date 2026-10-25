import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import db_manager
from backend.services.deadline_service import DeadlineMonitorService
from backend.routers import (
    auth, admin, applications, workflow, evc, compliance, 
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

# Liveness Endpoint
@app.get("/api/live", tags=["Health"])
@app.get("/live", tags=["Health"], include_in_schema=False)
async def liveness():
    """Liveness probe: verifies process is alive and responsive."""
    return {"status": "alive", "service": settings.PROJECT_NAME, "version": settings.VERSION}

# Readiness Endpoint
@app.get("/api/ready", tags=["Health"])
@app.get("/ready", tags=["Health"], include_in_schema=False)
async def readiness():
    """Readiness probe: verifies required dependencies, storage, and database."""
    storage_ok = settings.UPLOAD_DIR.exists() and os.access(settings.UPLOAD_DIR, os.W_OK)
    
    if settings.ENVIRONMENT == "production" and not db_manager.is_atlas_connected:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=503,
            detail="Database connection is not ready for production traffic."
        )

    db_mode = "Local Demonstration Persistence Store"
    is_local = False
    if db_manager.is_atlas_connected:
        is_local = "127.0.0.1" in settings.MONGODB_URI or "localhost" in settings.MONGODB_URI
        db_mode = f"Local MongoDB ({settings.DATABASE_NAME})" if is_local else f"MongoDB Atlas ({settings.DATABASE_NAME})"

    return {
        "status": "ready",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": {
            "connected": db_manager.is_atlas_connected,
            "mode": db_mode,
            "isDemonstration": not db_manager.is_atlas_connected,
            "databaseName": settings.DATABASE_NAME
        },
        "storage": {
            "writable": storage_ok,
            "path": str(settings.UPLOAD_DIR)
        }
    }

# Health Check Endpoint
@app.get("/api/health", tags=["Health"])
@app.get("/health", tags=["Health"], include_in_schema=False)
async def health_check():
    db_mode = "Local Demonstration Persistence Store"
    is_local = False
    if db_manager.is_atlas_connected:
        is_local = "127.0.0.1" in settings.MONGODB_URI or "localhost" in settings.MONGODB_URI
        db_mode = f"Local MongoDB ({settings.DATABASE_NAME})" if is_local else f"MongoDB Atlas ({settings.DATABASE_NAME})"

    return {
        "status": "operational",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": {
            "mode": db_mode,
            "connected": db_manager.is_atlas_connected,
            "isDemonstration": not db_manager.is_atlas_connected,
            "databaseName": settings.DATABASE_NAME,
            "isLocalMongo": is_local,
        },
        "deadlineMonitor": DeadlineMonitorService.get_health(),
        "regulatoryStandard": "AICTE Approval Process Handbook (APH) 2026-2027",
    }

# Register Routers under /api
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(admin.router, prefix=settings.API_PREFIX)
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
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
