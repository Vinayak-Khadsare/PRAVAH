import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.config import settings

client = TestClient(app)

def test_liveness_endpoints():
    """Verify /api/live and /live return alive status."""
    res1 = client.get("/api/live")
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["status"] == "alive"
    assert "service" in data1

    res2 = client.get("/live")
    assert res2.status_code == 200
    assert res2.json()["status"] == "alive"

def test_readiness_endpoints():
    """Verify /api/ready and /ready return readiness status."""
    res1 = client.get("/api/ready")
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["status"] == "ready"
    assert "database" in data1
    assert "storage" in data1
    assert data1["storage"]["writable"] is True

    res2 = client.get("/ready")
    assert res2.status_code == 200
    assert res2.json()["status"] == "ready"

def test_health_check_endpoints():
    """Verify /api/health and /health return operational status."""
    res1 = client.get("/api/health")
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["status"] == "operational"
    assert "regulatoryStandard" in data1
    assert "database" in data1
    assert "isDemonstration" in data1["database"]

    res2 = client.get("/health")
    assert res2.status_code == 200
    assert res2.json()["status"] == "operational"
