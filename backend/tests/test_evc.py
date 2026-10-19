import pytest
from backend.database import db_manager
from backend.services.evc_service import EvcService

@pytest.mark.asyncio
async def test_evc_scheduling_eligibility_block():
    """EVC cannot be scheduled if application has active critical blocker."""
    # APP-2026-00124 has active land encumbrance critical blocker
    actor = {"name": "Regional Officer", "role": "regional_officer"}

    with pytest.raises(Exception) as exc_info:
        await EvcService.schedule_visit(
            application_id="APP-2026-00124",
            visit_date="2026-03-25",
            panel_convener="Prof. A. K. Sharma",
            panel_members=["Dr. M. K. Rao", "Er. S. Sen"],
            actor=actor
        )
    assert "EVC Scheduling Ineligible" in str(exc_info.value.detail)

@pytest.mark.asyncio
async def test_evc_panel_conflict_detection():
    """Conflict detection prevents double-booking a panelist on the same date."""
    # Seed an existing schedule
    db_manager.evc["EVC-EXISTING-01"] = {
        "id": "EVC-EXISTING-01",
        "applicationId": "APP-2026-00842",
        "institutionName": "K. J. Somaiya Institute",
        "visitDate": "2026-03-28",
        "panelConvener": "Prof. S. Sen",
        "panelMembers": ["Dr. Anita Roy"],
        "status": "Scheduled"
    }

    # Ensure clean app without blocker
    db_manager.applications["APP-CLEAN-01"] = {
        "id": "APP-CLEAN-01",
        "institutionName": "Clean Test Institute",
        "city": "Lucknow",
        "state": "Uttar Pradesh",
        "regionalOffice": "Northern Regional Office",
        "deficiencies": [],
        "criticalBlocker": None
    }

    actor = {"name": "RO Official", "role": "regional_officer"}

    # Attempt to schedule with Prof. S. Sen on 2026-03-28 should fail with 409
    with pytest.raises(Exception) as exc_info:
        await EvcService.schedule_visit(
            application_id="APP-CLEAN-01",
            visit_date="2026-03-28",
            panel_convener="Prof. S. Sen",
            panel_members=["Dr. Other Member"],
            actor=actor
        )
    assert "Panel Conflict Detected" in str(exc_info.value.detail)

@pytest.mark.asyncio
async def test_evc_dispatch_biometric_token():
    db_manager.evc["EVC-DISPATCH-TEST"] = {
        "id": "EVC-DISPATCH-TEST",
        "applicationId": "APP-CLEAN-01",
        "panelConvener": "Prof. S. Sen",
        "status": "Scheduled",
        "securityToken": "EVC-SEC-998877",
        "dispatched": False
    }

    actor = {"name": "RO Official", "role": "regional_officer"}
    res = await EvcService.dispatch_biometric_token("EVC-DISPATCH-TEST", actor)
    assert res["success"] is True
    assert res["evcId"] == "EVC-DISPATCH-TEST"
    assert db_manager.evc["EVC-DISPATCH-TEST"]["dispatched"] is True
    assert db_manager.evc["EVC-DISPATCH-TEST"]["status"] == "Dispatched"

@pytest.mark.asyncio
async def test_evc_submit_report():
    actor = {"name": "Prof. S. Sen", "role": "evc_member"}
    res = await EvcService.submit_visit_report(
        evc_id="EVC-DISPATCH-TEST",
        findings_summary="Campus physical infrastructure matches AICTE APH Chapter II standards.",
        recommended_for_approval=True,
        actor=actor
    )
    assert res["success"] is True
    assert db_manager.evc["EVC-DISPATCH-TEST"]["status"] == "Completed"
    assert db_manager.evc["EVC-DISPATCH-TEST"]["reportSubmitted"] is True
