#!/usr/bin/env bash
# =====================================================================
# PRAVAH - System Environment Diagnostic Check (Linux / macOS)
# Usage: ./diagnose.sh
# =====================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "====================================================================="
echo "  PRAVAH - AICTE Operations Platform: Diagnostic Check"
echo "====================================================================="
echo ""

ALL_PASS=1

# 1. Python Check
echo "[1/7] Checking Python..."
if command -v python3 >/dev/null 2>&1; then
    PY_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PY_CMD="python"
else
    echo "  [FAIL] Python 3 is not installed or not in PATH."
    ALL_PASS=0
fi

if [ -n "$PY_CMD" ]; then
    echo "  [PASS] Found $($PY_CMD --version 2>&1)"
fi

# 2. Node.js & npm Check
echo "[2/7] Checking Node.js and npm..."
if command -v node >/dev/null 2>&1; then
    echo "  [PASS] Found Node.js $(node --version)"
else
    echo "  [FAIL] Node.js is not installed."
    ALL_PASS=0
fi

if command -v npm >/dev/null 2>&1; then
    echo "  [PASS] Found npm $(npm --version)"
else
    echo "  [FAIL] npm is not installed."
    ALL_PASS=0
fi

# 3. Port Check
echo "[3/7] Checking Port Availability (8000 & 3000)..."
if command -v lsof >/dev/null 2>&1; then
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "  [WARN] Port 8000 is currently occupied."
    else
        echo "  [PASS] Port 8000 is available."
    fi
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "  [WARN] Port 3000 is currently occupied."
    else
        echo "  [PASS] Port 3000 is available."
    fi
else
    echo "  [INFO] 'lsof' not found; skipping port pre-check."
fi

# 4. Database Check
echo "[4/7] Checking MongoDB Service..."
if command -v nc >/dev/null 2>&1; then
    if nc -z 127.0.0.1 27017 2>/dev/null; then
        echo "  [PASS] Local MongoDB active on port 27017."
    else
        echo "  [INFO] Local MongoDB not detected on port 27017."
        echo "         PRAVAH will operate in zero-config In-Memory Demonstration Mode."
    fi
else
    echo "  [INFO] 'nc' not available; skipping socket check."
fi

# 5. Environment Config
echo "[5/7] Checking Environment Configuration..."
if [ -f ".env" ]; then
    echo "  [PASS] .env file exists."
else
    echo "  [INFO] .env not found. run.sh will generate it from .env.example."
fi

# 6. Upload Directory
echo "[6/7] Checking Storage Directory..."
mkdir -p "backend/uploads"
if touch "backend/uploads/.write_test" 2>/dev/null; then
    rm -f "backend/uploads/.write_test"
    echo "  [PASS] backend/uploads is writable."
else
    echo "  [FAIL] Cannot write to backend/uploads!"
    ALL_PASS=0
fi

# 7. Virtual Environment & Node Modules
echo "[7/7] Checking Installed Dependencies..."
if [ -f "backend/.venv/bin/python" ]; then
    echo "  [PASS] Python virtualenv exists."
else
    echo "  [INFO] Python virtualenv will be created on first run."
fi

if [ -d "frontend/node_modules" ]; then
    echo "  [PASS] Frontend node_modules directory exists."
else
    echo "  [INFO] Frontend node_modules will be installed on first run."
fi

echo ""
echo "====================================================================="
if [ "$ALL_PASS" = "1" ]; then
    echo "  DIAGNOSTIC STATUS: READY TO LAUNCH!"
    echo "  Execute: ./run.sh"
else
    echo "  DIAGNOSTIC STATUS: ISSUES DETECTED. Review [FAIL] items above."
fi
echo "====================================================================="
