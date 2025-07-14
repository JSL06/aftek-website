@echo off
set NODEPATH=C:\Users\Justin.Liao\Downloads\nodejs-portable\node-v20.11.1-win-x64
set PATH=%NODEPATH%;%PATH%
call "%NODEPATH%\npm.cmd" run dev
pause
