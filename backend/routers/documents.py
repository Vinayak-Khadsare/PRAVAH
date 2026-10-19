from fastapi import APIRouter
from backend.database import db_manager

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("")
async def get_documents():
    docs = []
    for app in db_manager.memory_apps:
        for d in app.get("documents", []):
            docs.append({
                **d,
                "appId": app["id"],
                "institution": app["institutionName"]
            })
    return docs
