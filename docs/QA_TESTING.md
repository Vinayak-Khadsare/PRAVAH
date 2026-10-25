# PRAVAH — Persistent QA Test User & Automated Testing Architecture

## 1. Executive Summary & Purpose

During automated end-to-end (E2E) regression runs and workflow audits, creating temporary user accounts on every test run introduces significant overhead:
- Test runners must continually register throwaway accounts.
- Repeat manual verification steps.
- Poll or recreate synthetic application conditions.
- Clutter test databases with orphaned records.

PRAVAH establishes a **persistent, reusable QA test identity** and **deterministic test fixture pipeline**. Automated test runners (pytest, Playwright, HTTP agents, and Antigravity verification agents) can reuse the same identity across repeated runs without registering new accounts, while strictly enforcing real authentication and RBAC boundaries.

---

## 2. QA Identity Specifications

The QA test account is provisioned with deterministic attributes:

| Parameter | Default (Local / Test Env) | Environment Variable Override | Notes |
| :--- | :--- | :--- | :--- |
| **Email** | `pravah.qa@example.test` | `QA_TEST_EMAIL` | Uses RFC 2606 reserved `.test` domain |
| **User ID** | `usr-qa-test-01` | Fixed deterministic ID | Never conflicts with dynamic `usr-inst-*` |
| **Name** | `PRAVAH QA Test User` | `QA_TEST_NAME` | Visible in audit trails and `/auth/me` |
| **Role** | `institution_rep` | `QA_TEST_ROLE` | Minimum privilege required for institution tests |
| **PID** | `1-4392811` | `QA_TEST_PID` | Scoped to Bharat Institute of Technology |
| **Institution**| `Bharat Institute of Technology` | `QA_TEST_INSTITUTION`| Matches active case records |
| **Regional Office**| `Northern Regional Office (NRO) - Kanpur` | `QA_TEST_REGIONAL_OFFICE` | Matches Northern Regional jurisdiction |
| **Status** | `active: True, verificationStatus: 'verified'` | N/A | Fully verified institution rep |

> [!IMPORTANT]
> The `.test` domain is reserved under **RFC 2606** specifically for testing. It can never be registered on the public internet, ensuring safety against accidental outbound email delivery.

---

## 3. Production Safeguards & Safety Invariants

The QA account is an internal testing mechanism, **never** a product feature. The implementation enforces strict fail-closed safeguards:

1. **Disabled by Default:**
   The feature toggle `PRAVAH_ENABLE_TEST_FIXTURES` defaults to `false`. Running initialisation without explicitly enabling this flag (or passing `--force` in local CLI testing) fails immediately with exit code 1.
2. **Strict Production Environment Gate:**
   If `ENVIRONMENT=production`, the fixture initialiser **refuses to run** under all circumstances, even if `PRAVAH_ENABLE_TEST_FIXTURES=true` is set.
3. **Database Name Verification:**
   The initialiser examines the connected database name. If `DATABASE_NAME` contains `prod` or `production` (case-insensitive), execution is immediately aborted to prevent writing test records to production datastores.
4. **No Public UI or Frontend Bypass:**
   - No "Login as QA" buttons on the landing page or login screen.
   - No demo credentials displayed in client code or browser bundles.
   - No backdoor query parameters (e.g. `?bypass_auth=true`) or auto-login cookies.
5. **Real Cryptographic Verification:**
   The QA user is stored with a standard **bcrypt** hash (`$2b$12$...`). Standard login requests must submit the password to `/api/auth/login` and receive a standard signed JWT. No passwords or hashes are returned in API responses.
6. **No Committed Secrets:**
   All passwords and signing keys are read from environment variables (`QA_TEST_PASSWORD`, `JWT_SECRET`). No production secrets are committed to version control.

---

## 4. How to Initialise the QA Account

### 4.1 CLI Command

To initialise the persistent QA account and synthetic application fixture:

```bash
# Option A: Enable via environment variable
set PRAVAH_ENABLE_TEST_FIXTURES=true
python -m backend.init_qa_user

# Option B: Run with explicit --force flag in development
python -m backend.init_qa_user --force
```

### 4.2 Idempotency Behaviour

The initialisation script is completely idempotent:
- **First Run:** Inspects database for `pravah.qa@example.test`. Not finding it, creates `usr-qa-test-01` with bcrypt password hash and provisions synthetic application `APP-QA-14392811`.
- **Subsequent Runs:** Detects that `usr-qa-test-01` already exists. Reuses the existing account without overwriting passwords, modifying user information, or generating duplicate records.

---

## 5. Deterministic Workflow Test Data

Along with the QA user, `backend/init_qa_user.py` provisions a synthetic technical institution application record:

- **Application ID:** `APP-QA-14392811`
- **Institution:** Bharat Institute of Technology (PID: `1-4392811`)
- **Stage:** Stage 2 — Scrutiny & Expert Validation
- **Status:** `in_scrutiny`
- **Deficiencies:** Contains 1 critical land deed defect (`DEF-QA-01`) for testing rectification workflows.
- **Undertakings:** Contains 1 statutory anti-ragging compliance undertaking (`UT-QA-01`).
- **Audit Log:** Pre-seeded with deterministic regulatory timestamps and SHA-256 integrity seal.

This allows automated workflows to exercise:
- Document upload and rectification submission (`/applications/APP-QA-14392811/deficiencies/rectify`).
- Scrutiny observation recording.
- Institutional isolation (institution reps can only access applications matching their `institutionPid`).

---

## 6. Automated Testing Integration

### 6.1 Pytest Fixtures (`backend/tests/conftest.py`)

Pytest suites automatically consume the QA user through fixtures:

```python
import pytest

def test_institution_workflow(client, qa_headers):
    # qa_headers contains Authorization: Bearer <valid_qa_jwt>
    response = client.get("/api/applications/APP-2026-00124", headers=qa_headers)
    assert response.status_code == 200
```

Available fixtures in [conftest.py](file:///d:/WORK%20&%20CODING/WORKSTATION/HACKATHON%20WORKSPACE/PRAVAAH/PRAVAH/backend/tests/conftest.py):
- `qa_user_credentials`: Dict containing `email`, `password`, `userId`, `role`, and `pid`.
- `qa_token`: Signed JWT token issued via `/api/auth/login`.
- `qa_headers`: HTTP header dict `{"Authorization": "Bearer <qa_token>"}`.

### 6.2 Verification Test Suite

The 12 acceptance criteria defined for the QA test user are formally tested in [backend/tests/test_qa_fixture.py](file:///d:/WORK%20&%20CODING/WORKSTATION/HACKATHON%20WORKSPACE/PRAVAAH/PRAVAH/backend/tests/test_qa_fixture.py):

```bash
pytest backend/tests/test_qa_fixture.py -v
```

Tests include:
1. Initialisation on an empty test database.
2. Idempotent re-initialisation reusing identity without duplicates.
3. `/api/auth/login` accepts configured QA credentials.
4. Bad passwords correctly rejected (401 Unauthorized).
5. Issued JWT token contains strictly `institution_rep` scope.
6. Protected endpoints enforce valid tokens.
7. Unauthorised administrative routes (`/api/admin/users`) blocked (403 Forbidden).
8. Permitted institution routes (`/api/applications/APP-2026-00124`) accessible (200 OK).
9. Feature disabled by default without `PRAVAH_ENABLE_TEST_FIXTURES=true`.
10. `ENVIRONMENT=production` strictly blocks fixture initialisation.
11. Production-named database strictly refused.
12. Zero password hash or credential leakage in API responses.

---

## 7. Configuration Reference

| Environment Variable | Description | Default | Allowed Values |
| :--- | :--- | :--- | :--- |
| `PRAVAH_ENABLE_TEST_FIXTURES` | Master switch for QA fixtures | `false` | `true`, `false`, `1`, `0` |
| `QA_TEST_EMAIL` | QA user login email | `pravah.qa@example.test` | RFC 2606 test email |
| `QA_TEST_PASSWORD` | QA user login password | `QaTestingPassword@2026` | Plaintext string (test only) |
| `QA_TEST_NAME` | QA user display name | `PRAVAH QA Test User` | String |
| `QA_TEST_ROLE` | QA user RBAC role | `institution_rep` | Valid `UserRole` |
| `QA_TEST_PID` | AICTE Institute PID | `1-4392811` | Format: `1-XXXXXXX` |
| `QA_TEST_INSTITUTION` | Institution Name | `Bharat Institute of Technology` | String |
| `QA_TEST_REGIONAL_OFFICE` | Regional Office | `Northern Regional Office (NRO) - Kanpur` | Valid Regional Office |

---

## 8. Summary Checklist for CI/CD Pipelines

- [x] Set `PRAVAH_ENABLE_TEST_FIXTURES=true` in CI test runner stage.
- [x] Run `python -m backend.init_qa_user` once prior to E2E test runs.
- [x] Pass `QA_TEST_EMAIL` and `QA_TEST_PASSWORD` as test secrets.
- [x] In staging/production deploy steps, verify `PRAVAH_ENABLE_TEST_FIXTURES=false`.
- [x] Ensure production database names never match `*prod*` when running test runners.
