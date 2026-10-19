import pytest

def test_get_applications_list(client, ro_token):
    res = client.get("/api/applications", headers={"Authorization": f"Bearer {ro_token}"})
    assert res.status_code == 200
    apps = res.json()
    assert isinstance(apps, list)
    assert len(apps) >= 1

def test_get_application_by_id(client, ro_token):
    res = client.get("/api/applications/APP-2026-00124", headers={"Authorization": f"Bearer {ro_token}"})
    assert res.status_code == 200
    app = res.json()
    assert app["id"] == "APP-2026-00124"
    assert "Dronacharya" in app["institutionName"]

def test_missing_application_returns_404(client, ro_token):
    """Verify that genuinely missing application IDs return 404 and NOT the default case."""
    res = client.get("/api/applications/NON-EXISTENT-APP-99999", headers={"Authorization": f"Bearer {ro_token}"})
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()

def test_institution_scoping(client, inst_token):
    """Institution representatives cannot access applications of other institutions."""
    from backend.database import db_manager
    db_manager.applications["APP-OTHER-PID"] = {
        "id": "APP-OTHER-PID",
        "pid": "1-9999999",
        "institutionName": "Other College",
        "status": "in_scrutiny",
        "regionalOffice": "Northern Regional Office",
        "auditLog": []
    }
    # Dr. Arvind Sharma belongs to PID: 1-4392811 (APP-2026-00124)
    res = client.get("/api/applications/APP-2026-00124", headers={"Authorization": f"Bearer {inst_token}"})
    assert res.status_code == 200

    # Attempting to access an application with a different PID should be forbidden
    res = client.get("/api/applications/APP-OTHER-PID", headers={"Authorization": f"Bearer {inst_token}"})
    assert res.status_code == 403
    assert "Access restricted" in res.json()["detail"]

def test_record_scrutiny_observation(client, so_token):
    res = client.post(
        "/api/applications/APP-2026-00124/observations",
        headers={"Authorization": f"Bearer {so_token}"},
        json={"observation": "Land title verification indicates deed clause 4(b) registered."}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "log-" in data["event"]["id"]
    assert "sha256" in data["event"]

def test_grant_grace_notice_delegated(client, ro_token):
    res = client.post(
        "/api/applications/APP-2026-00124/grace-notice",
        headers={"Authorization": f"Bearer {ro_token}"},
        json={"hours": 48}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "Statutory 48-Hour Cure Extension Granted" in data["event"]["title"]
    assert "sha256" in data["event"]

def test_submit_rectification(client, inst_token):
    res = client.post(
        "/api/applications/APP-2026-00124/rectifications",
        headers={"Authorization": f"Bearer {inst_token}"},
        json={
            "deficiencyRefCode": "APH-2026-CH2-S2.4",
            "rectificationDetails": "Tehsildar Certified Supplementary Land Lease Agreement attached."
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "Rectification submission recorded" in data["message"]
