@echo off
echo ========================================
echo   Finik Pay Setup Checker
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Checking .env file...
if exist ".env" (
    echo     [OK] .env file exists
) else (
    echo     [ERROR] .env file not found!
    goto :error
)

echo.
echo [2/5] Checking Prisma client...
if exist "node_modules\.prisma\client" (
    echo     [OK] Prisma client is generated
) else (
    echo     [ERROR] Prisma client not found!
    echo     Running: npm run db:generate
    call npm run db:generate
    if errorlevel 1 goto :error
)

echo.
echo [3/5] Checking node_modules...
if exist "node_modules" (
    echo     [OK] node_modules exists
) else (
    echo     [ERROR] node_modules not found!
    echo     Running: npm install
    call npm install
    if errorlevel 1 goto :error
)

echo.
echo [4/5] Checking required packages...
if exist "node_modules\@mancho.devs\authorizer" (
    echo     [OK] @mancho.devs/authorizer installed
) else (
    echo     [ERROR] @mancho.devs/authorizer not found!
    goto :error
)

if exist "node_modules\@prisma\client" (
    echo     [OK] @prisma/client installed
) else (
    echo     [ERROR] @prisma/client not found!
    goto :error
)

echo.
echo [5/5] Checking Finik integration files...
if exist "lib\finik.ts" (
    echo     [OK] lib\finik.ts
) else (
    echo     [ERROR] lib\finik.ts not found!
    goto :error
)

if exist "app\api\finik\create-payment\route.ts" (
    echo     [OK] app\api\finik\create-payment\route.ts
) else (
    echo     [ERROR] create-payment route not found!
    goto :error
)

if exist "app\api\finik\webhook\route.ts" (
    echo     [OK] app\api\finik\webhook\route.ts
) else (
    echo     [ERROR] webhook route not found!
    goto :error
)

if exist "app\components\FinikPayButton.tsx" (
    echo     [OK] app\components\FinikPayButton.tsx
) else (
    echo     [ERROR] FinikPayButton component not found!
    goto :error
)

echo.
echo ========================================
echo   All checks passed! Ready to go! 
echo ========================================
echo.
echo Next steps:
echo   1. Run: npm run dev
echo   2. Open: http://localhost:3000
echo   3. Test payment flow
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo   Setup check FAILED!
echo ========================================
echo.
echo Please fix the errors above and try again.
echo.
pause
exit /b 1
