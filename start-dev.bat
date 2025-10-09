@echo off
echo Starting EduBot Development Environment...
echo.

echo Starting Server...
start "EduBot Server" cmd /k "cd server && npm run dev"

echo Waiting 3 seconds for server to start...
timeout /t 3 /nobreak > nul

echo Starting Client...
start "EduBot Client" cmd /k "cd client && npm run dev"

echo.
echo Development environment started!
echo Server: http://localhost:5000
echo Client: http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul 