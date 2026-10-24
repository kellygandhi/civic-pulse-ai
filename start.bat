@echo off
echo ===================================================================
echo               CIVICPULSE AI - STARTUP LAUNCHER
echo   Autonomous Civic Grievance & Municipal Resolution Agent System
echo ===================================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting CivicPulse Unified Full-Stack Platform on port 8000...
start "CivicPulse AI Server" cmd /k "cd backend && python run_backend.py"

echo [2/2] Starting Vite Frontend Hot-Reload Dev Server on port 5173...
start "CivicPulse AI Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Application starting! Opening unified platform in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:8000

echo.
echo ===================================================================
echo Unified Production Platform: http://localhost:8000
echo Frontend Dev Server (Hot):  http://localhost:5173
echo Backend API Docs (Swagger): http://localhost:8000/docs
echo ===================================================================
echo.
pause
