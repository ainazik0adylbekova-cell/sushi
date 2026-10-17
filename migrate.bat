@echo off
echo ========================================
echo   СОЗДАНИЕ ТАБЛИЦ В БАЗЕ ДАННЫХ
echo ========================================
echo.
echo Это может занять несколько минут...
echo.
npx prisma db push --skip-generate
echo.
echo ========================================
echo.
echo Генерация Prisma Client...
echo.
npx prisma generate
echo.
echo ========================================
echo.
echo ГОТОВО!
echo.
pause
