import pytest
from backend.database import db_manager
from backend.services.workflow_engine import WorkflowEngine

@pytest.mark.asyncio
async def test_illegal_stage_jump_rejected():
    """State machine prevents illegal jumps, e.g. from Stage 1 directly to Stage 6."""
    mock_app = {
        "id": "APP-TEST-001",
        "currentStageNumber": 1,
        "status": "intake_submitted",
        "deficiencies": []
    }
    actor = {"name": "Admin", "role": "super_admin"}

    with pytest.raises(Exception) as exc_info:
        await WorkflowEngine.execute_transition(
            application=mock_app,
            target_stage=6,
            reason="Illegal jump test",
            actor=actor
        )
    assert "Illegal statutory transition" in str(exc_info.value.detail)

@pytest.mark.asyncio
async def test_unauthorized_role_rejected():
    """Institution representatives cannot execute official statutory transitions."""
    mock_app = {
        "id": "APP-TEST-002",
        "currentStageNumber": 2,
        "status": "in_scrutiny",
        "deficiencies": []
    }
    unauthorized_actor = {"name": "Applicant", "role": "institution_rep"}

    with pytest.raises(Exception) as exc_info:
        await WorkflowEngine.execute_transition(
            application=mock_app,
            target_stage=3,
            reason="Attempted transition by applicant",
            actor=unauthorized_actor
        )
    assert "Unauthorized" in str(exc_info.value.detail)

@pytest.mark.asyncio
async def test_prerequisite_blocking_evc():
    """Transition to Stage 4 (EVC) is blocked if critical deficiencies or blockers are unresolved."""
    mock_app = {
        "id": "APP-TEST-003",
        "currentStageNumber": 2,
        "status": "in_scrutiny",
        "criticalBlocker": {"title": "Missing Land Encumbrance Certificate"},
        "deficiencies": [
            {"title": "Land Deed deficient", "refCode": "APH-2.4", "isCritical": True, "status": "deficient"}
        ]
    }
    actor = {"name": "Dr. P. K. Verma", "role": "scrutiny_officer"}

    with pytest.raises(Exception) as exc_info:
        await WorkflowEngine.execute_transition(
            application=mock_app,
            target_stage=4,
            reason="Recommend EVC with active blocker",
            actor=actor
        )
    assert "Prerequisite Blocked" in str(exc_info.value.detail)

@pytest.mark.asyncio
async def test_valid_transition_and_audit_sealing():
    """Valid transition succeeds, updates status, and appends SHA-256 sealed audit entry."""
    mock_app = {
        "id": "APP-TEST-004",
        "currentStageNumber": 2,
        "status": "in_scrutiny",
        "deficiencies": [],
        "criticalBlocker": None,
        "auditLog": []
    }
    actor = {"name": "Dr. P. K. Verma", "role": "scrutiny_officer"}

    result = await WorkflowEngine.execute_transition(
        application=mock_app,
        target_stage=3,
        reason="Form-B Deficiency Notice served for Land Clause clarification",
        actor=actor
    )

    assert result["success"] is True
    assert result["previousStage"] == 2
    assert result["newStage"] == 3
    assert result["newStatus"] == "re_scrutiny"
    assert "auditEvent" in result
    assert "sha256" in result["auditEvent"]
    assert len(result["auditEvent"]["sha256"]) == 16
