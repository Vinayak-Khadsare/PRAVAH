import pytest
from backend.database import db_manager
from backend.services.deadline_service import DeadlineMonitorService

@pytest.mark.asyncio
async def test_deadline_monitoring_evaluation():
    # Setup test app with daysExpended exceeding ceiling
    db_manager.applications["APP-ALERT-OVERDUE"] = {
        "id": "APP-ALERT-OVERDUE",
        "institutionName": "Overdue College of Tech",
        "daysExpended": 18,
        "statutoryCeiling": 15,
        "status": "in_scrutiny",
        "criticalBlocker": None
    }

    # Setup test app with due-soon
    db_manager.applications["APP-ALERT-DUESOON"] = {
        "id": "APP-ALERT-DUESOON",
        "institutionName": "Due Soon Academy",
        "daysExpended": 14,
        "statutoryCeiling": 15,
        "status": "in_scrutiny",
        "criticalBlocker": None
    }

    # Run evaluation
    result = await DeadlineMonitorService.evaluate_application_deadlines()
    assert result["status"] == "completed"
    assert result["evaluatedApplicationsCount"] >= 2

    # Verify overdue alert created
    assert "ALT-OVERDUE-APP-ALERT-OVERDUE" in db_manager.alerts
    overdue_alert = db_manager.alerts["ALT-OVERDUE-APP-ALERT-OVERDUE"]
    assert overdue_alert["priority"] == "critical"
    assert "Statutory 15-Day Ceiling Exceeded" in overdue_alert["title"]

    # Verify due-soon alert created
    assert "ALT-DUESOON-APP-ALERT-DUESOON" in db_manager.alerts
    duesoon_alert = db_manager.alerts["ALT-DUESOON-APP-ALERT-DUESOON"]
    assert duesoon_alert["priority"] == "warning"

@pytest.mark.asyncio
async def test_alert_idempotent_deduplication():
    """Running deadline evaluation repeatedly must not generate duplicate alerts."""
    initial_count = len(db_manager.alerts)
    second_pass = await DeadlineMonitorService.evaluate_application_deadlines()
    # No new duplicate alerts created
    assert second_pass["newAlertsCreatedCount"] == 0
    assert len(db_manager.alerts) == initial_count

@pytest.mark.asyncio
async def test_alert_acknowledgement_and_resolution():
    actor = {"name": "Dr. R. K. Srivastava", "role": "regional_officer"}
    alert_id = "ALT-OVERDUE-APP-ALERT-OVERDUE"

    ack_res = await DeadlineMonitorService.acknowledge_alert(alert_id, actor)
    assert ack_res["success"] is True
    assert db_manager.alerts[alert_id]["acknowledged"] is True

    res_res = await DeadlineMonitorService.resolve_alert(alert_id, "Rectification received and scrutiny completed.", actor)
    assert res_res["success"] is True
    assert db_manager.alerts[alert_id]["resolved"] is True
    assert db_manager.alerts[alert_id]["resolutionNote"] == "Rectification received and scrutiny completed."
