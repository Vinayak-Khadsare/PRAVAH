from fastapi import APIRouter
from backend.database import db_manager

router = APIRouter(prefix="/compliance", tags=["Compliance"])

@router.get("")
async def get_compliance_records():
    if db_manager.is_atlas_connected and db_manager.db is not None:
        cursor = db_manager.db.compliance.find({}, {"_id": 0})
        return await cursor.to_list(length=100)
    return db_manager.memory_compliance
