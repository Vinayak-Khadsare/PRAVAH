import time
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from backend.database import db_manager
from backend.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/compliance", tags=["Compliance"])

class EvidenceSubmissionRequest(BaseModel):
    documentEvidenceId: str
    remarks: Optional[str] = None

class ReviewComplianceRequest(BaseModel):
    status: str  # 'Verified Compliant' | 'Deficient' | 'Rectification Requested'
    remarks: str

@router.get("")
async def get_compliance_records(user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve compliance obligations with role-based scoping."""
    inst_pid = user.get("institutionPid") if user.get("role") == "institution_rep" else None

    if db_manager.is_atlas_connected and db_manager.db is not None:
        query = {"pid": inst_pid} if inst_pid else {}
        cursor = db_manager.db.compliance.find(query, {"_id": 0})
        records = await cursor.to_list(length=100)
        if records:
            return records

    records = list(db_manager.compliance.values())
    if inst_pid:
        records = [c for c in records if c.get("pid") == inst_pid]
    return records

@router.post("/{compliance_id}/evidence", dependencies=[Depends(require_roles(["institution_rep", "aicte_admin", "super_admin"]))])
async def submit_evidence(
    compliance_id: str,
    req: EvidenceSubmissionRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Submit document evidence for a compliance requirement."""
    item = db_manager.compliance.get(compliance_id)
    if not item and db_manager.is_atlas_connected and db_manager.db is not None:
        item = await db_manager.db.compliance.find_one({"id": compliance_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Compliance item '{compliance_id}' not found.")

    # Enforce institutional isolation
    verify_institution_scope(item.get("pid"), user)

    now_str = time.strftime("%d %b %Y, %I:%M %p IST")
    item["evidenceSubmitted"] = True
    item["evidenceDocumentId"] = req.documentEvidenceId
    item["status"] = "Under Review"
    item["lastUpdated"] = now_str

    db_manager.compliance[compliance_id] = item
    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.compliance.update_one(
            {"id": compliance_id},
            {"$set": item}
        )

    return {"success": True, "complianceId": compliance_id, "message": "Evidence submitted and marked for official review."}

@router.post("/{compliance_id}/review", dependencies=[Depends(require_roles(["scrutiny_officer", "regional_officer", "aicte_admin", "super_admin"]))])
async def review_compliance_item(
    compliance_id: str,
    req: ReviewComplianceRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Review and determine status of compliance requirement."""
    item = db_manager.compliance.get(compliance_id)
    if not item and db_manager.is_atlas_connected and db_manager.db is not None:
        item = await db_manager.db.compliance.find_one({"id": compliance_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Compliance item '{compliance_id}' not found.")

    now_str = time.strftime("%d %b %Y, %I:%M %p IST")
    item["status"] = req.status
    item["reviewerRemarks"] = req.remarks
    item["reviewedBy"] = user.get("name")
    item["reviewedAt"] = now_str
    item["lastUpdated"] = now_str

    db_manager.compliance[compliance_id] = item
    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.compliance.update_one(
            {"id": compliance_id},
            {"$set": item}
        )

    return {"success": True, "complianceId": compliance_id, "status": req.status, "message": f"Compliance item evaluated as {req.status}."}
