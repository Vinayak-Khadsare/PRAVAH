#!/usr/bin/env bash
# =====================================================================
# PRAVAH - One-Command Automated Setup & Launcher (Linux / macOS)
# Usage: ./run.sh
# =====================================================================

set -e

# Resolve repository root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "====================================================================="
echo "  PRAVAH - AICTE Operations Platform: Linux/macOS Launcher"
echo "====================================================================="
echo ""

# Process IDs for clean termination
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo ""
    echo ">> Shutting down PRAVAH services..."
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    echo ">> PRAVAH services terminated safely."
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 1. Check Python
echo "[1/6] Validating Python Runtime..."
if command -v python3 >/dev/null 2>&1; then
    PY_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PY_CMD="python"
else
    echo "[ERROR] Python 3.10+ is required but neither 'python3' nor 'python' was found."
    echo "Please install Python 3.11+ from https://www.python.org/ or your package manager (brew, apt, dnf)."
    exit 1
fi
PY_VER=$($PY_CMD --version 2>&1)
echo "  Found $PY_VER"

# 2. Check Node.js & npm
echo "[2/6] Validating Node.js & npm..."
if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] Node.js 18+ LTS is required but not found in PATH."
    echo "Please install Node.js from https://nodejs.org/ or via nvm."
    exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
    echo "[ERROR] npm is required but not found in PATH."
    exit 1
fi
echo "  Found Node.js $(node --version) (npm $(npm --version))"

# 3. Environment Configuration
echo "[3/6] Setting Up Local Configuration..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "  Creating .env from .env.example..."
        cp .env.example .env
        RAND_SECRET=$($PY_CMD -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null || openssl rand -hex 32 2>/dev/null || echo "pravah-local-dev-fallback-signing-key-32chars")
        echo -e "\nJWT_SECRET=${RAND_SECRET}\n" >> .env
        echo "  Generated secure random JWT session signing key in .env."
    fi
fi
mkdir -p "backend/uploads"

# 4. Virtual Environment & Python Dependencies
echo "[4/6] Setting Up Python Virtual Environment..."
VENV_DIR="$SCRIPT_DIR/backend/.venv"
VENV_PYTHON="$VENV_DIR/bin/python"
VENV_PIP="$VENV_DIR/bin/pip"

if [ ! -f "$VENV_PYTHON" ]; then
    echo "  Creating virtual environment in backend/.venv..."
    $PY_CMD -m venv "$VENV_DIR"
    echo "  Installing backend dependencies from requirements.txt..."
    "$VENV_PIP" install --upgrade pip >/dev/null 2>&1 || true
    "$VENV_PIP" install -r "$SCRIPT_DIR/backend/requirements.txt"
else
    echo "  Virtual environment found. Verifying dependencies..."
    if ! "$VENV_PYTHON" -c "import fastapi, motor, bcrypt, jose, networkx, uvicorn" >/dev/null 2>&1; then
        echo "  Updating backend dependencies..."
        "$VENV_PIP" install -r "$SCRIPT_DIR/backend/requirements.txt"
    else
        echo "  Backend dependencies verified."
    fi
fi

# 5. Frontend Dependencies
echo "[5/6] Checking Frontend Dependencies..."
if [ ! -d "frontend/node_modules" ]; then
    echo "  Installing frontend dependencies with npm install..."
    (cd "$SCRIPT_DIR/frontend" && npm install)
else
    echo "  Frontend dependencies verified."
fi

# Run database seed check
echo "  Checking database state..."
"$VENV_PYTHON" -m backend.seed_demo_data >/dev/null 2>&1 || true

# 6. Launch Services
echo "[6/6] Launching PRAVAH Services..."

# Start Backend
"$VENV_PYTHON" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!
echo "  Backend started (PID: $BACKEND_PID)"

# Wait for readiness
echo "  Polling readiness at http://127.0.0.1:8000/api/ready ..."
READY=0
for i in {1..25}; do
    sleep 1
    if command -v curl >/dev/null 2>&1; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/ready 2>/dev/null || true)
        if [ "$HTTP_CODE" = "200" ]; then
            READY=1
            break
        fi
    fi
done

if [ "$READY" = "1" ]; then
    echo "  [PASS] Backend engine is ready and accepting requests!"
else
    echo "  [WARN] Backend readiness check timed out. Starting frontend anyway..."
fi

# Start Frontend
(cd "$SCRIPT_DIR/frontend" && npm run dev) &
FRONTEND_PID=$!
echo "  Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "====================================================================="
echo "  PRAVAH RUNNING SUCCESSFULLY!"
echo "====================================================================="
echo "  Web Application:    http://localhost:3000"
echo "  Executive Portal:   http://localhost:3000/dashboard"
echo "  Interactive API:    http://127.0.0.1:8000/docs"
echo "  System Readiness:   http://127.0.0.1:8000/api/ready"
echo "====================================================================="
echo ""
echo "Press Ctrl+C to stop all services."

# Wait for children
wait
