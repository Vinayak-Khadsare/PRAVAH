from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from backend.dependencies import get_current_user, require_roles
from backend.services.evc_service import EvcService

router = APIRouter(prefix="/evc", tags=["EVC Inspection"])

class ScheduleEvcRequest(BaseModel):
    applicationId: str
    visitDate: str
    panelConvener: str
    panelMembers: List[str]

class RescheduleEvcRequest(BaseModel):
    newDate: str
    reason: str

class CancelEvcRequest(BaseModel):
    reason: str

class SubmitEvcReportRequest(BaseModel):
    findingsSummary: str
    recommendedForApproval: bool

@router.get("")
async def get_evc_schedules(user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve all EVC schedules."""
    return await EvcService.get_all_schedules()

@router.post("/schedule", dependencies=[Depends(require_roles(["regional_officer", "aicte_admin", "super_admin"]))])
async def schedule_evc(req: ScheduleEvcRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """Schedule an EVC inspection visit with eligibility and panel conflict checks."""
    return await EvcService.schedule_visit(
        application_id=req.applicationId,
        visit_date=req.visitDate,
        panel_convener=req.panelConvener,
        panel_members=req.panelMembers,
        actor=user
    )

@router.post("/{evc_id}/dispatch", dependencies=[Depends(require_roles(["regional_officer", "aicte_admin", "super_admin"]))])
async def dispatch_biometric_token(evc_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Dispatch biometric security token to panellists."""
    return await EvcService.dispatch_biometric_token(evc_id=evc_id, actor=user)

@router.post("/{evc_id}/reschedule", dependencies=[Depends(require_roles(["regional_officer", "aicte_admin", "super_admin"]))])
async def reschedule_evc(evc_id: str, req: RescheduleEvcRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """Reschedule an existing EVC inspection."""
    return await EvcService.reschedule_visit(
        evc_id=evc_id,
        new_date=req.newDate,
        reason=req.reason,
        actor=user
    )

@router.post("/{evc_id}/cancel", dependencies=[Depends(require_roles(["regional_officer", "aicte_admin", "super_admin"]))])
async def cancel_evc(evc_id: str, req: CancelEvcRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """Cancel an EVC inspection."""
    return await EvcService.cancel_visit(
        evc_id=evc_id,
        reason=req.reason,
        actor=user
    )

@router.post("/{evc_id}/report", dependencies=[Depends(require_roles(["evc_member", "regional_officer", "aicte_admin", "super_admin"]))])
async def submit_evc_report(evc_id: str, req: SubmitEvcReportRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """Submit EVC findings report."""
    return await EvcService.submit_visit_report(
        evc_id=evc_id,
        findings_summary=req.findingsSummary,
        recommended_for_approval=req.recommendedForApproval,
        actor=user
    )
