@echo off
chcp 65001 > nul
title Code Audit AI - Aplicar icono Iniciar
cd /d "%~dp0"

echo.
echo  Aplicando icono code.ico a Iniciar.bat (via Iniciar.lnk)...
echo.

if not exist "%~dp0code.ico" (
    echo  ERROR: no se encontro code.ico en esta carpeta.
    echo  Coloca code.ico en la raiz del proyecto y volve a intentar.
    echo.
    pause
    exit /b 1
)

if not exist "%~dp0Iniciar.bat" (
    echo  ERROR: no se encontro Iniciar.bat en esta carpeta.
    echo.
    pause
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\aplicar-iconos.ps1"
if errorlevel 1 (
    echo.
    echo  ERROR al crear el acceso directo. Revisa el mensaje de PowerShell arriba.
    pause
    exit /b 1
)

echo.
echo  Acceso directo actualizado:
echo    - Iniciar.lnk  --^>  Iniciar.bat  (icono: code.ico)
echo.
echo  Usa Iniciar.lnk en el Explorador para ver el icono personalizado.
echo.
pause
