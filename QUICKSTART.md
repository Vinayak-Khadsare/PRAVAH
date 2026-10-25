# PRAVAH — 30-Second Quick Start Guide

Get PRAVAH up and running on a clean computer with a single command.

---

## 📋 Prerequisites Check

Make sure you have installed on your computer:
- **Python 3.10+** (Recommended: Python 3.11 / 3.12 / 3.13) &mdash; [python.org](https://www.python.org/downloads/) *(On Windows, check "Add Python to PATH")*
- **Node.js 18+ LTS** (Recommended: Node.js 20 LTS) &mdash; [nodejs.org](https://nodejs.org/)

---

## 🚀 1. The One-Command Launch (Recommended)

### On Windows
Open PowerShell or Command Prompt in the repository folder:
```cmd
run.bat
```
*(Or in PowerShell: `.\run.ps1`)*

### On Linux / macOS
Open Terminal in the repository folder:
```bash
chmod +x run.sh diagnose.sh
./run.sh
```

---

## 🐳 2. Or Launch with Docker Compose

If you have Docker and Docker Compose installed:
```bash
docker compose up --build
```
To stop the Docker container cluster:
```bash
docker compose down
```

---

## 🌐 3. Access the Application

Once startup completes:

| Component | URL | Notes |
|---|---|---|
| **Web Application** | [http://localhost:3000](http://localhost:3000) | Landing Page & 3D Approval Pipeline |
| **Operations Dashboard** | [http://localhost:3000/dashboard](http://localhost:3000/dashboard) | 5 Statutory KPI Cards & Case Registry |
| **Case File Dossier** | [http://localhost:3000/applications/APP-2026-00124](http://localhost:3000/applications/APP-2026-00124) | Active Dronacharya Institute Case File |
| **Interactive API Docs** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Swagger OpenAPI Test Console |
| **Readiness Health** | [http://127.0.0.1:8000/api/ready](http://127.0.0.1:8000/api/ready) | System & Database Health Probe |

---

## 🔑 4. Pre-Seeded Test Credentials

| Role | Email | Password | Scope |
|---|---|---|---|
| **Regional Officer (RO)** | `r.srivastava@aicte-india.org` | `Password@123` | Northern Regional Office (NRO) |
| **Senior Scrutiny Officer** | `p.verma@aicte-india.org` | `Password@123` | Scrutiny Desk & Cadre Audit |
| **Institution Representative** | `admin@dronacharya-engg.ac.in` | `Password@123` | Dronacharya Institute (`APP-2026-00124`) |
| **Central AICTE Administrator** | `admin@aicte-india.org` | `AdminPassword@123` | Central Bureau / Member Secretary |
| **EVC Member** | `s.sen@iitr.ac.in` | `Password@123` | IIT Roorkee / Inspection Pool |

---

## 🔍 5. Troubleshooting & Diagnostics

If something isn't working as expected, run the built-in system diagnostic tool:

- **Windows**: `diagnose.bat`
- **Linux / macOS**: `./diagnose.sh`

It checks your Python version, Node.js version, port availability (8000 and 3000), directory write permissions, and MongoDB state.
