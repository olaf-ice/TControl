@echo off
title TControl - AI Traffic Enforcement and Intelligence Platform
color 0A
cls
echo ==============================================================================
echo    TControl - AI Traffic Enforcement and Intelligence Platform
echo ==============================================================================
echo.
echo [*] Starting TControl Web Server and Command Center (Port 3000)...
start "TControl Web Server" /min cmd /c "cd /d "%~dp0" && node server.js"

echo [*] Starting Python Computer Vision Microservice (Port 8000)...
if exist "%USERPROFILE%\.local\bin\uv.exe" (
    start "TControl AI Vision Worker" /min cmd /c "cd /d "%~dp0ai-service" && "%USERPROFILE%\.local\bin\uv.exe" run python main.py"
) else (
    start "TControl AI Vision Worker" /min cmd /c "cd /d "%~dp0ai-service" && python main.py"
)

echo [*] Launching TControl Desktop Application Window...
ping 127.0.0.1 -n 3 >nul

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000 --window-size=1600,920
) else if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000 --window-size=1600,920
) else (
    start http://localhost:3000
)

echo.
echo ==============================================================================
echo  [SUCCESS] TControl is running on your PC!
echo.
echo    - Dashboard and Citizen Portal: http://localhost:3000
echo    - AI Vision Worker:             http://localhost:8000
echo    - API Documentation:            http://localhost:8000/docs
echo.
echo  You can minimize this window.
echo  To shut down TControl, run stop-tcontrol.bat or close the minimized windows.
echo ==============================================================================
pause

