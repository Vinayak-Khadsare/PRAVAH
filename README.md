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
    <img src="https://img.shields.io/badge/MongoDB-Atlas_%2F_In--Memory-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-Stitch_Design-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>

</div>

---

## ⚡ Quick Start (Run in Under 1 Minute)

### Option 1: 1-Click Launch (Windows)

Simply double-click **`start.bat`** in the repository root. It automatically opens both the backend and frontend in separate terminals!

Or run in PowerShell:
```powershell
.\start.bat
```

---

### Option 2: Step-by-Step Terminal Run

> 💡 **Path Reminder**: Always make sure your terminal is inside the **`PRAVAH`** folder (`cd PRAVAH`).

#### Terminal 1 — Backend (FastAPI)
```powershell
# From the PRAVAH folder:
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- 🌐 **Live API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- 📖 **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- 🩺 **Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

*(Or double-click `run-backend.bat`)*

#### Terminal 2 — Frontend (Next.js)
```powershell
# From the PRAVAH folder:
cd frontend
npm install   # Only needed on first run
npm run dev
```
- 🚀 **Web Application**: [http://localhost:3000](http://localhost:3000)
- 📊 **Executive Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

*(Or double-click `run-frontend.bat`)*

---

## 🏛️ The 3 Statutory Regulatory Inquiries

Every screen in PRAVAH directly resolves the core regulatory questions under the AICTE Approval Process Handbook (APH 2026):

<div align="center">
  <img src="assets/pipeline-flow.svg" alt="Statutory Regulatory Workflow" width="100%" />
</div>

1. **What is pending?** — Instant identification of missing registered lease deeds, biometric cadre ratio gaps, fire safety NOCs, or FDR deposits down to specific folio numbers.
2. **Why is it blocked?** — Precise statutory citations (e.g., *AICTE APH Rule 2.4.1*), live overdue runway gauges, and strict 15-day scrutiny timeline tracking.
3. **What action happens next?** — Role-aware statutory interventions:
   - **48-Hour Grace Notice**: Delegated Regional Officer prerogative invoked without national grievance escalation.
   - **Form-B Deficiency Notice**: Official digital deficiency notice with automated 7-day cure window.
   - **SAC / SHC Hearing**: Direct referral to Standing Appeals Committee in New Delhi.
   - **EVC Recommendation**: Unlocks 3-member biometric on-site inspection panel roster.

---

## 🎨 Autonomous 3D Approval Pipeline

PRAVAH features an autonomous 3D pipeline rendered via Three.js directly on the landing page hero:

- **Continuous Catmull-Rom Copper Conduit**: Interconnects the 5 statutory stages:
  1. **Stage 01: Application Submission (Intake)** — Official folio application dossier with copper seal.
  2. **Stage 02: Scrutiny Desk (Audit)** — Dual counter-revolving scrutiny gimbals and 15-day ceiling reticle.
  3. **Stage 03: EVC Inspection (On-Site Audit)** — Neoclassical campus colonnade and geofence radar sweep.
  4. **Stage 04: SAC / SHC Review (Appeals)** — Appellate review balance dais deliberating rectifications.
  5. **Stage 05: Authorised Approval (Decision)** — Grand Council Rosette Seal with 8-point gold medallion.
- **Autonomous Cinematic Experience**: Traveling dossier packets continuously glide along the spline path with ambient motes and zero mouse control required.
- **Design System Fidelity**: Built strictly on the Google Stitch export using Forest Green (`#234B3C`), Brushed Copper (`#B8734E`), and Warm Ivory (`#F7F4EC`).

---

## 🛠️ Architecture & Tech Stack

<div align="center">
  <img src="assets/tech-stack.svg" alt="PRAVAH Technical Architecture" width="100%" />
</div>

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Three.js, Tailwind CSS, Lucide React, Google Material Symbols.
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic v2.
- **Database**:
  - **MongoDB Atlas / Local MongoDB** via `motor.motor_asyncio`.
  - **Zero-Config In-Memory Fallback**: Seamlessly runs with rich realistic mock approval dossiers if MongoDB is not connected.
- **Security & Integrity**: Cryptographically chained SHA-256 audit ledger, role-based authorization, and client-safe environment separation.

---

## 👥 Pre-Seeded Demo Credentials

Test role-specific permissions and views using these pre-configured accounts:

| Role | Email | Password | Scope |
|---|---|---|---|
| **Regional Officer (RO)** | `r.srivastava@aicte-india.org` | `Password@123` | Northern Regional Office (NRO) |
| **Senior Scrutiny Officer** | `p.verma@aicte-india.org` | `Password@123` | Scrutiny Desk & Cadre Audit |
| **Institution Representative** | `admin@dronacharya-engg.ac.in` | `Password@123` | Dronacharya Institute (`APP-2026-00124`) |
| **Central Administrator** | `admin@aicte-india.org` | `AdminPassword@123` | Central Bureau / Member Secretary |
| **EVC Member** | `s.sen@iitr.ac.in` | `Password@123` | IIT Roorkee / Inspection Pool |

---

## 🗺️ Key Implemented Routes

| Route | Page | Purpose |
|---|---|---|
| `/` | **Landing Page** | Full-screen autonomous 3D approval pipeline, live telemetry ribbon, and login modal |
| `/login` | **Translucent Auth** | Split-screen portal login with jurisdictional zone selector and active case badge |
| `/dashboard` | **Operations Dashboard** | 5 statutory KPI cards, critical alert strip, and regional pendency filters |
| `/applications` | **Applications Registry** | Comprehensive dossier repository with stage milestone selectors and status tabs |
| `/applications/[id]` | **Case File & Dossier** | Full Stitch case file for `APP-2026-00124` with 48h grace notice & deficiency actions |
| `/workflow` | **Workflow Architecture** | Statutory routing pathways for New Institutions, EoA, Expansion, and Closure |
| `/evc` | **EVC Coordination** | Inspection rosters, 3-member panel compositions, and geofenced panel dispatch |
| `/compliance` | **Compliance Registry** | Land lease deeds, fire safety NOCs, cadre ratios, and FDR pledges with countdowns |
| `/workflow-intelligence` | **Dependency Simulator** | Interactive SVG dependency graph, bottleneck analysis, and What-If simulator |
| `/audit` | **Chained Audit Trail** | Cryptographically chained audit event log with SHA-256 seals and actor attribution |

---

<div align="center">
  <p><strong>PRAVAH &mdash; AICTE Approval Operations Platform</strong></p>
  <p>Preserving Statutory Integrity &bull; Accelerating Technical Education</p>
</div>
