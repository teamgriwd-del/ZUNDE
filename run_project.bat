@echo off
echo Starting ZUNDE Project...

:: Start Frontend
start "ZUNDE Frontend" /d "C:\Users\ARNOLD\Documents\GRIWD\PROJECTS\ZUNDE" npm run dev

:: Start Expo App
start "ZUNDE Expo" /d "C:\Users\ARNOLD\Documents\GRIWD\PROJECTS\ZUNDE\app" npx expo start

:: Start Backend
start "ZUNDE Backend" /d "C:\Users\ARNOLD\Documents\GRIWD\PROJECTS\ZUNDE\backend" py app.py

echo All services are starting in separate windows.
pause