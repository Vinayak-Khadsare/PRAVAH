# PRAVAH — AICTE Approval Operations Platform

A unified, institutional web platform for technical education approval management, statutory workflow enforcement, Expert Visit Committee (EVC) coordination, institutional compliance monitoring, and pendency intelligence.

Built strictly according to the **Google Stitch Design System** exported for PRAVAH.

---

## 1. Visual Identity & Design Fidelity (Google Stitch)

The application strictly preserves every element of the Google Stitch visual export:
- **Color Palette**:
  - Forest Green: `#234B3C` (Deep Forest: `#0F3826`, Dark: `#18372D`, Light: `#E8F0EB`)
  - Copper & Amber: `#B8734E` (Light: `#D6926F`, Background: `#FBF3ED`, Warning: `#B7791F`)
  - Warm Ivory & Sage: `#F7F4EC` (Dark Ivory: `#EDE7D8`, Subtle: `#F2EFE7`, Sage: `#E8EDE6`)
  - Charcoal & Borders: `#1E2621`, Border: `#DCDDD4`, Border Strong: `#C5C7BC`
  - Alert Red: `#B84040` (Background: `#FDF2F2`)
  - Success Green: `#397553`
- **Typography**: `IBM Plex Sans` (institutional body and headings), `IBM Plex Mono` (identifiers, dates, codes, SHA-256 seals), and Google Material Symbols Outlined.
- **Interactive 3D WebGL Canvas**:
  - Re-implemented with Three.js directly in React (`ThreeHeroScene.tsx`).
  - Layered application dossier binder with paper sheets stack, glass seal overlay, copper header tag, and seal badge.
  - 5 Orbit nodes: *Submission*, *Scrutiny*, *EVC Visit*, *SAC Hearing*, *Authorized LoA*.
  - Connecting dependency pipeline line.
  - Inspection calendar card with copper pin.
  - Mouse parallax interaction and floating ambient animation.
- **Glassmorphism**: Translucent backdrop-filtered surfaces (`glass-surface`, `glass-surface-dark`) with fallback border styling.
- **Preserved Stitch Exports**: The raw Stitch HTML exports are permanently archived in [`stitch-export/`](./stitch-export/).

---

## 2. Implemented Route Matrix

| Route | Page Name | Primary Features |
|---|---|---|
| `/` | **Landing Page** | Three.js interactive 3D hero dossier, 5-stage progression strip, 4 core capabilities, 3 statutory questions, institutional footer, translucent glass login modal |
| `/login` | **Translucent Glass Login** | Split-screen portal authentication, atmospheric left pane with active case card (`APP-2026-00124`), zonal jurisdiction selector, SHA-256 checks |
| `/dashboard` | **Executive Operations Dashboard** | 5 statutory KPI cards (1,428 Apps, 15d Ceiling, 4 Overdue, 64 EVC, 94.2% Compliance), critical attention alert strip, active cases table, regional filter |
| `/applications` | **Applications Registry** | Comprehensive dossier repository with search, multi-zone filters, stage milestone selector, and status tabs |
| `/applications/[id]` | **Case File & Dossier** | Full Stitch implementation for `APP-2026-00124` (*Dronacharya Institute*): SLA runway gauge (+24h overdue), 6-stage lifecycle stepper, 3-question blocker panel, tabbed dossier, audit trail, review directorate |
| `/workflow` | **Approval Workflow Architecture** | Statutory routing pathways for New Institutions, EoA, Intake Expansion, and Progressive Closure under APH 2026 regulations |
| `/evc` | **EVC Scheduling & Coordination** | Inspection rosters, 3-member panel compositions, geofenced biometric verification status, panel dispatch modal |
| `/compliance` | **Institutional Compliance & Undertakings** | Surveillance of 30-year land lease deeds, fire safety NOCs, cadre ratios, and mandatory FDR pledges with validity expiration countdowns |
| `/documents` | **Document Registry** | Central evidence archive with SHA-256 integrity hash verification and in-line PDF document inspection |
| `/alerts` | **Alerts & Escalations Engine** | Automated regulatory flags for SLA breaches, deficiency timeouts, and prerequisite stalls with acknowledge / resolution actions |
| `/workflow-intelligence` | **Dependency Analysis & Simulator** | Interactive SVG stage dependency graph, cascade bottleneck analysis, and real-time What-If scenario simulation |
| `/reports` | **Regional & Stage-Wise Reporting** | Zonal turnaround statistics, Parliamentary approval summaries, and CSV/PDF export capability |
| `/audit` | **Chronological Audit Trail** | Cryptographically chained audit event log with SHA-256 seals, actor attribution, and timeline filters |
| `/settings` | **Configurable Workflow Rules** | Statutory 15-day ceiling adjustments, Form-B cure windows, grace notice hours, and geofencing radius parameters |

---

## 3. Regulatory Safeguards & 3 Statutory Questions

Every screen in PRAVAH directly answers the 3 statutory inquiries:
1. **What is pending?** — Identifies missing affidavits, deficient land titles, biometric faculty gaps, or unsubmitted FDRs down to specific folio numbers.
2. **Why is it blocked?** — Provides precise regulatory references (e.g. *AICTE APH Rule 2.4.1*), timestamped observations, and cure window statuses.
3. **What action happens next?** — Role-aware interventions:
   - *Grant 48-Hour Grace Notice*: Delegated prerogative invoked without triggering national grievance flags.
   - *Issue Deficiency Form-B*: Digital notice with SMS alerts and 7-day cure window.
   - *Escalate to SAC Hearing*: Transfers case to Standing Appeals Committee in New Delhi.
   - *Recommend for EVC*: Unlocks 3-member inspection pool assignment.
   - *Accept Rectification*: Clears critical blocker and restores SLA compliance.

---

## 4. Architecture & Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Three.js, Lucide React, Google Material Symbols.
- **Backend**: Python 3.11, FastAPI, Uvicorn, Pydantic v2.
- **Database**:
  - **MongoDB Atlas** integration via `motor.motor_asyncio`.
  - **Persistent Demonstration Mode**: If MongoDB Atlas URI is not set in `.env`, the backend seamlessly operates using an in-memory dataset seeded with realistic AICTE approval records.
- **Security**:
  - Connection strings kept strictly in backend environment variables.
  - Zero secrets exposed to frontend bundles.
  - Role-based authorization: *Member Secretary (RO Auth)*, *Senior Scrutiny Officer*, *Town Planning Officer*, *EVC Convener*, *Institution Admin*.

---

## 5. Startup Commands (Windows / PowerShell)

### Prerequisites
- Node.js v18+ (tested on v24.16.0)
- Python 3.10+ (tested on 3.11.9)

### Step 1: Backend Setup
```powershell
# In project root: D:\WORK & CODING\PRAVAH
cd "d:\WORK & CODING\PRAVAH"

# Optional: configure MongoDB Atlas in backend/.env
# Copy backend/.env.example to backend/.env and paste your connection string:
# Copy-Item backend/.env.example backend/.env

# Run FastAPI backend with Uvicorn
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Backend will be live at: `http://127.0.0.1:8000` (Health check: `http://127.0.0.1:8000/api/health`, Swagger docs: `http://127.0.0.1:8000/docs`).

### Step 2: Frontend Setup
```powershell
# In another terminal window:
cd "d:\WORK & CODING\PRAVAH\frontend"

# Run development server
node node_modules/next/dist/bin/next dev -p 3000

# Or run optimized production build:
# node node_modules/next/dist/bin/next start -p 3000
```
Frontend will be live at: `http://localhost:3000`.

---

## 6. Verification Summary

- **Static Generation & Type Check**: All 16 routes compiled and validated without error (`npm run build` exit code 0).
- **Backend Import & Health**: Verified `backend.main:app` startup with graceful MongoDB Atlas fallback.
- **Browser Automation Verification**: Validated interactive 3D hero scene, glass login modal, executive dashboard, case detail dossier `APP-2026-00124`, 48-hour grace notice execution, and workflow dependency what-if simulation.
