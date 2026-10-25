import pytest
import os
import sys
from fastapi.testclient import TestClient

# Ensure root directory is on PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

os.environ["MONGODB_URI"] = ""
from backend.config import settings
settings.MONGODB_URI = ""

from backend.main import app
from backend.database import db_manager
from backend.security import create_access_token

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Ensure in-memory test database is cleanly initialized."""
    settings.MONGODB_URI = ""
    db_manager.is_atlas_connected = False
    db_manager.client = None
    db_manager.db = None
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

@pytest.fixture
def committee_token():
    """Token for Committee Member."""
    return create_access_token({
        "sub": "committee@aicte-india.org",
        "userId": "usr-comm-01",
        "role": "committee_member",
        "regionalOffice": "Standing Appeals Committee (SAC) - New Delhi",
        "institutionPid": None
    })

@pytest.fixture
def super_admin_token():
    """Token for Super Admin."""
    return create_access_token({
        "sub": "superadmin@aicte-india.org",
        "userId": "usr-super-01",
        "role": "super_admin",
        "regionalOffice": "Central Bureau / Member Secretary Desk",
        "institutionPid": None
    })

@pytest.fixture
def qa_user_credentials():
    """Credentials for the dedicated, persistent QA test account."""
    return {
        "email": settings.QA_TEST_EMAIL,
        "password": settings.QA_TEST_PASSWORD
    }

@pytest.fixture
def qa_token():
    """Valid signed JWT token for the QA test account."""
    return create_access_token({
        "sub": settings.QA_TEST_EMAIL,
        "userId": "usr-qa-test-01",
        "role": settings.QA_TEST_ROLE,
        "regionalOffice": settings.QA_TEST_REGIONAL_OFFICE,
        "institutionPid": settings.QA_TEST_PID
    })

@pytest.fixture
def qa_headers(qa_token):
    """Authorization header dictionary for QA test account."""
    return {"Authorization": f"Bearer {qa_token}"}
