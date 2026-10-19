from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from backend.dependencies import get_current_user, require_roles
from backend.services.policy_service import PolicyService

router = APIRouter(prefix="/policies", tags=["Regulatory Policies & APH"])

class PolicyCreateRequest(BaseModel):
    versionId: str
    title: str
    effectiveDate: str
    scrutinyCeilingDays: int = 15
    graceNoticeMaxHours: int = 48
    formBCureWindowDays: int = 7
    changeSummary: str

class PolicyImpactRequest(BaseModel):
    newScrutinyCeilingDays: int
    newCureWindowDays: int = 7

@router.get("")
async def get_policies(user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve all APH versions."""
    return await PolicyService.get_all_policies()

@router.get("/active")
async def get_active_policy(user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve current active regulatory handbook."""
    return await PolicyService.get_active_policy()

@router.post("", dependencies=[Depends(require_roles(["super_admin", "aicte_admin"]))])
async def create_policy(req: PolicyCreateRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """Configure or publish a new APH handbook version."""
    return await PolicyService.create_or_update_policy(
        version_id=req.versionId,
        title=req.title,
        effective_date=req.effectiveDate,
        scrutiny_ceiling_days=req.scrutinyCeilingDays,
        grace_notice_max_hours=req.graceNoticeMaxHours,
        form_b_cure_window_days=req.formBCureWindowDays,
        change_summary=req.changeSummary,
        actor=user
    )

@router.post("/impact-analysis", dependencies=[Depends(require_roles(["super_admin", "aicte_admin", "regional_officer"]))])
async def analyze_impact(req: PolicyImpactRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """Analyze impact of regulatory rule alterations on live cases."""
    return await PolicyService.analyze_policy_impact(
        new_scrutiny_ceiling_days=req.newScrutinyCeilingDays,
        new_cure_window_days=req.newCureWindowDays
    )
