import pytest
from datetime import timedelta
from backend.database import db_manager
from backend.security import hash_password, verify_password, create_access_token, decode_access_token

# ==============================================================================
# PHASE 8 — 20 MANDATORY RBAC & AUTHENTICATION TESTS
# ==============================================================================

# 1. Successful registration
def test_01_successful_registration(client):
    """Public registration creates an institution_rep with pending/verified status."""
    res = client.post("/api/auth/register", json={
        "name": "Dr. Ramesh Gupta",
        "email": "r.gupta@kpriet-edu.ac.in",
        "password": "SecurePassword@2026",
        "confirmPassword": "SecurePassword@2026",
        "institutionName": "KPR Institute of Engineering & Technology",
        "institutionPid": "1-4392811"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "r.gupta@kpriet-edu.ac.in"
    assert data["role"] == "institution_rep"
    assert data["institutionPid"] == "1-4392811"
    assert "password" not in data
    assert "passwordHash" not in data

# 2. Duplicate email rejection
def test_02_duplicate_email_rejection(client):
    """Attempting to register with an existing email returns 409 Conflict."""
    payload = {
        "name": "First Register",
        "email": "duplicate.test@kpriet.ac.in",
        "password": "SecurePassword@2026",
        "confirmPassword": "SecurePassword@2026",
        "institutionName": "KPR Institute of Engineering & Technology",
        "institutionPid": "1-4392811"
    }
    # Initial registration
    res1 = client.post("/api/auth/register", json=payload)
    assert res1.status_code == 201

    # Second registration with identical email
    res2 = client.post("/api/auth/register", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"].lower()

# 3. Password hashing and verification
def test_03_password_hashing_and_verification():
    """Passwords are securely hashed with bcrypt and verifiable."""
    raw_pass = "ComplexAdminPass@2026!"
    hashed = hash_password(raw_pass)
    assert hashed != raw_pass
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword123", hashed) is False

# 4. Successful login
def test_04_successful_login(client):
    """Valid credentials return signed JWT and clean user payload without secrets."""
    # Register test user
    email = "login.test@institution.edu"
    pwd = "LoginPassword@2026"
    reg_res = client.post("/api/auth/register", json={
        "name": "Login Test User",
        "email": email,
        "password": pwd,
        "confirmPassword": pwd,
        "institutionName": "Test Tech Institute",
        "institutionPid": "1-4392811"
    })
    assert reg_res.status_code == 201

    # Login
    res = client.post("/api/auth/login", json={
        "email": email,
        "password": pwd
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == email
    assert data["user"]["role"] == "institution_rep"
    assert "passwordHash" not in data["user"]

# 5. Invalid password rejection
def test_05_invalid_password_rejection(client):
    """Invalid passwords fail with 401 Unauthorized and safe error message."""
    res = client.post("/api/auth/login", json={
        "email": "admin@dronacharya-engg.ac.in",
        "password": "TotallyWrongPassword"
    })
    assert res.status_code == 401
    assert "Invalid credentials" in res.json()["detail"]

# 6. Correct role returned by /auth/me
def test_06_correct_role_returned_by_auth_me(client, ro_token, inst_token, auditor_token):
    """Current user profile returns authenticated role and institutional scope."""
    res_ro = client.get("/api/auth/me", headers={"Authorization": f"Bearer {ro_token}"})
    assert res_ro.status_code == 200
    assert res_ro.json()["role"] == "regional_officer"

    res_inst = client.get("/api/auth/me", headers={"Authorization": f"Bearer {inst_token}"})
    assert res_inst.status_code == 200
    assert res_inst.json()["role"] == "institution_rep"
    assert res_inst.json()["institutionPid"] == "1-4392811"

    res_auditor = client.get("/api/auth/me", headers={"Authorization": f"Bearer {auditor_token}"})
    assert res_auditor.status_code == 200
    assert res_auditor.json()["role"] == "auditor"

# 7. Expired and tampered token rejection
def test_07_expired_and_tampered_token_rejection(client):
    """Expired or forged tokens are rejected with 401."""
    # Expired token
    expired_token = create_access_token({"sub": "exp@aicte.org", "userId": "u1"}, expires_delta=timedelta(seconds=-10))
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert res.status_code == 401

    # Tampered token
    tampered_token = expired_token[:-5] + "XXXXX"
    res2 = client.get("/api/auth/me", headers={"Authorization": f"Bearer {tampered_token}"})
    assert res2.status_code == 401

# 8. Inactive account rejection
def test_08_inactive_account_rejection(client):
    """Inactive accounts cannot authenticate or access endpoints."""
    # Register an account and deactivate it
    email = "inactive.user@college.edu"
    client.post("/api/auth/register", json={
        "name": "Inactive User",
        "email": email,
        "password": "Password@123",
        "confirmPassword": "Password@123",
        "institutionName": "Deactivated College",
        "institutionPid": "1-9999999"
    })
    # Deactivate in database store
    db_manager.users[email]["active"] = False

    # Attempt login
    res = client.post("/api/auth/login", json={"email": email, "password": "Password@123"})
    assert res.status_code == 403
    assert "deactivated" in res.json()["detail"].lower()

# 9. Public registration cannot create privileged roles
def test_09_public_registration_cannot_create_privileged_roles(client):
    """Even if an attacker sends role='super_admin' or 'aicte_admin', it is ignored."""
    res = client.post("/api/auth/register", json={
        "name": "Attacker Trying SuperAdmin",
        "email": "hacker@intruder.net",
        "password": "Password@123",
        "confirmPassword": "Password@123",
        "role": "super_admin",
        "institutionName": "Fake University",
        "institutionPid": "1-0000000"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["role"] == "institution_rep"
    assert data["role"] != "super_admin"

# 10. Institution representatives cannot access another institution's records
def test_10_institution_isolation(client, inst_token):
    """An institution rep with PID 1-4392811 cannot view or upload documents to another PID's application."""
    # Add an application belonging to a foreign PID
    db_manager.applications["APP-FOREIGN-01"] = {
        "id": "APP-FOREIGN-01",
        "pid": "1-8888888",
        "institutionName": "Foreign Engineering College",
        "status": "in_scrutiny",
        "regionalOffice": "Northern Regional Office (NRO) - Kanpur",
        "auditLog": []
    }
    # Access attempt
    res = client.get("/api/applications/APP-FOREIGN-01", headers={"Authorization": f"Bearer {inst_token}"})
    assert res.status_code == 403
    assert "Access restricted" in res.json()["detail"]

# 11. Scrutiny officers cannot execute unauthorized administrator actions
def test_11_scrutiny_officer_cannot_execute_admin_actions(client, so_token):
    """Scrutiny officer cannot list or provision users in administrative endpoints."""
    res = client.get("/api/admin/users", headers={"Authorization": f"Bearer {so_token}"})
    assert res.status_code == 403
    assert "Access denied" in res.json()["detail"]

# 12. EVC members cannot execute unrelated workflow actions
def test_12_evc_cannot_execute_unrelated_workflow_actions(client, evc_token):
    """EVC member cannot grant statutory grace notices or make administrative decisions."""
    res = client.post(
        "/api/applications/APP-2026-00124/grace-notice",
        headers={"Authorization": f"Bearer {evc_token}"},
        json={"hours": 48}
    )
    assert res.status_code == 403

# 13. Committee members cannot perform unauthorized decisions
def test_13_committee_cannot_perform_unauthorized_decisions(client, committee_token):
    """Committee members cannot grant grace notices reserved for Regional Officers."""
    res = client.post(
        "/api/applications/APP-2026-00124/grace-notice",
        headers={"Authorization": f"Bearer {committee_token}"},
        json={"hours": 48}
    )
    assert res.status_code == 403

# 14. Auditors cannot mutate protected data
def test_14_auditor_cannot_mutate_protected_data(client, auditor_token):
    """Auditors have read-only access; any mutating POST/PUT/DELETE is blocked with 403."""
    # Auditor can read audit events
    read_res = client.get("/api/audit", headers={"Authorization": f"Bearer {auditor_token}"})
    assert read_res.status_code == 200

    # Auditor attempting mutation (e.g. acknowledging alert) is rejected
    mutate_res = client.post(
        "/api/alerts/ALT-2026-0089/acknowledge",
        headers={"Authorization": f"Bearer {auditor_token}"}
    )
    assert mutate_res.status_code == 403

# 15. Direct API requests cannot bypass frontend restrictions
def test_15_direct_api_bypass_prevention(client):
    """Direct API calls without authorization header or with forged credentials fail."""
    res = client.post("/api/admin/users", json={
        "name": "Forged User",
        "email": "forged@aicte.org",
        "password": "Password@123",
        "role": "super_admin"
    })
    assert res.status_code == 401

# 16. Navigation & Permissions: Admin can provision privileged users
def test_16_admin_provision_privileged_users(client, admin_token):
    """AICTE Administrator can securely provision an authorized scrutiny officer."""
    res = client.post("/api/admin/users", headers={"Authorization": f"Bearer {admin_token}"}, json={
        "name": "Dr. Sunita Rao",
        "email": "s.rao@aicte-india.org",
        "password": "OfficerPassword@2026",
        "role": "scrutiny_officer",
        "regionalOffice": "Northern Regional Office (NRO) - Kanpur"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["role"] == "scrutiny_officer"
    assert data["email"] == "s.rao@aicte-india.org"

# 17. Logging out and signing in as another user correctly updates role state
def test_17_logout_and_switch_identity(client):
    """Simulate logging in as Officer, verifying role, then logging in as Auditor."""
    # Officer login
    res_officer = client.post("/api/auth/login", json={
        "email": "p.verma@aicte-india.org",
        "password": "Password@123"
    })
    assert res_officer.status_code == 200
    token_officer = res_officer.json()["access_token"]
    me_officer = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token_officer}"})
    assert me_officer.json()["role"] == "scrutiny_officer"

    # User logs out and logs in as Auditor
    res_auditor = client.post("/api/auth/login", json={
        "email": "auditor@aicte-india.org",
        "password": "AuditorPassword@123"
    })
    assert res_auditor.status_code == 200
    token_auditor = res_auditor.json()["access_token"]
    me_auditor = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token_auditor}"})
    assert me_auditor.json()["role"] == "auditor"

# 18. Protected pages redirect unauthenticated users
def test_18_protected_endpoints_require_authentication(client):
    """Calling sensitive endpoints without credentials returns 401."""
    assert client.get("/api/applications").status_code == 401
    assert client.get("/api/evc").status_code == 401
    assert client.get("/api/compliance").status_code == 401
    assert client.get("/api/admin/users").status_code == 401

# 19. Unauthorized pages show clear access-denied state
def test_19_unauthorized_endpoints_return_403(client, inst_token):
    """Institution representatives cannot view administrative or schedule EVCs."""
    res_admin = client.get("/api/admin/users", headers={"Authorization": f"Bearer {inst_token}"})
    assert res_admin.status_code == 403
    assert "Access denied" in res_admin.json()["detail"]

    res_evc_schedule = client.post("/api/evc/schedule", headers={"Authorization": f"Bearer {inst_token}"}, json={
        "applicationId": "APP-2026-00124",
        "visitDate": "2026-03-25",
        "panelConvener": "Prof. X",
        "panelMembers": ["Prof. Y"]
    })
    assert res_evc_schedule.status_code == 403

# 20. Existing application workflows continue to function
def test_20_existing_workflows_continue_to_function(client, so_token, inst_token, ro_token):
    """Application observations, grace notices, and rectifications execute properly."""
    # 1. Scrutiny observation
    res_obs = client.post(
        "/api/applications/APP-2026-00124/observations",
        headers={"Authorization": f"Bearer {so_token}"},
        json={"observation": "Land title verification indicates compliance with Clause 2.4."}
    )
    assert res_obs.status_code == 200
    assert res_obs.json()["success"] is True

    # 2. Regional officer grace notice
    res_grace = client.post(
        "/api/applications/APP-2026-00124/grace-notice",
        headers={"Authorization": f"Bearer {ro_token}"},
        json={"hours": 48}
    )
    assert res_grace.status_code == 200

    # 3. Institution representative rectification
    res_rect = client.post(
        "/api/applications/APP-2026-00124/rectifications",
        headers={"Authorization": f"Bearer {inst_token}"},
        json={
            "deficiencyRefCode": "APH-2026-CH2-S2.4",
            "rectificationDetails": "Duly certified supplementary land deed registered."
        }
    )
    assert res_rect.status_code == 200
    assert res_rect.json()["success"] is True
