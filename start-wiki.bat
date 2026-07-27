@echo off
title MITRE ATT&CK Local Wiki
color 0A

echo.
echo  =====================================================
echo   MITRE ATT^&CK^(R^) Local Wiki  ^|  Starting...
echo  =====================================================
echo.
echo  App will open at: http://localhost:3001
echo  Press Ctrl+C in this window to stop the server.
echo.

:: Move to the folder where this .bat file lives
cd /d "%~dp0"

:: Check Node is installed
where node >nul 2>nul
if errorlevel 1 (
    echo  [ERROR] Node.js was not found on PATH.
    echo  Please install Node.js from https://nodejs.org and try again.
    pause
    exit /b 1
)

:: Check node_modules exist — run npm install if missing
if not exist "node_modules\" (
    echo  [INFO] node_modules not found. Running npm install first...
    echo.
    npm install
    if errorlevel 1 (
        echo  [ERROR] npm install failed. Check your internet connection.
        pause
        exit /b 1
    )
)

:: Wait 2 seconds then open the browser in the background
start "" /b cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3001"

:: Start the dev server (blocks until you press Ctrl+C)
npm run dev

echo.
echo  Server stopped.
pause
