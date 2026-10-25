<div align="center">

  <img src="assets/pravah-banner.svg" alt="PRAVAH - AICTE Approval Platform" width="100%" />

  <br />

  <p align="center">
    <strong>A Unified Institutional Web Platform for Technical Education Approval Operations</strong><br />
    Statutory 15-Day SLA Enforcement &bull; Autonomous 3D Workflow Conduit &bull; Geofenced EVC Inspections &bull; SHA-256 Chained Audits
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js_14-App_Router-black?style=for-the-badge&logo=next.js" alt="Next.js 14" />
    <img src="https://img.shields.io/badge/Three.js-3D_Autonomous_Pipeline-049EF4?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js" />
    <img src="https://img.shields.io/badge/FastAPI-Async_REST-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/MongoDB-Atlas_%2F_Local_%2F_Memory-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Docker-Compose_Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>

</div>

---

## 📖 Table of Contents

1. [Overview](#-overview)
2. [Supported Environments & Prerequisites](#-supported-environments--prerequisites)
3. [Method A — One-Command Local Startup](#-method-a--one-command-local-startup-recommended)
4. [Method B — Docker Compose Startup](#-method-b--docker-compose-startup)
5. [Application URLs](#-application-urls)
6. [Pre-Seeded Test Credentials](#-pre-seeded-test-credentials)
7. [The 3 Statutory Regulatory Inquiries](#-the-3-statutory-regulatory-inquiries)
8. [Database Configuration & Persistence](#-database-configuration--persistence)
9. [Running Tests & Validations](#-running-tests--validations)
10. [Troubleshooting & Common Questions](#-troubleshooting--common-questions)
11. [Security Architecture & File Uploads](#-security-architecture--file-uploads)

---

## 🌟 Overview

**PRAVAH** is an institutional approval operations platform engineered for the **All India Council for Technical Education (AICTE)** under the statutory mandates of the **Approval Process Handbook (APH 2026-2027)**.

Key operational capabilities:
- **Statutory 15-Day Scrutiny Enforcement**: Live countdown runway gauges and automated deficiency notices.
- **Autonomous 3D Approval Pipeline**: Five-stage interactive Catmull-Rom conduit rendered in Three.js without requiring mouse input.
- **Role-Based Regulatory Desk**: Granular clearance gates for Regional Officers, Scrutiny Officers, EVC Panelists, SAC Appellate Judges, and Institution Applicants.
- **Cryptographic Audit Ledger**: Every action and deficiency rectification is chained with actor attribution and SHA-256 seals.

---

## 💻 Supported Environments & Prerequisites

### Supported Operating Systems
| Operating System | Version | Status |
|---|---|---|
| **Microsoft Windows** | Windows 10 / 11 (64-bit) | Fully Supported (`run.bat`, `run.ps1`) |
| **Linux** | Ubuntu 20.04+, Debian 11+, Fedora 38+ | Fully Supported (`./run.sh`) |
| **macOS** | macOS Monterey 12.0+ (Apple Silicon & Intel) | Fully Supported (`./run.sh`) |

### Runtime Prerequisites
| Software | Required Version | Purpose |
|---|---|---|
| **Node.js** | `v18.17.0+` or `v20.x LTS` (Tested on v20 and v24) | Next.js Frontend Client & SSR |
| **npm** | `v9.0.0+` (Comes with Node.js) | Frontend Package Manager |
| **Python** | `3.10` to `3.14` (Recommended: `3.11` LTS) | FastAPI Async Engine & Services |
| **pip** | Latest | Python Package Installer |
| **Docker** *(Optional)* | Docker Desktop 20.10+ & Compose v2 | Containerised Cluster Execution |

---

## ⚡ Method A — One-Command Local Startup (Recommended)

The platform provides a zero-configuration launcher that automatically handles virtual environment creation, dependency installation, safe configuration seeding, database initialization, backend readiness polling, and frontend service launch.

### On Windows
Open Command Prompt or PowerShell inside the `PRAVAH` folder:
```cmd
run.bat
```
*Or using PowerShell:*
```powershell
.\run.ps1
```

### On Linux / macOS
Open Terminal inside the `PRAVAH` folder:
```bash
chmod +x run.sh diagnose.sh
./run.sh
```

### What the Launcher Does Automatically:
1. Verifies your installed Python (3.10+) and Node.js (18+) versions.
2. Creates `.env` from `.env.example` with an auto-generated 256-bit cryptographic `JWT_SECRET`.
3. Creates an isolated Python virtual environment in `backend/.venv`.
4. Installs and caches all backend and frontend dependencies from lockfiles.
5. Performs an idempotent database schema and seed check (`python -m backend.seed_demo_data`).
6. Starts the backend and polls `http://127.0.0.1:8000/api/ready` until the health probe passes.
7. Starts the frontend and opens the platform ready for immediate use.

### Stopping the Application:
- **Windows**: Simply close the two opened command windows, or press `Ctrl + C`.
- **Linux/macOS**: Press `Ctrl + C` in the terminal; the trap handler safely terminates all child background processes.

---

## 🐳 Method B — Docker Compose Startup

For containerised execution with dedicated MongoDB, FastAPI, and Next.js services on an isolated internal network:

### 1. Launch Container Cluster
```bash
docker compose up --build
```

### 2. Stop Container Cluster
```bash
docker compose down
```

### Docker Network Architecture:
- `mongo`: MongoDB 7.0 database service with persistent volume `pravah_mongodb_data`.
- `backend`: Containerised FastAPI server running non-root with volume `pravah_uploads_data`.
- `frontend`: Multi-stage standalone Next.js 14 container proxying `/api` requests internally.

---

## 🌐 Application URLs

Once the platform is running:

| Service | Address | Description |
|---|---|---|
| **Web Portal** | [http://localhost:3000](http://localhost:3000) | Landing Page & 3D Autonomous Approval Pipeline |
| **Executive Dashboard** | [http://localhost:3000/dashboard](http://localhost:3000/dashboard) | 5 Statutory KPI Cards & Case Dossier Registry |
| **Case File Dossier** | [http://localhost:3000/applications/APP-2026-00124](http://localhost:3000/applications/APP-2026-00124) | Dronacharya Institute Full Stitch Case Dossier |
| **Interactive API Docs** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Swagger OpenAPI Test Console |
| **Readiness Health** | [http://127.0.0.1:8000/api/ready](http://127.0.0.1:8000/api/ready) | System Dependencies Readiness Probe |
| **Liveness Probe** | [http://127.0.0.1:8000/api/live](http://127.0.0.1:8000/api/live) | Container Liveness Health Probe |

---

## 👥 Pre-Seeded Test Credentials

Use these pre-configured institutional credentials to inspect role-specific views and clearance desks:

| Role | Email | Password | Regional Desk / Jurisdiction |
|---|---|---|---|
| **Regional Officer (RO)** | `r.srivastava@aicte-india.org` | `Password@123` | Northern Regional Office (NRO) - Kanpur |
| **Senior Scrutiny Officer** | `p.verma@aicte-india.org` | `Password@123` | Scrutiny Desk & Cadre Audit |
| **Institution Representative** | `admin@dronacharya-engg.ac.in` | `Password@123` | Dronacharya Institute (`APP-2026-00124`) |
| **Central AICTE Administrator** | `admin@aicte-india.org` | `AdminPassword@123` | Central Bureau / Member Secretary Desk |
| **EVC Member** | `s.sen@iitr.ac.in` | `Password@123` | IIT Roorkee / Inspection Pool |
| **Standing Appeals (SAC)** | `committee@aicte-india.org` | `Password@123` | Standing Appeals Committee - New Delhi |
| **Regulatory Auditor** | `auditor@aicte-india.org` | `AuditorPassword@123` | CAG Institutional Regulatory Auditor |

---

## 🏛️ The 3 Statutory Regulatory Inquiries

<div align="center">
  <img src="assets/pipeline-flow.svg" alt="Statutory Regulatory Workflow" width="100%" />
</div>

Every screen in PRAVAH directly answers the three core regulatory inquiries:
1. **What is pending?** &mdash; Explicit identification of missing affidavits, deficient 30-year registered land titles, faculty cadre disparities, or unpledged FDRs down to specific folio numbers.
2. **Why is it blocked?** &mdash; Direct statutory citations (*AICTE APH Rule 2.4.1*), live overdue countdowns (+24h breach indicators), and statutory cure window statuses.
3. **What action happens next?** &mdash; Role-aware statutory interventions:
   - **48-Hour Grace Notice**: Delegated prerogative invoked by Regional Officers without national grievance flags.
   - **Issue Deficiency Form-B**: Digital deficiency notice with SMS alert and strict 7-day cure window.
   - **Escalate to SAC Hearing**: Transfers case to the Standing Appeals Committee in New Delhi.
   - **Recommend for EVC**: Unlocks 3-member biometric on-site inspection roster.

---

## 🍃 Database Configuration & Persistence

PRAVAH supports three database execution profiles:

1. **Local MongoDB (Default)**:
   Connects to `mongodb://127.0.0.1:27017/pravah_aicte_db`. Data persists automatically across restarts.
2. **MongoDB Atlas (Cloud)**:
   Set `MONGODB_URI` in `.env`:
   ```bash
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/pravah_aicte_db?retryWrites=true&w=majority
   ```
3. **Zero-Config Demonstration Mode (Fallback)**:
   If no MongoDB server is running, the backend automatically operates using an in-memory repository seeded with realistic AICTE institutional approval records, enabling instant zero-dependency testing.

### Idempotent Demo Data Seed Command
To verify or seed demonstration data into your MongoDB database at any time without duplicating records:
```bash
# Windows
python -m backend.seed_demo_data

# Linux / macOS
backend/.venv/bin/python -m backend.seed_demo_data
```

---

## 🧪 Running Tests & Validations

### Backend Test Suite (71 Tests)
```bash
# Run all backend unit, integration, RBAC, and security tests
pytest backend/tests
```

### Dedicated QA Test Fixture Suite (12 Acceptance Tests)
```bash
# Run the persistent QA test account and safeguard verification suite
pytest backend/tests/test_qa_fixture.py -v
```

### Persistent QA Test Account & E2E Automation
PRAVAH provides a persistent, reusable QA test identity (`usr-qa-test-01`) for deterministic automated testing without registering new accounts on every test run.
- **Initialise QA Test Data:** `python -m backend.init_qa_user --force`
- **Comprehensive Documentation:** Refer to [docs/QA_TESTING.md](docs/QA_TESTING.md) for architecture details, environment flags, and CI/CD safeguards.

### Frontend Validations
```bash
cd frontend

# ESLint Syntax & Rule Check
npm run lint

# TypeScript Strict Typecheck
npm run typecheck

# Production Next.js Build Validation
npm run build
```

---

## 🔧 Troubleshooting & Common Questions

### Diagnostic Tool
If you experience any issues, run the built-in diagnostic tool to test your environment:
- **Windows**: Double-click or run `diagnose.bat`
- **Linux / macOS**: `./diagnose.sh`

### Common Errors & Solutions

| Error Symptom | Cause | Solution |
|---|---|---|
| `Port 8000 is currently occupied` | Another process is using port 8000 | Kill the process or set `PORT=8001` in `.env` |
| `Port 3000 is currently occupied` | Another process is using port 3000 | Next.js will ask to run on 3001, or free port 3000 |
| `ModuleNotFoundError: No module named 'backend'` | Running command from parent workspace folder | Always run from the `PRAVAH` directory (`cd PRAVAH`) or use `run.bat` |
| `Command failed with ENOENT: next` | `npm install` hasn't run yet | Run `cd frontend && npm install` or use `run.bat` |
| `Cannot find path 'D:\next\dist\bin\next'` | Windows cmd path with ampersand `&` | Fixed in package.json by using node direct execution scripts |

---

## 🔒 Security Architecture & File Uploads

- **No Hardcoded Machine Paths**: Storage paths use `pathlib.Path` resolved relative to the configured `UPLOAD_DIR`.
- **Path Traversal Protection**: Upload and download endpoints strictly verify that resolved canonical paths remain inside `settings.UPLOAD_DIR`.
- **Cryptographic File Sealing**: Uploaded documents are hashed with SHA-256 and stamped into the application audit trail.
- **Strict Role-Based Registration**: Public registration is strictly constrained to `institution_rep`; privileged roles cannot be self-assigned.
- **Safe Secrets Handling**: Production mode rejects default or short JWT secrets (minimum 32 characters required).

---

<div align="center">
  <p><strong>PRAVAH &mdash; AICTE Approval Operations Platform</strong></p>
  <p>Preserving Statutory Integrity &bull; Accelerating Technical Education</p>
</div>
