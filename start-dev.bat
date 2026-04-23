@echo off
echo Starting EduBot Development Environment...
echo.

echo Starting Flask Backend (app.py on port 6000)...
start "EduBot Flask" cmd /k "cd server && python app.py"

echo Waiting 2 seconds...
timeout /t 2 /nobreak > nul

echo Starting FastAPI Backend (main.py on port 8000)...
start "EduBot FastAPI" cmd /k "cd server && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo Waiting 2 seconds...
timeout /t 2 /nobreak > nul

echo Starting Node Server...
start "EduBot Server" cmd /k "cd server && npm run dev"

echo Waiting 3 seconds for server to start...
timeout /t 3 /nobreak > nul

echo Starting Client...
start "EduBot Client" cmd /k "cd client && npm run dev"

echo.
echo Development environment started!
echo Flask:   http://localhost:6000
echo FastAPI: http://localhost:8000
echo Server:  http://localhost:5000
echo Client:  http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul