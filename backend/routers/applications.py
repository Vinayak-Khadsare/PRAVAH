from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import time
from backend.database import db_manager
from backend.models import ObservationRequest, GraceNoticeRequest, FormBRequest, EscalateSacRequest

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.get("")
async def get_applications(
    zone: Optional[str] = None,
    q: Optional[str] = None,
    status: Optional[str] = None,
):
    if db_manager.is_atlas_connected and db_manager.db is not None:
        filter_query = {}
        if zone and zone != "All":
            filter_query["regionalOffice"] = {"$regex": zone, "$options": "i"}
        if status and status != "all":
            filter_query["status"] = status
        if q:
            filter_query["$or"] = [
                {"id": {"$regex": q, "$options": "i"}},
                {"pid": {"$regex": q, "$options": "i"}},
                {"institutionName": {"$regex": q, "$options": "i"}},
                {"city": {"$regex": q, "$options": "i"}}
            ]
        cursor = db_manager.db.applications.find(filter_query, {"_id": 0})
        return await cursor.to_list(length=100)
    
    # In-memory demo fallback
    results = [dict(a) for a in db_manager.memory_apps]
    if zone and zone != "All":
        results = [a for a in results if zone.lower() in a["regionalOffice"].lower()]
    if status and status != "all":
        results = [a for a in results if a["status"] == status]
    if q:
        query = q.lower()
        results = [
            a for a in results
            if query in a["id"].lower()
            or query in a["pid"].lower()
            or query in a["institutionName"].lower()
            or query in a["city"].lower()
        ]
    return results

@router.get("/{app_id}")
async def get_application(app_id: str):
    if db_manager.is_atlas_connected and db_manager.db is not None:
        doc = await db_manager.db.applications.find_one({"$or": [{"id": app_id}, {"pid": app_id}]}, {"_id": 0})
        if doc:
            return doc
    for a in db_manager.memory_apps:
        if a["id"] == app_id or a["pid"] == app_id:
            return a
    # Default fallback to primary Stitch case
    return db_manager.memory_apps[0]

@router.post("/{app_id}/observations")
async def record_observation(app_id: str, req: ObservationRequest):
    new_event = {
        "id": f"log-{int(time.time())}",
        "title": "Scrutiny Officer Observation Recorded",
        "timestamp": time.strftime("%d %b %Y, %I:%M %p IST"),
        "description": req.observation,
        "actor": f"{req.officerName} | Manual Scrutiny Entry",
        "type": "action",
    }
    
    for a in db_manager.memory_apps:
        if a["id"] == app_id:
            a.setdefault("auditLog", []).insert(0, new_event)
            break
            
    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.applications.update_one(
            {"id": app_id},
            {"$push": {"auditLog": {"$each": [new_event], "$position": 0}}}
        )
    return {"success": True, "event": new_event}

@router.post("/{app_id}/grace-notice")
async def grant_grace_notice(app_id: str, req: GraceNoticeRequest):
    new_event = {
        "id": f"log-{int(time.time())}",
        "title": f"Statutory {req.hours}-Hour Cure Extension Granted",
        "timestamp": time.strftime("%d %b %Y, %I:%M %p IST"),
        "description": f"Member Secretary invoked delegated regulatory prerogative granting {req.hours} hours extension to clear Land Encumbrance seals.",
        "actor": "Dr. R. K. Srivastava (Member Secretary - RO Auth)",
        "type": "decision",
        "sha256": "99AC712B00E4F9"
    }
    for a in db_manager.memory_apps:
        if a["id"] == app_id:
            a.setdefault("auditLog", []).insert(0, new_event)
            if "criticalBlocker" in a and a["criticalBlocker"]:
                a["criticalBlocker"]["question2_whyBlocked"] += f" [Grace notice active: {req.hours}h cure window granted]"
            break
    return {"success": True, "event": new_event}

@router.post("/{app_id}/deficiency-form-b")
async def issue_deficiency_form_b(app_id: str, req: FormBRequest):
    new_event = {
        "id": f"log-{int(time.time())}",
        "title": "Form-B Formal Regulatory Deficiency Issued",
        "timestamp": time.strftime("%d %b %Y, %I:%M %p IST"),
        "description": f"Deficiency notice served to institution: {req.reason}. Mandatory 7-day cure window triggered.",
        "actor": f"{req.officerName} (Senior Scrutiny Officer)",
        "type": "action"
    }
    for a in db_manager.memory_apps:
        if a["id"] == app_id:
            a["status"] = "deficiency_issued"
            a["currentStageNumber"] = 3
            a["currentStageLabel"] = "Stage 03 (Re-Scrutiny & Cure)"
            a.setdefault("auditLog", []).insert(0, new_event)
            break
    return {"success": True, "event": new_event}

@router.post("/{app_id}/escalate-sac")
async def escalate_to_sac(app_id: str, req: EscalateSacRequest):
    new_event = {
        "id": f"log-{int(time.time())}",
        "title": "Escalated to Standing Appeals Committee (SAC)",
        "timestamp": time.strftime("%d %b %Y, %I:%M %p IST"),
        "description": f"Case referred to appellate committee: {req.reason}. Dossier transferred to National Appeals Registry.",
        "actor": f"{req.officerName} (Member Secretary - RO Auth)",
        "type": "decision",
        "sha256": "FA7180B992CD01"
    }
    for a in db_manager.memory_apps:
        if a["id"] == app_id:
            a["status"] = "sac_escalated"
            a["currentStageNumber"] = 5
            a["currentStageLabel"] = "Stage 05 (Standing Hearing / SAC)"
            a.setdefault("auditLog", []).insert(0, new_event)
            break
    return {"success": True, "event": new_event}

@router.post("/{app_id}/recommend-evc")
async def recommend_evc(app_id: str):
    new_event = {
        "id": f"log-{int(time.time())}",
        "title": "Recommended for Expert Visit Committee (EVC)",
        "timestamp": time.strftime("%d %b %Y, %I:%M %p IST"),
        "description": "Scrutiny requirements fulfilled. Inspection team dispatch unlocked.",
        "actor": "Dr. P. K. Verma (Senior Scrutiny Officer)",
        "type": "decision"
    }
    for a in db_manager.memory_apps:
        if a["id"] == app_id:
            a["currentStageNumber"] = 4
            a["currentStageLabel"] = "Stage 04 (EVC Inspection)"
            a["status"] = "evc_scheduled"
            a.setdefault("auditLog", []).insert(0, new_event)
            break
    return {"success": True, "event": new_event}
