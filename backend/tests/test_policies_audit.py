import pytest
from backend.services.policy_service import PolicyService
from backend.database import db_manager

@pytest.mark.asyncio
async def test_get_active_policy():
    policy = await PolicyService.get_active_policy()
    assert policy is not None
    assert "versionId" in policy
    assert policy.get("scrutinyCeilingDays") == 15

@pytest.mark.asyncio
async def test_policy_impact_analysis():
    # Setup test app with 12 days expended
    db_manager.applications["APP-POLICY-TEST"] = {
        "id": "APP-POLICY-TEST",
        "institutionName": "Polytechnic Institute",
        "daysExpended": 12,
        "statutoryCeiling": 15,
        "status": "in_scrutiny"
    }

    # If new policy proposes reducing ceiling to 10 days, this app should be flagged as immediate breach
    impact = await PolicyService.analyze_policy_impact(
        new_scrutiny_ceiling_days=10,
        new_cure_window_days=5
    )
    assert impact["proposedScrutinyCeilingDays"] == 10
    assert impact["impactedApplicationsCount"] >= 1
    flagged_ids = [a["applicationId"] for a in impact["affectedApplications"]]
    assert "APP-POLICY-TEST" in flagged_ids

def test_audit_chain_verification_endpoint(client, auditor_token):
    res = client.get("/api/audit/verify-chain/APP-2026-00124", headers={"Authorization": f"Bearer {auditor_token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["chainIntact"] is True
    assert data["tamperDetected"] is False
    assert "verificationMethod" in data
