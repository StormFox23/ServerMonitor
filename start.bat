@echo off
REM ServerMonitor Development Startup Script for Windows
REM This script checks dependencies and starts both client and server

echo 🚀 Starting ServerMonitor v2.0 Development Environment (Angular 21 + TypeScript 5.5)...
echo ================================================

REM Function to check if command exists
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 20+ first.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js version: %NODE_VERSION%

REM Check and install client dependencies
echo [INFO] Checking client dependencies...
if not exist "Client\node_modules" (
    echo [WARNING] Client dependencies not found. Installing...
    cd Client
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install client dependencies
        pause
        exit /b 1
    )
    echo [SUCCESS] Client dependencies installed successfully
    cd ..
) else (
    echo [SUCCESS] Client dependencies are up to date
)

REM Check and install server dependencies
echo [INFO] Checking server dependencies...
if not exist "Server\node_modules" (
    echo [WARNING] Server dependencies not found. Installing...
    cd Server
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install server dependencies
        pause
        exit /b 1
    )
    echo [SUCCESS] Server dependencies installed successfully
    cd ..
) else (
    echo [SUCCESS] Server dependencies are up to date
)

REM Build TypeScript server
echo [INFO] Building TypeScript server...
cd Server
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build TypeScript server
    pause
    exit /b 1
)
echo [SUCCESS] TypeScript server built successfully
cd ..

REM Check if ports are available
echo [INFO] Checking port availability...
netstat -an | findstr :4200 >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 4200 is already in use. Please stop the existing process.
    pause
    exit /b 1
)

netstat -an | findstr :9500 >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 9500 is already in use. Please stop the existing process.
    pause
    exit /b 1
)

echo [SUCCESS] Ports 4200 and 9500 are available

REM Start services
echo [INFO] Starting development servers...
echo ================================================
echo.
echo [SUCCESS] Client will be available at: http://localhost:4200
echo [SUCCESS] Server will be available at: http://localhost:9500
echo.
echo Press Ctrl+C to stop both servers
echo ================================================

REM Start server in background
start "ServerMonitor Server" /D "Server" cmd /k "npm run dev"

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

REM Start client
start "ServerMonitor Client" /D "Client" cmd /k "npm start"

echo.
echo [SUCCESS] Both servers started in separate windows
echo Close this window or press any key to exit...
pause >nul