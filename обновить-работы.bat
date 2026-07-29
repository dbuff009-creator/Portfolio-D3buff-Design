@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Updating works ===
echo.
call npm run works
if errorlevel 1 (
  echo.
  echo  ERROR: npm run works failed
  echo.
  pause
  exit /b 1
)
echo.
echo  OK - works.json + works-data.js updated
echo  Next: Commit + Push in GitHub Desktop
echo.
pause
