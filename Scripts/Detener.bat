@echo off
chcp 65001 > nul
title Code Audit AI - Detener
color 0C

cd /d "%~dp0"

echo.
echo  ======================================================
echo    Code Audit AI - Deteniendo el sistema
echo  ======================================================
echo.

cd ..
docker compose -f docker-compose\docker-compose.yml --project-directory . down
if errorlevel 1 (
    echo.
    echo  Ocurrio un error al detener los contenedores.
    echo  Tal vez Docker Desktop no esta corriendo.
    pause
    exit /b 1
)

echo.
echo  Sistema detenido correctamente.
echo  Los datos (usuarios + historial) quedan guardados.
echo.
echo  Para arrancar de nuevo, ejecuta Iniciar.bat.
echo.
pause
