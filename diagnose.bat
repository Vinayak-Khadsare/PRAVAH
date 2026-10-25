@echo off
setlocal enabledelayedexpansion
title PRAVAH - System Environment Diagnostic Tool

echo =====================================================================
echo   PRAVAH - AICTE Operations Platform: System Diagnostic Check
echo =====================================================================
echo.

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

set "ALL_PASS=1"

:: 1. Check Python
echo [1/7] Checking Python Environment...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   [FAIL] Python is not installed or not in PATH.
    echo          Please install Python 3.11+ from https://www.python.org/
    set "ALL_PASS=0"
) else (
    for /f "tokens=2" %%v in ('python --version 2^>^&1') do set "PY_VER=%%v"
    echo   [PASS] Found Python !PY_VER!
)

:: 2. Check Node.js & npm
echo [2/7] Checking Node.js and npm...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   [FAIL] Node.js is not installed or not in PATH.
    echo          Please install Node.js 18 or 20 LTS from https://nodejs.org/
    set "ALL_PASS=0"
) else (
    for /f %%v in ('node --version') do set "NODE_VER=%%v"
    echo   [PASS] Found Node.js !NODE_VER!
)

call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   [FAIL] npm is not found in PATH.
    set "ALL_PASS=0"
) else (
    for /f %%v in ('call npm --version') do set "NPM_VER=%%v"
    echo   [PASS] Found npm !NPM_VER!
)

:: 3. Check Ports
echo [3/7] Checking Port Availability (8000 and 3000)...
netstat -ano | findstr ":8000 " >nul 2>&1
if %errorlevel% equ 0 (
    echo   [WARN] Port 8000 is currently in use!
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8000 "') do set "PID_8000=%%p"
    echo          Process PID holding port 8000: !PID_8000!
) else (
    echo   [PASS] Port 8000 is available for backend.
)

netstat -ano | findstr ":3000 " >nul 2>&1
if %errorlevel% equ 0 (
    echo   [WARN] Port 3000 is currently in use!
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000 "') do set "PID_3000=%%p"
    echo          Process PID holding port 3000: !PID_3000!
) else (
    echo   [PASS] Port 3000 is available for frontend.
)

:: 4. Check Database
echo [4/7] Checking MongoDB Service...
netstat -ano | findstr ":27017 " >nul 2>&1
if %errorlevel% equ 0 (
    echo   [PASS] Local MongoDB instance detected on port 27017.
) else (
    echo   [INFO] Local MongoDB is not running on port 27017.
    echo          PRAVAH will operate in zero-config In-Memory Demonstration Mode,
    echo          or connect to MongoDB Atlas if MONGODB_URI is specified in .env.
)

:: 5. Check Environment File
echo [5/7] Checking Configuration Files...
if exist ".env" (
    echo   [PASS] Root .env configuration file found.
) else (
    echo   [INFO] No .env found. Will automatically generate from .env.example on launch.
)

:: 6. Check Storage Directory
echo [6/7] Checking Writable Storage Directory...
if not exist "backend\uploads" (
    mkdir "backend\uploads" >nul 2>&1
)
echo test > "backend\uploads\.write_test" 2>nul
if exist "backend\uploads\.write_test" (
    del /f /q "backend\uploads\.write_test" >nul 2>&1
    echo   [PASS] Storage directory [backend\uploads] is writable.
) else (
    echo   [FAIL] Cannot write to backend\uploads! Check directory permissions.
    set "ALL_PASS=0"
)

:: 7. Check Dependencies
echo [7/7] Checking Installed Dependencies...
if exist "backend\.venv\Scripts\python.exe" (
    echo   [PASS] Python virtual environment exists [.venv].
) else (
    echo   [INFO] Python virtual environment not yet initialized [run.bat will create it].
)

if exist "frontend\node_modules" (
    echo   [PASS] Frontend node_modules directory exists.
) else (
    echo   [INFO] Frontend dependencies not yet installed [run.bat will run npm install].
)

echo.
echo =====================================================================
if "!ALL_PASS!"=="1" (
    echo   DIAGNOSTIC STATUS: ALL CRITICAL PREREQUISITES MET!
    echo   You can safely launch the platform by running: run.bat
) else (
    echo   DIAGNOSTIC STATUS: WARNINGS OR ISSUES DETECTED.
    echo   Please review the failures flagged with [FAIL] above.
)
echo =====================================================================
echo.
pause
