@echo off
title PRAVAH Backend Engine
cd /d "%~dp0"
echo ============================================================
echo   PRAVAH - AICTE Approval Platform Backend Engine
echo   API URL: http://127.0.0.1:8000
echo   Swagger Docs: http://127.0.0.1:8000/docs
echo ============================================================
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
pause
