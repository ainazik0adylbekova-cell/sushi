@echo off
cd /d "c:\Users\user\Desktop\test sushi\sushi"
echo Opening Prisma Studio...
echo.
echo Prisma Studio will open in your browser at http://localhost:5555
echo.
echo Instructions:
echo 1. Click on 'Role' table
echo 2. Click 'Add record'
echo 3. Fill in: name = ????????????, description = ??????? ????????????
echo 4. Click 'Save 1 change'
echo.
call npm run db:studio
