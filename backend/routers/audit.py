from fastapi import APIRouter
from backend.database import db_manager

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("")
async def get_audit_trail():
    events = []
    for app in db_manager.memory_apps:
        events.extend(app.get("auditLog", []))
    return events
