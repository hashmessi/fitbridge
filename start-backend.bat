@echo off
echo ========================================
echo   FitBridge Backend Server
echo ========================================
echo.

cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt -q

echo.
echo Starting FastAPI server on http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.

cd app
uvicorn main:app --reload --port 8000
