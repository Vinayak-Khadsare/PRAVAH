@echo off
setlocal enabledelayedexpansion
title PRAVAH - Unified Platform Launcher

echo =====================================================================
echo   PRAVAH - AICTE Approval Operations Platform
echo   Automated Cross-Computer Setup and Launcher
echo =====================================================================
echo.

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

:: 1. Verify Python
echo [1/6] Validating Python Runtime...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python 3.10+ is required but not found in PATH.
    echo Please install Python 3.11+ from https://www.python.org/downloads/
    echo Be sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)
for /f "tokens=2" %%v in ('python --version 2^>^&1') do echo   Using Python %%v

:: 2. Verify Node.js & npm
echo [2/6] Validating Node.js Runtime...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js 18+ LTS is required but not found in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f %%v in ('node --version') do echo   Using Node.js %%v

:: 3. Setup Local Environment Configuration (.env)
echo [3/6] Checking Local Configuration...
if not exist ".env" (
    if exist ".env.example" (
        echo   Creating .env from .env.example template...
        copy /y ".env.example" ".env" >nul
        echo   Created .env configuration file.
    )
)
if not exist "backend\uploads" (
    mkdir "backend\uploads" >nul 2>&1
)

:: 4. Virtual Environment & Python Dependencies
echo [4/6] Setting Up Python Virtual Environment...
set "VENV_DIR=%SCRIPT_DIR%backend\.venv"
set "VENV_PYTHON=%VENV_DIR%\Scripts\python.exe"
set "VENV_PIP=%VENV_DIR%\Scripts\pip.exe"

if not exist "%VENV_PYTHON%" (
    echo   Creating virtual environment in backend\.venv...
    python -m venv "%VENV_DIR%"
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create Python virtual environment.
        pause
        exit /b 1
    )
    echo   Installing required backend dependencies [first-time setup]...
    "%VENV_PIP%" install --upgrade pip >nul 2>&1
    "%VENV_PIP%" install -r backend\requirements.txt
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install backend dependencies.
        pause
        exit /b 1
    )
) else (
    echo   Virtual environment active. Checking dependency integrity...
    "%VENV_PYTHON%" -c "import fastapi, motor, bcrypt, jose, networkx, uvicorn" >nul 2>&1
    if %errorlevel% neq 0 (
        echo   Updating backend dependencies...
        "%VENV_PIP%" install -r backend\requirements.txt
    ) else (
        echo   Backend dependencies verified.
    )
)

:: 5. Frontend Dependencies
echo [5/6] Checking Frontend Dependencies...
if not exist "frontend\node_modules" (
    echo   Installing frontend npm dependencies [first-time setup]...
    cd frontend
    call npm install
    cd "%SCRIPT_DIR%"
) else (
    echo   Frontend dependencies verified.
)

:: Run database initial idempotent seed check
echo   Checking database state...
"%VENV_PYTHON%" -m backend.seed_demo_data >nul 2>&1

:: 6. Launch Services with Readiness Check
echo [6/6] Launching PRAVAH Services...
echo.

:: Start Backend in dedicated window
start "PRAVAH Backend Engine (Port 8000)" "%SCRIPT_DIR%run-backend.bat"

:: Wait for Backend Readiness (up to 25 seconds)
echo   Waiting for backend readiness probe at http://127.0.0.1:8000/api/ready ...
set /a RETRIES=0
:WAIT_BACKEND
timeout /t 1 /nobreak >nul
set /a RETRIES+=1
powershell -Command "(Invoke-WebRequest -Uri 'http://127.0.0.1:8000/api/ready' -UseBasicParsing -TimeoutSec 2).StatusCode" 2>nul | findstr "200" >nul 2>&1
if %errorlevel% equ 0 (
    echo   [PASS] Backend engine is ready and accepting requests!
    goto LAUNCH_FRONTEND
)
if %RETRIES% geq 25 (
    echo   [WARN] Backend readiness check timed out. Launching frontend anyway...
    goto LAUNCH_FRONTEND
)
goto WAIT_BACKEND

:LAUNCH_FRONTEND
:: Start Frontend in dedicated window
start "PRAVAH Web Application (Port 3000)" "%SCRIPT_DIR%run-frontend.bat"

echo.
echo =====================================================================
echo   PRAVAH PLATFORM RUNNING SUCCESSFULLY!
echo =====================================================================
echo   Web Application:    http://localhost:3000
echo   Executive Portal:   http://localhost:3000/dashboard
echo   Interactive API:    http://127.0.0.1:8000/docs
echo   System Readiness:   http://127.0.0.1:8000/api/ready
echo =====================================================================
echo.
echo   To stop PRAVAH: Close the opened Backend and Frontend command windows.
echo.
pause
