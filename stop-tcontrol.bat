@echo off
title Stopping TControl...
color 0C
cls
echo ==============================================================================
echo    Stopping TControl Services...
echo ==============================================================================
echo.
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000,8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }; Write-Host '[OK] Ports 3000 and 8000 released.'"
echo.
echo TControl has been stopped cleanly.
ping 127.0.0.1 -n 3 >nul
