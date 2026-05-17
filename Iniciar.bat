@echo off
setlocal EnableDelayedExpansion
chcp 65001 > nul
title Code Audit AI - Iniciador
color 0B

REM Cambia el directorio de trabajo al de este script (por si se ejecuta
REM con doble click desde otra ubicacion).
cd /d "%~dp0"

REM Crea/actualiza Iniciar.lnk con code.ico (Windows no admite icono en .bat).
if exist "%~dp0code.ico" if exist "%~dp0scripts\aplicar-iconos.ps1" (
  powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0scripts\aplicar-iconos.ps1" -Quiet 2>nul
)

echo.
echo  ======================================================
echo    Code Audit AI - Iniciando el sistema
echo  ======================================================
echo.

REM ---------------------------------------------------------------
REM  Paso 1: chequear que Docker Desktop este corriendo.
REM ---------------------------------------------------------------
echo  [1/4] Verificando Docker Desktop...
docker info >nul 2>&1
if errorlevel 1 (
    echo.
    echo  ERROR: Docker Desktop no esta corriendo.
    echo.
    echo  Abri Docker Desktop, espera a que diga "Engine running"
    echo  y volve a ejecutar este archivo.
    echo.
    pause
    exit /b 1
)
echo        OK: Docker Desktop esta corriendo.

REM ---------------------------------------------------------------
REM  Paso 2: levantar el stack con docker compose.
REM ---------------------------------------------------------------
echo.
echo  [2/4] Levantando los contenedores (esto puede tardar varios minutos
echo        la primera vez, sobre todo descargando el modelo de IA)...
echo.
docker compose up -d --build
if errorlevel 1 (
    echo.
    echo  ERROR al construir o levantar los contenedores.
    echo  Revisa el mensaje de arriba para detalles.
    echo.
    pause
    exit /b 1
)

REM ---------------------------------------------------------------
REM  Paso 3: esperar a que el backend Java responda en /test.
REM ---------------------------------------------------------------
echo.
echo  [3/4] Esperando al backend Java (puerto 8080)...
set "MAX_TRIES_BACKEND=120"
set "TRIES=0"
:wait_backend
set /a TRIES+=1
curl -s -o nul -w "" http://localhost:8080/test >nul 2>&1
if errorlevel 1 (
    if !TRIES! geq %MAX_TRIES_BACKEND% (
        echo.
        echo  ERROR: el backend no respondio despues de 2 minutos.
        echo  Mira los logs con: docker compose logs microservicio_gestion_persistencia
        echo.
        pause
        exit /b 1
    )
    <nul set /p "=."
    timeout /t 1 /nobreak >nul
    goto wait_backend
)
echo.
echo        OK: backend Java respondiendo.

REM ---------------------------------------------------------------
REM  Paso 4: esperar al frontend (puerto 5173).
REM ---------------------------------------------------------------
echo.
echo  [4/4] Esperando al frontend (puerto 5173)...
set "MAX_TRIES_FRONT=60"
set "TRIES=0"
:wait_frontend
set /a TRIES+=1
curl -s -o nul -w "" http://localhost:5173 >nul 2>&1
if errorlevel 1 (
    if !TRIES! geq %MAX_TRIES_FRONT% (
        echo.
        echo  ERROR: el frontend no respondio despues de 1 minuto.
        echo  Mira los logs con: docker compose logs interfaz_usuario
        echo.
        pause
        exit /b 1
    )
    <nul set /p "=."
    timeout /t 1 /nobreak >nul
    goto wait_frontend
)
echo.
echo        OK: frontend respondiendo.

REM ---------------------------------------------------------------
REM  Listo: abrir el navegador.
REM ---------------------------------------------------------------
echo.
echo  ======================================================
echo    Sistema listo. Abriendo el navegador...
echo  ======================================================
echo.
echo    Frontend: http://localhost:5173
echo    API Java: http://localhost:8080
echo    Swagger:  http://localhost:8080/swagger-ui/index.html
echo.
echo    Nota: la primera vez que pidas un analisis puede tardar mas
echo    de lo normal, porque Ollama termina de cargar el modelo
echo    en memoria.
echo.
echo    Para detener todo el sistema mas tarde, ejecuta Detener.bat.
echo.

start "" http://localhost:5173

echo  Presiona cualquier tecla para cerrar esta ventana...
pause >nul
endlocal
