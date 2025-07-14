@echo off
set NODEPATH=C:\Users\Justin.Liao\Downloads\nodejs-portable\node-v20.11.1-win-x64
set PATH=%NODEPATH%;%PATH%
if exist node_modules rd /s /q node_modules
if exist package-lock.json del package-lock.json
call "%NODEPATH%\npm.cmd" install
pause
