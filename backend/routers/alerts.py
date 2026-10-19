from fastapi import APIRouter
from backend.database import db_manager

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("")
async def get_alerts():
    if db_manager.is_atlas_connected and db_manager.db is not None:
        cursor = db_manager.db.alerts.find({}, {"_id": 0})
        return await cursor.to_list(length=100)
    return db_manager.memory_alerts

@router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    for a in db_manager.memory_alerts:
        if a["id"] == alert_id:
            a["resolved"] = True
            break
    return {"success": True, "alertId": alert_id}
