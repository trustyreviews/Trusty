@echo off
REM Double-click to rebuild the web app and open a git commit prompt.
REM For publishing: after this finishes, run push-site.bat or push from Cursor.

cd /d "%~dp0"

echo Building web app into docs/app ...
call npm run build:web
if errorlevel 1 (
  echo Build failed.
  pause
  exit /b 1
)

echo.
echo Build done. Open Cursor and commit + push docs/app when you want it live on
echo https://www.trustydirect.com/app/
echo.
pause
