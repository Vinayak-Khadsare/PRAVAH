from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from backend.dependencies import get_current_user, require_roles
from backend.services.deadline_service import DeadlineMonitorService

router = APIRouter(prefix="/alerts", tags=["Alerts & Escalations"])

class ResolveAlertRequest(BaseModel):
    resolutionNote: str

@router.get("")
async def get_alerts(user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve all operational alerts."""
    return await DeadlineMonitorService.get_all_alerts(actor=user)

@router.get("/health")
async def get_monitor_health(user: Dict[str, Any] = Depends(get_current_user)):
    """Check deadline monitor operational health."""
    return DeadlineMonitorService.get_health()

@router.post("/evaluate", dependencies=[Depends(require_roles(["regional_officer", "aicte_admin", "super_admin"]))])
async def trigger_deadline_evaluation(user: Dict[str, Any] = Depends(get_current_user)):
    """Manually invoke idempotent deadline evaluation check."""
    return await DeadlineMonitorService.evaluate_application_deadlines()

@router.post("/{alert_id}/acknowledge", dependencies=[Depends(require_roles(["regional_officer", "scrutiny_officer", "aicte_admin", "super_admin"]))])
async def acknowledge_alert(alert_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Acknowledge an alert."""
    return await DeadlineMonitorService.acknowledge_alert(alert_id=alert_id, actor=user)

@router.post("/{alert_id}/resolve", dependencies=[Depends(require_roles(["regional_officer", "scrutiny_officer", "aicte_admin", "super_admin"]))])
async def resolve_alert(alert_id: str, req: ResolveAlertRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """Resolve an alert with documentation."""
    return await DeadlineMonitorService.resolve_alert(alert_id=alert_id, resolution_note=req.resolutionNote, actor=user)
