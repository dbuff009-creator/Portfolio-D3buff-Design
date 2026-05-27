@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Обновляю список работ...
echo.
call npm run works
echo.
echo  На GitHub: Commit + Push в GitHub Desktop
echo.
pause
