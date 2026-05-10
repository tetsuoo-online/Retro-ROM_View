@echo off
chcp 65001 >nul
echo ============================================
echo  MAME ROM Viewer - Installation
echo ============================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERREUR] Node.js n'est pas installe.
  echo Telechargez-le sur https://nodejs.org puis relancez ce script.
  pause
  exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo Node.js detecte : %NODE_VER%
echo.
echo Installation des dependances...
echo.

cd /d "%~dp0"
npm install

if errorlevel 1 (
  echo.
  echo [ERREUR] npm install a echoue.
  pause
  exit /b 1
)

echo.
echo ============================================
echo  Installation terminee.
echo  Lancez START.bat pour demarrer l'appli.
echo ============================================
pause
