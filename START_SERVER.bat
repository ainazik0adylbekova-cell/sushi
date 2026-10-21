@echo off
cd /d "c:\Users\user\Desktop\test sushi\sushi"
echo Stopping old servers...
taskkill /F /IM node.exe
timeout /t 2
echo Starting server...
npm run dev