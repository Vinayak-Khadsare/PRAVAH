import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.config import settings
from backend.database import db_manager
from backend.init_qa_user import initialize_qa_account, QA_USER_ID

client = TestClient(app)

@pytest.mark.asyncio
async def test_01_init_qa_account_on_empty_db():
    """1. Initializing QA account succeeds and provisions correct identity."""
    # Ensure in-memory store is initialized and clean of QA user
    db_manager._init_memory_store()
    qa_email = settings.QA_TEST_EMAIL
    if qa_email in db_manager.users:
        del db_manager.users[qa_email]

    res = await initialize_qa_account(force=True)
    assert res["status"] == "created"
    assert res["userId"] == QA_USER_ID
    assert res["email"] == qa_email
    assert res["role"] == "institution_rep"
    assert res["institutionPid"] == settings.QA_TEST_PID
    assert qa_email in db_manager.users
    assert db_manager.users[qa_email]["verificationStatus"] == "verified"

@pytest.mark.asyncio
async def test_02_idempotent_reinitialization_reuses_identity():
    """2. Running initialization twice does not duplicate and reuses existing record."""
    res1 = await initialize_qa_account(force=True)
    assert res1["status"] in ("created", "reused")

    res2 = await initialize_qa_account(force=True)
    assert res2["status"] == "reused"
    assert res2["userId"] == QA_USER_ID
    assert res2["email"] == settings.QA_TEST_EMAIL

@pytest.mark.asyncio
async def test_03_login_endpoint_accepts_qa_credentials():
    """3. Standard /api/auth/login endpoint authenticates QA credentials with real bcrypt verification."""
    await initialize_qa_account(force=True)

    login_res = client.post("/api/auth/login", json={
        "email": settings.QA_TEST_EMAIL,
        "password": settings.QA_TEST_PASSWORD
    })
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == settings.QA_TEST_EMAIL
    assert data["user"]["role"] == "institution_rep"
    assert data["user"]["userId"] == QA_USER_ID
    assert "passwordHash" not in data["user"]

def test_04_wrong_password_rejected():
    """3b. Invalid password for QA account is rejected by standard auth mechanism."""
    bad_login = client.post("/api/auth/login", json={
        "email": settings.QA_TEST_EMAIL,
        "password": "WrongPassword@999"
    })
    assert bad_login.status_code == 401
    assert "Invalid credentials" in bad_login.json()["detail"]

@pytest.mark.asyncio
async def test_05_auth_token_profile_and_permissions(qa_headers):
    """4. Resulting authentication token returns valid /auth/me profile with institution_rep scope."""
    await initialize_qa_account(force=True)

    me_res = client.get("/api/auth/me", headers=qa_headers)
    assert me_res.status_code == 200
    profile = me_res.json()
    assert profile["email"] == settings.QA_TEST_EMAIL
    assert profile["role"] == "institution_rep"
    assert profile["institutionPid"] == settings.QA_TEST_PID
    assert profile["verificationStatus"] == "verified"

def test_06_protected_routes_enforce_authentication():
    """5. Protected routes strictly require Bearer token (no anonymous access or bypass)."""
    res = client.get("/api/auth/me")
    assert res.status_code == 401
    assert "Authentication credentials required" in res.json()["detail"]

    # Applications list without auth is permitted for overview or requires auth for scoped
    doc_res = client.get("/api/documents")
    assert doc_res.status_code == 401

@pytest.mark.asyncio
async def test_07_unauthorized_admin_operations_blocked_for_qa_user(qa_headers):
    """6. QA user has institution_rep role and cannot execute restricted officer actions."""
    await initialize_qa_account(force=True)

    # 1. QA user cannot grant grace notice (restricted to regional_officer / super_admin)
    grace_res = client.post(
        "/api/applications/APP-2026-00124/grace-notice",
        headers=qa_headers,
        json={"hours": 48, "reason": "Unauthorized attempt"}
    )
    assert grace_res.status_code == 403

    # 2. QA user cannot issue deficiency form B (restricted to scrutiny_officer / regional_officer)
    form_b_res = client.post(
        "/api/applications/APP-2026-00124/deficiency-form-b",
        headers=qa_headers,
        json={"reason": "Unauthorized attempt"}
    )
    assert form_b_res.status_code == 403

    # 3. QA user cannot dispatch EVC inspections
    evc_res = client.post("/api/evc/evc-1/dispatch", headers=qa_headers)
    assert evc_res.status_code == 403

@pytest.mark.asyncio
async def test_08_qa_user_authorized_institution_operations(qa_headers):
    """7. QA user can perform legitimate institution_rep actions (view own application, view profile)."""
    await initialize_qa_account(force=True)

    # Read application associated with user's PID
    app_res = client.get(f"/api/applications/APP-2026-00124", headers=qa_headers)
    assert app_res.status_code == 200
    assert app_res.json()["pid"] == "1-4392811"

@pytest.mark.asyncio
async def test_09_test_fixtures_disabled_by_default():
    """8. Without PRAVAH_ENABLE_TEST_FIXTURES=true or force=True, initialisation fails safely."""
    settings.ENABLE_TEST_FIXTURES = False
    with pytest.raises(RuntimeError) as exc_info:
        await initialize_qa_account(force=False)
    assert "PRAVAH_ENABLE_TEST_FIXTURES must be enabled" in str(exc_info.value)

@pytest.mark.asyncio
async def test_10_production_environment_strictly_refuses_qa_fixtures():
    """9. In production environment (ENVIRONMENT=production), initialisation is completely refused."""
    old_env = settings.ENVIRONMENT
    try:
        settings.ENVIRONMENT = "production"
        with pytest.raises(PermissionError) as exc_info:
            await initialize_qa_account(force=True)
        assert "strictly forbidden in production" in str(exc_info.value)
    finally:
        settings.ENVIRONMENT = old_env

@pytest.mark.asyncio
async def test_11_production_named_database_refused():
    """10. Even in dev, if target DB name contains 'prod' or 'production', initialisation fails closed."""
    old_db = settings.DATABASE_NAME
    try:
        settings.DATABASE_NAME = "pravah_production_main_cluster"
        with pytest.raises(PermissionError) as exc_info:
            await initialize_qa_account(force=True)
        assert "Cannot initialize test fixtures against a production-named database" in str(exc_info.value)
    finally:
        settings.DATABASE_NAME = old_db

def test_12_no_public_qa_bypass_or_secret_leak():
    """11. Verify that login endpoint does not leak password or contain bypass parameters."""
    res = client.post("/api/auth/login", json={
        "email": settings.QA_TEST_EMAIL,
        "password": settings.QA_TEST_PASSWORD
    })
    data = res.json()
    assert "password" not in data
    assert "passwordHash" not in data["user"]
    assert "secret" not in data
