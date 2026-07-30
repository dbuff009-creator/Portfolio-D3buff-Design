@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Updating works ===
echo.
node scripts/index-works.mjs
if errorlevel 1 (
  echo.
  echo  ERROR: update failed
  echo.
  pause
  exit /b 1
)
echo.
echo  OK - data/works.json + js/works-data.js updated
echo  Next: Commit + Push in GitHub Desktop
echo.
pause
