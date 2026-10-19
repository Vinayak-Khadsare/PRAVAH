import time
import hashlib
from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from backend.database import db_manager
from backend.models import (
    ObservationRequest, GraceNoticeRequest, FormBRequest, 
    EscalateSacRequest, StateTransitionRequest
)
from backend.dependencies import get_current_user, require_roles, verify_institution_scope
from backend.services.workflow_engine import WorkflowEngine
from backend.services.graph_service import GraphIntelligenceEngine

router = APIRouter(prefix="/applications", tags=["Applications"])

class NewApplicationRequest(BaseModel):
    institutionName: str
    pid: str
    program: str
    level: str
    state: str
    city: str
    regionalOffice: str
    appliedIntake: int
    applicationType: str = "New Technical Institution (UG/PG)"

class RectificationSubmissionRequest(BaseModel):
    deficiencyRefCode: str
    rectificationDetails: str
    documentEvidenceId: Optional[str] = None

@router.get("")
async def get_applications(
    zone: Optional[str] = None,
    q: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    user: Dict[str, Any] = Depends(get_current_user)
):
    # Role-based restriction: institution representatives only view their own PID
    inst_pid = user.get("institutionPid") if user.get("role") == "institution_rep" else None

    if db_manager.is_atlas_connected and db_manager.db is not None:
        filter_query = {}
        if inst_pid:
            filter_query["pid"] = inst_pid
        if zone and zone != "All":
            filter_query["regionalOffice"] = {"$regex": zone, "$options": "i"}
        if status_filter and status_filter != "all":
            filter_query["status"] = status_filter
        if q:
            filter_query["$or"] = [
                {"id": {"$regex": q, "$options": "i"}},
                {"pid": {"$regex": q, "$options": "i"}},
                {"institutionName": {"$regex": q, "$options": "i"}},
                {"city": {"$regex": q, "$options": "i"}}
            ]
        cursor = db_manager.db.applications.find(filter_query, {"_id": 0})
        return await cursor.to_list(length=200)

    # In-memory storage lookup
    results = list(db_manager.applications.values())
    if inst_pid:
        results = [a for a in results if a.get("pid") == inst_pid]
    if zone and zone != "All":
        results = [a for a in results if zone.lower() in a.get("regionalOffice", "").lower()]
    if status_filter and status_filter != "all":
        results = [a for a in results if a.get("status") == status_filter]
    if q:
        query = q.lower()
        results = [
            a for a in results
            if query in a.get("id", "").lower()
            or query in a.get("pid", "").lower()
            or query in a.get("institutionName", "").lower()
            or query in a.get("city", "").lower()
        ]
    return results

@router.get("/{app_id}")
async def get_application(app_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    app = None
    if db_manager.is_atlas_connected and db_manager.db is not None:
        app = await db_manager.db.applications.find_one({"$or": [{"id": app_id}, {"pid": app_id}]}, {"_id": 0})
    else:
        for a in db_manager.applications.values():
            if a.get("id") == app_id or a.get("pid") == app_id:
                app = a
                break

    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Regulatory application '{app_id}' not found in registry."
        )

    # Scoping check: institutions cannot view other institutions
    verify_institution_scope(app.get("pid", ""), user)
    return app

@router.post("", dependencies=[Depends(require_roles(["institution_rep", "aicte_admin", "super_admin"]))])
async def create_application(req: NewApplicationRequest, user: Dict[str, Any] = Depends(get_current_user)):
    # Verify institution PID matches user if institution_rep
    if user.get("role") == "institution_rep" and user.get("institutionPid") and user.get("institutionPid") != req.pid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot submit application for another institution PID."
        )

    timestamp_id = int(time.time())
    app_id = f"APP-2026-{timestamp_id % 100000:05d}"
    now_str = time.strftime("%d %b %Y, %I:%M %p IST")

    genesis_seal = hashlib.sha256(f"{app_id}:{req.pid}:{now_str}".encode()).hexdigest()[:16].upper()

    initial_audit = {
        "id": f"log-{timestamp_id}",
        "title": "Application Formal Submission Filed",
        "timestamp": now_str,
        "description": f"New institutional application successfully submitted by {user.get('name')} under AICTE Approval Process Handbook 2026-27.",
        "actor": f"{user.get('name')} ({user.get('role')})",
        "type": "action",
        "sha256": genesis_seal,
        "applicationId": app_id
    }

    new_app = {
        "id": app_id,
        "pid": req.pid,
        "institutionName": req.institutionName,
        "program": req.program,
        "level": req.level,
        "state": req.state,
        "city": req.city,
        "regionalOffice": req.regionalOffice,
        "appliedIntake": req.appliedIntake,
        "approvedIntake": 0,
        "applicationType": req.applicationType,
        "status": "intake_submitted",
        "currentStageNumber": 1,
        "currentStageLabel": "Stage 01 (Intake Submission)",
        "daysExpended": 1,
        "statutoryCeiling": 15,
        "criticalBlocker": None,
        "lastRegistryEvent": f"Submitted on {now_str}",
        "deficiencies": [],
        "documents": [],
        "auditLog": [initial_audit]
    }

    # Store in memory
    db_manager.applications[app_id] = new_app
    db_manager.audit_events.insert(0, initial_audit)

    # Persist to Atlas
    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.applications.insert_one(new_app)
        await db_manager.db.audit_events.insert_one(initial_audit)

    return new_app

@router.post("/{app_id}/transition")
async def execute_transition(
    app_id: str,
    req: StateTransitionRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    app = await get_application(app_id, user)
    return await WorkflowEngine.execute_transition(
        application=app,
        target_stage=req.targetStage,
        reason=req.reason,
        actor=user,
        evidence_details=req.evidenceDetails
    )

@router.post("/{app_id}/observations", dependencies=[Depends(require_roles(["scrutiny_officer", "regional_officer", "aicte_admin", "super_admin"]))])
async def record_observation(
    app_id: str,
    req: ObservationRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    app = await get_application(app_id, user)
    now_str = time.strftime("%d %b %Y, %I:%M %p IST")
    officer_name = req.officerName or user.get("name")

    hasher = hashlib.sha256()
    hasher.update(f"{app_id}:{now_str}:{officer_name}:{req.observation}".encode())
    seal = hasher.hexdigest()[:16].upper()

    new_event = {
        "id": f"log-{int(time.time())}",
        "title": "Scrutiny Officer Observation Recorded",
        "timestamp": now_str,
        "description": req.observation,
        "actor": f"{officer_name} ({user.get('role', 'Scrutiny Officer')})",
        "type": "action",
        "sha256": seal,
        "applicationId": app_id
    }

    app.setdefault("auditLog", []).insert(0, new_event)
    db_manager.applications[app_id] = app
    db_manager.audit_events.insert(0, new_event)

    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.applications.update_one(
            {"id": app_id},
            {"$push": {"auditLog": {"$each": [new_event], "$position": 0}}}
        )
        await db_manager.db.audit_events.insert_one(new_event)

    return {"success": True, "event": new_event}

@router.post("/{app_id}/grace-notice", dependencies=[Depends(require_roles(["regional_officer", "aicte_admin", "super_admin"]))])
async def grant_grace_notice(
    app_id: str,
    req: GraceNoticeRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    app = await get_application(app_id, user)
    now_str = time.strftime("%d %b %Y, %I:%M %p IST")
    actor_name = user.get("name", "Regional Officer")

    hasher = hashlib.sha256()
    hasher.update(f"GRACE:{app_id}:{req.hours}:{now_str}:{actor_name}".encode())
    seal = hasher.hexdigest()[:16].upper()

    new_event = {
        "id": f"log-{int(time.time())}",
        "title": f"Statutory {req.hours}-Hour Cure Extension Granted",
        "timestamp": now_str,
        "description": f"Delegated regulatory prerogative invoked granting {req.hours} hours extension to clear Land Encumbrance seals without statutory penalty.",
        "actor": f"{actor_name} (Member Secretary / RO Auth)",
        "type": "decision",
        "sha256": seal,
        "applicationId": app_id
    }

    app.setdefault("auditLog", []).insert(0, new_event)
    if app.get("criticalBlocker"):
        app["criticalBlocker"]["question2_whyBlocked"] += f" [Grace notice active: {req.hours}h cure window granted]"

    db_manager.applications[app_id] = app
    db_manager.audit_events.insert(0, new_event)

    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.applications.update_one(
            {"id": app_id},
            {
                "$set": {"criticalBlocker": app.get("criticalBlocker")},
                "$push": {"auditLog": {"$each": [new_event], "$position": 0}}
            }
        )
        await db_manager.db.audit_events.insert_one(new_event)

    return {"success": True, "event": new_event}

@router.post("/{app_id}/deficiency-form-b", dependencies=[Depends(require_roles(["scrutiny_officer", "regional_officer", "aicte_admin", "super_admin"]))])
async def issue_deficiency_form_b(
    app_id: str,
    req: FormBRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    app = await get_application(app_id, user)
    # Perform transition to Stage 3 via WorkflowEngine
    return await WorkflowEngine.execute_transition(
        application=app,
        target_stage=3,
        reason=f"Form-B Formal Regulatory Deficiency Issued: {req.reason}. Mandatory 7-day cure window triggered.",
        actor=user,
        evidence_details=req.reason
    )

@router.post("/{app_id}/escalate-sac", dependencies=[Depends(require_roles(["regional_officer", "committee_member", "aicte_admin", "super_admin"]))])
async def escalate_to_sac(
    app_id: str,
    req: EscalateSacRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    app = await get_application(app_id, user)
    # Perform transition to Stage 5 (SAC) via WorkflowEngine
    return await WorkflowEngine.execute_transition(
        application=app,
        target_stage=5,
        reason=f"Escalated to Standing Appeals Committee: {req.reason}. Dossier transferred to National Appeals Registry.",
        actor=user,
        evidence_details=req.reason
    )

@router.post("/{app_id}/recommend-evc", dependencies=[Depends(require_roles(["scrutiny_officer", "regional_officer", "aicte_admin", "super_admin"]))])
async def recommend_evc(
    app_id: str,
    user: Dict[str, Any] = Depends(get_current_user)
):
    app = await get_application(app_id, user)
    # Advance to Stage 4 (EVC) via WorkflowEngine
    return await WorkflowEngine.execute_transition(
        application=app,
        target_stage=4,
        reason="Scrutiny requirements fulfilled. Inspection team dispatch unlocked.",
        actor=user
    )

@router.post("/{app_id}/rectifications", dependencies=[Depends(require_roles(["institution_rep", "aicte_admin", "super_admin"]))])
async def submit_rectification(
    app_id: str,
    req: RectificationSubmissionRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    app = await get_application(app_id, user)
    now_str = time.strftime("%d %b %Y, %I:%M %p IST")
    
    # Locate deficiency
    def_found = False
    for d in app.get("deficiencies", []):
        if d.get("refCode") == req.deficiencyRefCode:
            d["status"] = "rectified_pending_review"
            d["rectificationNote"] = req.rectificationDetails
            def_found = True
            break

    # If critical blocker exists and matches, mark as rectified
    if app.get("criticalBlocker") and req.deficiencyRefCode in ["APH-2026-CH2-S2.4", "DEF-01"]:
        app["criticalBlocker"]["resolved"] = True

    audit_entry = {
        "id": f"log-{int(time.time())}",
        "title": f"Deficiency Rectification Submitted: {req.deficiencyRefCode}",
        "timestamp": now_str,
        "description": f"Institution submitted compliance response: {req.rectificationDetails}",
        "actor": f"{user.get('name')} ({user.get('role')})",
        "type": "rectification",
        "applicationId": app_id
    }
    app.setdefault("auditLog", []).insert(0, audit_entry)

    db_manager.applications[app_id] = app
    db_manager.audit_events.insert(0, audit_entry)

    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.applications.update_one(
            {"id": app_id},
            {
                "$set": {
                    "deficiencies": app.get("deficiencies", []),
                    "criticalBlocker": app.get("criticalBlocker")
                },
                "$push": {"auditLog": {"$each": [audit_entry], "$position": 0}}
            }
        )
        await db_manager.db.audit_events.insert_one(audit_entry)

    return {"success": True, "message": "Rectification submission recorded for re-scrutiny.", "event": audit_entry}
