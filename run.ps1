# PRAVAH - One-Command Automated Setup & Launcher (PowerShell)
# Usage: .\run.ps1

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "=====================================================================" -ForegroundColor Green
Write-Host "  PRAVAH - AICTE Operations Platform: PowerShell Launcher" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host ""

# 1. Check Python
Write-Host "[1/6] Validating Python Runtime..." -ForegroundColor Cyan
try {
    $pythonVer = & python --version 2>&1
    Write-Host "  Found $pythonVer" -ForegroundColor Gray
} catch {
    Write-Host "  [ERROR] Python 3.10+ is required but not installed or not in PATH." -ForegroundColor Red
    Write-Host "  Install Python from https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

# 2. Check Node.js
Write-Host "[2/6] Validating Node.js & npm..." -ForegroundColor Cyan
try {
    $nodeVer = & node --version 2>&1
    $npmVer = & npm --version 2>&1
    Write-Host "  Found Node.js $nodeVer (npm $npmVer)" -ForegroundColor Gray
} catch {
    Write-Host "  [ERROR] Node.js 18+ is required but not installed or not in PATH." -ForegroundColor Red
    Write-Host "  Install Node.js LTS from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 3. Environment Config
Write-Host "[3/6] Setting Up Configuration..." -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        $secret = [System.Guid]::NewGuid().ToString("N") + [System.Guid]::NewGuid().ToString("N")
        Add-Content -Path ".env" -Value "`nJWT_SECRET=$secret`n"
        Write-Host "  Generated local .env with secure random JWT secret." -ForegroundColor Gray
    }
}
if (-not (Test-Path "backend\uploads")) {
    New-Item -ItemType Directory -Path "backend\uploads" -Force | Out-Null
}

# 4. Virtual Environment & Python Dependencies
Write-Host "[4/6] Setting Up Python Virtual Environment..." -ForegroundColor Cyan
$venvDir = Join-Path $ScriptDir "backend\.venv"
$venvPython = Join-Path $venvDir "Scripts\python.exe"
$venvPip = Join-Path $venvDir "Scripts\pip.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "  Creating venv in backend\.venv..." -ForegroundColor Gray
    & python -m venv $venvDir
    Write-Host "  Installing backend dependencies from requirements.txt..." -ForegroundColor Gray
    & $venvPip install --upgrade pip | Out-Null
    & $venvPip install -r "backend\requirements.txt"
} else {
    Write-Host "  Verifying backend dependencies..." -ForegroundColor Gray
    $testImport = & $venvPython -c "import fastapi, motor, bcrypt, jose, networkx, uvicorn" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Updating backend dependencies..." -ForegroundColor Gray
        & $venvPip install -r "backend\requirements.txt"
    } else {
        Write-Host "  Backend dependencies verified." -ForegroundColor Gray
    }
}

# 5. Frontend Dependencies
Write-Host "[5/6] Checking Frontend Dependencies..." -ForegroundColor Cyan
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "  Installing frontend dependencies with npm install..." -ForegroundColor Gray
    Set-Location "$ScriptDir\frontend"
    & npm install
    Set-Location $ScriptDir
} else {
    Write-Host "  Frontend dependencies verified." -ForegroundColor Gray
}

# Run database seed check
Write-Host "  Verifying database state..." -ForegroundColor Gray
& $venvPython -m backend.seed_demo_data | Out-Null

# 6. Launch Processes
Write-Host "[6/6] Launching PRAVAH Services..." -ForegroundColor Cyan

# Start backend job
$backendJob = Start-Process -FilePath $venvPython -ArgumentList "-m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload" -WorkingDirectory $ScriptDir -PassThru

# Wait for readiness
Write-Host "  Polling readiness at http://127.0.0.1:8000/api/ready ..." -ForegroundColor Gray
$ready = $false
for ($i = 0; $i -lt 25; $i++) {
    Start-Sleep -Seconds 1
    try {
        $resp = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/ready" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($resp.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch {}
}

if ($ready) {
    Write-Host "  [PASS] Backend engine is ready and operational!" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Backend readiness check timed out. Starting frontend anyway..." -ForegroundColor Yellow
}

# Start frontend
$frontendJob = Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory "$ScriptDir\frontend" -PassThru

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host "  PRAVAH RUNNING SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host "  Web Application:    http://localhost:3000" -ForegroundColor White
Write-Host "  Executive Portal:   http://localhost:3000/dashboard" -ForegroundColor White
Write-Host "  Swagger Docs:       http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "  Readiness Health:   http://127.0.0.1:8000/api/ready" -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to terminate services..." -ForegroundColor Cyan

try {
    # Keep script open and monitor children
    while ($true) {
        Start-Sleep -Seconds 2
        if ($backendJob.HasExited -or $frontendJob.HasExited) {
            break
        }
    }
} finally {
    Write-Host "`nStopping PRAVAH services..." -ForegroundColor Yellow
    if ($backendJob -and -not $backendJob.HasExited) { Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue }
    if ($frontendJob -and -not $frontendJob.HasExited) { Stop-Process -Id $frontendJob.Id -Force -ErrorAction SilentlyContinue }
    Write-Host "PRAVAH stopped." -ForegroundColor Gray
}
