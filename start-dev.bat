@echo off
echo ========================================
echo   FitBridge - Full Stack Development
echo ========================================
echo.

REM Start backend in new window
start "FitBridge Backend" cmd /k "cd /d %~dp0 && start-backend.bat"

REM Wait for backend to initialize
timeout /t 3 /nobreak > nul

REM Start frontend
echo Starting frontend on http://localhost:3000
echo.
npm run dev
