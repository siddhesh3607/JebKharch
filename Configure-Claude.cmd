@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -Command "Invoke-Expression ([IO.File]::ReadAllText((Join-Path (Get-Location) 'scripts\configure-claude.ps1')))"
pause
