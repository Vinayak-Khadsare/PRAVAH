from fastapi import APIRouter
from backend.database import db_manager

router = APIRouter(prefix="/evc", tags=["EVC Inspection"])

@router.get("")
async def get_evc_schedules():
    if db_manager.is_atlas_connected and db_manager.db is not None:
        cursor = db_manager.db.evc.find({}, {"_id": 0})
        return await cursor.to_list(length=100)
    return db_manager.memory_evc

@router.post("/{evc_id}/dispatch")
async def dispatch_biometric_token(evc_id: str):
    return {
        "success": True,
        "message": f"Biometric token and geofencing credentials transmitted for {evc_id}."
    }
