@echo off
cd /d "%~dp0"
if not exist node_modules call npm.cmd install
if errorlevel 1 goto done
call npm.cmd run setup:ai
if errorlevel 1 goto done
call npm.cmd start
:done
pause
