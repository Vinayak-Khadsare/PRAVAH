import pytest
import os
import sys
from fastapi.testclient import TestClient

# Ensure root directory is on PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.main import app
from backend.database import db_manager
from backend.security import create_access_token

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Ensure in-memory test database is cleanly initialized."""
    db_manager._init_memory_store()

@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def ro_token():
    """Token for Regional Officer (Dr. R. K. Srivastava)."""
    return create_access_token({
        "sub": "r.srivastava@aicte-india.org",
        "userId": "usr-ro-01",
        "role": "regional_officer",
        "regionalOffice": "Northern Regional Office (NRO) - Kanpur",
        "institutionPid": None
    })

@pytest.fixture
def so_token():
    """Token for Scrutiny Officer (Dr. P. K. Verma)."""
    return create_access_token({
        "sub": "p.verma@aicte-india.org",
        "userId": "usr-so-01",
        "role": "scrutiny_officer",
        "regionalOffice": "Northern Regional Office (NRO) - Kanpur",
        "institutionPid": None
    })

@pytest.fixture
def inst_token():
    """Token for Institution Representative (Dr. Arvind Sharma, PID: 1-4392811)."""
    return create_access_token({
        "sub": "admin@dronacharya-engg.ac.in",
        "userId": "usr-inst-01",
        "role": "institution_rep",
        "regionalOffice": "Northern Regional Office (NRO) - Kanpur",
        "institutionPid": "1-4392811"
    })

@pytest.fixture
def evc_token():
    """Token for EVC Panelist (Prof. S. Sen)."""
    return create_access_token({
        "sub": "s.sen@iitr.ac.in",
        "userId": "usr-evc-01",
        "role": "evc_member",
        "regionalOffice": "Northern Regional Office (NRO) - Kanpur",
        "institutionPid": None
    })

@pytest.fixture
def admin_token():
    """Token for Central AICTE Administrator."""
    return create_access_token({
        "sub": "admin@aicte-india.org",
        "userId": "usr-admin-01",
        "role": "aicte_admin",
        "regionalOffice": "Central Bureau / Member Secretary Desk",
        "institutionPid": None
    })

@pytest.fixture
def auditor_token():
    """Token for Regulatory Auditor."""
    return create_access_token({
        "sub": "auditor@aicte-india.org",
        "userId": "usr-auditor-01",
        "role": "auditor",
        "regionalOffice": "Central Bureau / Member Secretary Desk",
        "institutionPid": None
    })
