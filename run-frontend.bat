@echo off
title PRAVAH Frontend Web App
cd /d "%~dp0frontend"
echo ============================================================
echo   PRAVAH - AICTE Approval Platform Web Interface
echo   Web App URL: http://localhost:3000
echo ============================================================
call npm run dev
pause
