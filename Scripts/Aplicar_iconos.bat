@echo off
chcp 65001 > nul
title Code Audit AI - Aplicar iconos
cd /d "%~dp0"

echo.
echo  Aplicando iconos a los accesos directos (Iniciar y Detener)...
echo.

if not exist "..\iconos\code.ico" (
    echo  ERROR: no se encontro code.ico en la carpeta iconos.
    pause
    exit /b 1
)

if not exist "..\iconos\stop.ico" (
    echo  ERROR: no se encontro stop.ico en la carpeta iconos.
    pause
    exit /b 1
)

echo Creando accesos directos mediante PowerShell...

set "PS_SCRIPT=$WshShell = New-Object -comObject WScript.Shell; "
set "PS_SCRIPT=%PS_SCRIPT%$Shortcut = $WshShell.CreateShortcut('..\Iniciar.lnk'); "
set "PS_SCRIPT=%PS_SCRIPT%$Shortcut.TargetPath = '%~dp0Iniciar.bat'; "
set "PS_SCRIPT=%PS_SCRIPT%$Shortcut.IconLocation = '%~dp0..\iconos\code.ico'; "
set "PS_SCRIPT=%PS_SCRIPT%$Shortcut.WorkingDirectory = '%~dp0'; "
set "PS_SCRIPT=%PS_SCRIPT%$Shortcut.Save(); "
set "PS_SCRIPT=%PS_SCRIPT%$Shortcut2 = $WshShell.CreateShortcut('..\Detener.lnk'); "
set "PS_SCRIPT=%PS_SCRIPT%$Shortcut2.TargetPath = '%~dp0Detener.bat'; "
set "PS_SCRIPT=%PS_SCRIPT%$Shortcut2.IconLocation = '%~dp0..\iconos\stop.ico'; "
set "PS_SCRIPT=%PS_SCRIPT%$Shortcut2.WorkingDirectory = '%~dp0'; "
set "PS_SCRIPT=%PS_SCRIPT%$Shortcut2.Save();"

powershell -NoProfile -ExecutionPolicy Bypass -Command "%PS_SCRIPT%"
if errorlevel 1 (
    echo.
    echo  ERROR al crear los accesos directos. Revisa el mensaje de PowerShell arriba.
    pause
    exit /b 1
)

echo.
echo  Accesos directos creados y actualizados en la raiz del proyecto:
echo    - Iniciar.lnk  --^>  Scripts\Iniciar.bat  (icono: code.ico)
echo    - Detener.lnk  --^>  Scripts\Detener.bat  (icono: stop.ico)
echo.
pause
