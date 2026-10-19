from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/workflow", tags=["Workflow & Intelligence"])

class SimulateScenarioRequest(BaseModel):
    applicationId: str
    action: str  # 'grace_notice' | 'accept_rectification' | 'escalate_sac'
    parameterValue: Optional[int] = None

@router.get("/metrics")
async def get_metrics():
    return {
        "inProcessApps": 1428,
        "scrutinyCeilingDays": 15,
        "regionalOfficesCount": 6,
        "overdueCasesCount": 4,
        "pendingEvcCount": 64,
        "sacAppealsCount": 18,
        "complianceRatioPercent": 94.2,
        "averageProcessingDays": 11.4
    }

@router.post("/simulate")
async def simulate_scenario(req: SimulateScenarioRequest):
    if req.action == "grace_notice":
        return {
            "predictedSlaBreach": False,
            "newCureDeadline": "48 Hours Extended",
            "downstreamImpact": "EVC panel constitution deferred 48h without triggering statutory penalty.",
            "statutoryRiskIndex": "Low (Delegated Power Invoked)"
        }
    elif req.action == "accept_rectification":
        return {
            "predictedSlaBreach": False,
            "downstreamImpact": "Stage 04 EVC unlocked immediately. Panel dispatch within 72h.",
            "statutoryRiskIndex": "Zero"
        }
    elif req.action == "escalate_sac":
        return {
            "predictedSlaBreach": True,
            "downstreamImpact": "Transferred to Standing Appeals Committee, New Delhi. Academic calendar cutoff delay +14d.",
            "statutoryRiskIndex": "High"
        }
    return {
        "predictedSlaBreach": True,
        "downstreamImpact": "Current trajectory will freeze Stage 04 EVC.",
        "statutoryRiskIndex": "Critical"
    }
