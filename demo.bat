@echo off
echo ========================================
echo    Q-AOP Demo Launcher
echo    Quantum-Assisted Arctic Operations
echo ========================================
echo.

echo Starting backend server...
start "Q-AOP Backend" cmd /k "cd backend && .venv\Scripts\activate && python -m uvicorn main:app --reload --port 8000"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting frontend...
start "Q-AOP Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Demo is starting up!
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Wait ~10 seconds then open your browser
echo ========================================
pause 