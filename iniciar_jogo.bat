@echo off
title Servidor Newcard
cd /d "%~dp0"
set PATH=%~dp0node_portable\node-v22.22.3-win-x64;%PATH%
echo ========================================================
echo  Iniciando Newcard (Servidor de Desenvolvimento)
echo ========================================================
echo  Acesse no navegador: http://localhost:3000
echo ========================================================
call npm run dev
pause
