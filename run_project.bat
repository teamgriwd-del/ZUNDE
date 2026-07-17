@echo off
echo Starting PFUMA Project...

:: Start Frontend
start "PFUMA Frontend" /d "C:\Users\ARNOLD\Documents\GRIWD\PROJECTS\PFUMA" npm run dev

:: Start Expo App
start "PFUMA Expo" /d "C:\Users\ARNOLD\Documents\GRIWD\PROJECTS\PFUMA\app" npx expo start

:: Start Backend
start "PFUMA Backend" /d "C:\Users\ARNOLD\Documents\GRIWD\PROJECTS\PFUMA\backend" py app.py

echo All services are starting in separate windows.
pause