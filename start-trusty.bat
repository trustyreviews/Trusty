@echo off
REM Double-click to start Trusty (Expo + Draft with AI).
REM Close the window when you're done.

cd /d "%~dp0"

if not exist "node_modules\" (
  echo Installing dependencies first...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

if not exist ".env" (
  echo.
  echo Missing .env — copy .env.example to .env and add your GEMINI_API_KEY.
  echo.
  pause
  exit /b 1
)

echo Starting Trusty...
echo Press w for web, or scan the QR with Expo Go.
echo.

call npm start
