@echo off
title PRAVAH Full-Stack Launcher
cd /d "%~dp0"
echo ============================================================
echo   Launching PRAVAH (AICTE Approval Platform)
echo   1. Starting Backend on http://127.0.0.1:8000
echo   2. Starting Frontend on http://localhost:3000
echo ============================================================
start "PRAVAH Backend Engine" cmd /c "%~dp0run-backend.bat"
start "PRAVAH Frontend Web App" cmd /c "%~dp0run-frontend.bat"
echo Services launched in separate windows!
echo Once ready, access the dashboard at: http://localhost:3000
timeout /t 5
