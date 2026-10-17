@echo off
echo ========================================
echo   Инициализация ролей в БД
echo ========================================
echo.

cd /d "%~dp0"

echo Установка tsx (если нужно)...
call npm install -D tsx

echo.
echo Создание ролей...
call npx tsx scripts/init-roles.ts

echo.
echo ========================================
echo   Готово!
echo ========================================
pause
