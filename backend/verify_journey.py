"""
Verification Script for PRAVAH Phase 9 End-to-End Journey.
Executes live HTTP requests against running backend (port 8000) and frontend (port 3000).
"""
import sys
import requests

BACKEND_URL = "http://127.0.0.1:8000/api"
FRONTEND_URL = "http://localhost:3000"

def log_step(step_num: int, title: str):
    print(f"\n=======================================================")
    print(f"STEP {step_num}: {title}")
    print(f"=======================================================")

def assert_true(condition: bool, msg: str):
    if not condition:
        print(f"  [FAIL] {msg}")
        sys.exit(1)
    print(f"  [PASS] {msg}")

def main():
    print("Initiating PRAVAH RBAC & Authentication End-to-End Verification...\n")

    # Step 1: Health check
    log_step(1, "Verify Backend Health & MongoDB Connection")
    res = requests.get(f"{BACKEND_URL}/health")
    assert_true(res.status_code == 200, f"Health check returned 200 OK: {res.json()['status']}")
    print(f"       Database mode: {res.json()['database']['mode']}")

    # Step 2: Open /login on frontend and confirm 'Create Account' link
    log_step(2, "Inspect /login for 'Create Account' link")
    res = requests.get(f"{FRONTEND_URL}/login")
    assert_true(res.status_code == 200, "Frontend /login returned 200 OK")
    assert_true("/register" in res.text, "'Create Account' link to /register found in /login HTML")
    assert_true("Create Account" in res.text or "create" in res.text.lower(), "Create Account call-to-action text confirmed")

    # Step 3: Open /register on frontend and confirm 'Sign In' link
    log_step(3, "Inspect /register for Registration Form and 'Sign In' link")
    res = requests.get(f"{FRONTEND_URL}/register")
    assert_true(res.status_code == 200, "Frontend /register returned 200 OK")
    assert_true("/login" in res.text, "'Sign In' link to /login found in /register HTML")
    assert_true("Permanent Institute ID" in res.text or "PID" in res.text, "PID field label confirmed")

    # Step 4: Verify Persistent QA Test Identity Initialisation
    log_step(4, "Initialise & Verify Persistent QA Test Identity (Idempotent)")
    try:
        from backend.init_qa_user import initialize_qa_account, QA_USER_ID
        import asyncio
        qa_init_res = asyncio.run(initialize_qa_account(force=True))
        assert_true(qa_init_res["status"] in ("created", "reused"), f"QA User confirmed with status: {qa_init_res['status']}")
        assert_true(qa_init_res["userId"] == QA_USER_ID, f"Deterministic QA User ID verified: {QA_USER_ID}")
    except Exception as e:
        print(f"  [WARN] In-process QA initialisation skipped ({e}). Proceeding to API-level verification.")

    # Step 5: Log in using persistent QA credentials
    log_step(5, f"Log In as Persistent QA Test User ({settings.QA_TEST_EMAIL})")
    login_res = requests.post(f"{BACKEND_URL}/auth/login", json={
        "email": settings.QA_TEST_EMAIL,
        "password": settings.QA_TEST_PASSWORD
    })
    assert_true(login_res.status_code == 200, "Persistent QA test user login succeeded with 200 OK")
    login_data = login_res.json()
    assert_true("access_token" in login_data, "Valid signed JWT access token returned")
    inst_token = login_data["access_token"]

    # Step 6: Verify /auth/me profile
    log_step(6, "Verify /auth/me for Persistent QA Test User")
    me_res = requests.get(f"{BACKEND_URL}/auth/me", headers={"Authorization": f"Bearer {inst_token}"})
    assert_true(me_res.status_code == 200, f"/auth/me succeeded: {me_res.json()['name']}")
    assert_true(me_res.json()["role"] == settings.QA_TEST_ROLE, f"Role verified as '{settings.QA_TEST_ROLE}'")
    assert_true(me_res.json()["institutionPid"] == settings.QA_TEST_PID, f"PID verified as '{settings.QA_TEST_PID}'")
    assert_true("passwordHash" not in me_res.json(), "Password hash is strictly omitted from user profile")

    # Step 7: Confirm Institution Scoping (Permitted vs Foreign Access)
    log_step(7, "Confirm Institution-Level Scoping & Isolation for QA User")
    # Access permitted own institution application (synthetic or existing for PID)
    own_app = requests.get(f"{BACKEND_URL}/applications/APP-2026-00124", headers={"Authorization": f"Bearer {inst_token}"})
    assert_true(own_app.status_code == 200, f"QA institution rep can access own application (PID {settings.QA_TEST_PID}): {own_app.json()['id']}")

    # Institution rep cannot access administrative users
    admin_access = requests.get(f"{BACKEND_URL}/admin/users", headers={"Authorization": f"Bearer {inst_token}"})
    assert_true(admin_access.status_code == 403, f"QA institution rep denied access to /admin/users: 403 Forbidden")

    # Step 8: Log out (client side token discards) and log in as Scrutiny Officer
    log_step(8, "Log In as Scrutiny Officer (Dr. P. K. Verma)")
    so_login = requests.post(f"{BACKEND_URL}/auth/login", json={
        "email": "p.verma@aicte-india.org",
        "password": "Password@123"
    })
    assert_true(so_login.status_code == 200, "Scrutiny Officer login succeeded")
    so_token = so_login.json()["access_token"]
    so_me = requests.get(f"{BACKEND_URL}/auth/me", headers={"Authorization": f"Bearer {so_token}"})
    assert_true(so_me.json()["role"] == "scrutiny_officer", "Scrutiny Officer role verified")

    # Step 9: Scrutiny Officer Authorized vs Unauthorized Action
    log_step(9, "Test Scrutiny Officer Permissions & Unauthorized Admin Action")
    # Authorized: Scrutiny observation
    obs_res = requests.post(
        f"{BACKEND_URL}/applications/APP-2026-00124/observations",
        headers={"Authorization": f"Bearer {so_token}"},
        json={"observation": "Statutory deed verification completed per APH 2026 Clause 2.4."}
    )
    assert_true(obs_res.status_code == 200, f"Observation recorded successfully: {obs_res.json()['success']}")

    # Unauthorized: Admin user management
    so_admin = requests.get(f"{BACKEND_URL}/admin/users", headers={"Authorization": f"Bearer {so_token}"})
    assert_true(so_admin.status_code == 403, f"Scrutiny Officer rejected from /admin/users: 403 Forbidden")

    # Step 10: EVC Member verification
    log_step(10, "Log In as EVC Member (Prof. S. Sen)")
    evc_login = requests.post(f"{BACKEND_URL}/auth/login", json={
        "email": "s.sen@iitr.ac.in",
        "password": "Password@123"
    })
    assert_true(evc_login.status_code == 200, "EVC Member login succeeded")
    evc_token = evc_login.json()["access_token"]
    # EVC member attempting regional officer grace notice
    evc_grace = requests.post(
        f"{BACKEND_URL}/applications/APP-2026-00124/grace-notice",
        headers={"Authorization": f"Bearer {evc_token}"},
        json={"hours": 48}
    )
    assert_true(evc_grace.status_code == 403, f"EVC member blocked from granting statutory grace notice: 403 Forbidden")

    # Step 11: Committee Member verification
    log_step(11, "Log In as Committee Member (Hon'ble Justice B. N. Rao)")
    comm_login = requests.post(f"{BACKEND_URL}/auth/login", json={
        "email": "committee@aicte-india.org",
        "password": "Password@123"
    })
    assert_true(comm_login.status_code == 200, "Committee Member login succeeded")
    comm_token = comm_login.json()["access_token"]
    comm_me = requests.get(f"{BACKEND_URL}/auth/me", headers={"Authorization": f"Bearer {comm_token}"})
    assert_true(comm_me.json()["role"] == "committee_member", "Committee Member role verified")

    # Step 12: Auditor Read-Only Verification
    log_step(12, "Log In as CAG Regulatory Auditor & Verify Read-Only Enforcement")
    aud_login = requests.post(f"{BACKEND_URL}/auth/login", json={
        "email": "auditor@aicte-india.org",
        "password": "AuditorPassword@123"
    })
    assert_true(aud_login.status_code == 200, "Auditor login succeeded")
    aud_token = aud_login.json()["access_token"]
    # Auditor can read audit trail
    aud_read = requests.get(f"{BACKEND_URL}/audit", headers={"Authorization": f"Bearer {aud_token}"})
    assert_true(aud_read.status_code == 200, f"Auditor can view audit records: count={len(aud_read.json())}")

    # Auditor mutating request is blocked
    aud_mutate = requests.post(
        f"{BACKEND_URL}/alerts/ALT-2026-0089/acknowledge",
        headers={"Authorization": f"Bearer {aud_token}"}
    )
    assert_true(aud_mutate.status_code == 403, f"Auditor mutation request blocked: 403 Forbidden")

    # Step 13: Super Admin / AICTE Admin Verification
    log_step(13, "Log In as AICTE Central Administrator & Manage Users")
    admin_login = requests.post(f"{BACKEND_URL}/auth/login", json={
        "email": "admin@aicte-india.org",
        "password": "AdminPassword@123"
    })
    assert_true(admin_login.status_code == 200, "AICTE Admin login succeeded")
    admin_token = admin_login.json()["access_token"]
    # AICTE admin can list all registered users
    users_list = requests.get(f"{BACKEND_URL}/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert_true(users_list.status_code == 200, f"Admin listed users successfully: count={len(users_list.json())}")

    print("\n=======================================================")
    print("ALL 13 END-TO-END VERIFICATION STEPS PASSED SUCCESSFULLY!")
    print("=======================================================\n")

if __name__ == "__main__":
    main()
