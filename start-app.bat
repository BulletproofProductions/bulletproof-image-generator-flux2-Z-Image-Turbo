@echo off
REM Bulletproof Image Generator - Unified Application Startup Script
REM This script orchestrates starting all required services:
REM   1. Docker Desktop with PostgreSQL database
REM   2. ComfyUI (GPU or CPU mode)
REM   3. Next.js development server
REM   4. Environment setup and dependency installation
REM   5. Preflight checks for Docker, Node.js, pnpm, and ComfyUI
REM   6. Error handling and logging for troubleshooting
REM   Intended for environment setup on Windows
REM ============================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ============================================================================
echo Bulletproof Image Generator - Application Environment Startup
echo ============================================================================
echo.

REM ============================================================================
REM STEP 1: Preflight Checks
REM ============================================================================
echo [STEP 1/6] Running preflight checks...
echo.

REM Check if Docker is installed
echo Checking Docker Desktop...
docker --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [WARNING] Docker Desktop is not installed
    echo.
    echo Opening Docker Desktop download page in your default browser...
    echo.
    start https://www.docker.com/products/docker-desktop
    echo.
    echo Please:
    echo   1. Install Docker Desktop from the opened browser window
    echo   2. Follow the installation wizard
    echo   3. Restart your computer if prompted
    echo   4. Run this script again
    echo.
    pause
    exit /b 1
)
echo [OK] Docker Desktop is installed

REM Check if Docker daemon is running
set DOCKER_NEEDS_START=0
docker ps >nul 2>&1
if errorlevel 1 set DOCKER_NEEDS_START=1

if %DOCKER_NEEDS_START% equ 0 goto docker_running

echo [WARNING] Docker daemon is not running. Launching Docker Desktop...

REM Try multiple Docker Desktop installation paths
set DOCKER_FOUND=0
set DOCKER_PATH=

if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
    set DOCKER_FOUND=1
    set "DOCKER_PATH=C:\Program Files\Docker\Docker\Docker Desktop.exe"
)

if %DOCKER_FOUND% equ 0 if exist "C:\Program Files\Docker\Docker\Docker.exe" (
    set DOCKER_FOUND=1
    set "DOCKER_PATH=C:\Program Files\Docker\Docker\Docker.exe"
)

if %DOCKER_FOUND% equ 0 (
    echo.
    echo [ERROR] STEP 1/6 - Docker Desktop executable not found
    echo.
    echo Docker Desktop installation appears incomplete or corrupted.
    echo.
    echo Checked paths:
    echo   - C:\Program Files\Docker\Docker\Docker Desktop.exe
    echo   - C:\Program Files\Docker\Docker\Docker.exe
    echo.
    echo Troubleshooting:
    echo   1. Uninstall Docker Desktop completely
    echo   2. Download latest version from: https://www.docker.com/products/docker-desktop
    echo   3. Install in default location: C:\Program Files\Docker
    echo   4. Run this script again
    echo.
    pause
    exit /b 1
)

echo Starting Docker Desktop...
start "" "!DOCKER_PATH!"

echo Waiting for Docker to start... (up to 60 seconds)
set DOCKER_RETRY=0

:docker_wait_loop
if %DOCKER_RETRY% geq 60 (
    echo.
    echo [ERROR] STEP 1/6 - Docker daemon failed to start after 60 seconds
    echo.
    echo Troubleshooting:
    echo   1. Check Docker Desktop system resources
    echo   2. Open Docker Desktop manually and check for errors
    echo   3. Restart Docker Desktop from system tray
    echo   4. Try this script again
    echo.
    pause
    exit /b 1
)

timeout /t 1 /nobreak >nul
docker ps >nul 2>&1
if errorlevel 1 (
    set /a DOCKER_RETRY=%DOCKER_RETRY%+1
    goto docker_wait_loop
)
echo [OK] Docker Desktop started successfully

:docker_running
echo [OK] Docker daemon is running
echo.

REM Create logs directory early for error capture
if not exist "logs" mkdir logs

REM Generate timestamp for log files (if not already set)
if not defined TIMESTAMP for /f "delims=" %%a in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMddHHmmss"') do set TIMESTAMP=%%a

REM Check if Node.js is installed
echo Checking Node.js...
set NODE_INSTALLED=0
node --version >nul 2>&1
if not errorlevel 1 set NODE_INSTALLED=1

if %NODE_INSTALLED% equ 1 (
    echo [OK] Node.js is installed
    goto node_check_done
)

echo [WARNING] Node.js not found. Installing NVM and Node 24.12.0...
echo.

REM Check if NVM is installed
set NVM_INSTALLED=0
nvm --version >nul 2>&1
if not errorlevel 1 set NVM_INSTALLED=1

if %NVM_INSTALLED% equ 1 goto nvm_ready

echo Installing NVM Node Version Manager...

REM Check if NVM is already installed in standard location
if exist "%APPDATA%\nvm" goto nvm_ready

echo Downloading and installing NVM for Windows...

REM Create temporary directory for NVM setup
set NVM_TEMP=%TEMP%\nvm-setup
if exist "%NVM_TEMP%" rmdir /s /q "%NVM_TEMP%"
mkdir "%NVM_TEMP%"

REM Download NVM installer using PowerShell
powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://github.com/coreybutler/nvm-windows/releases/download/1.1.11/nvm-setup.exe' -OutFile '%NVM_TEMP%\nvm-setup.exe' -UseBasicParsing"

if errorlevel 1 (
    echo.
    echo [ERROR] STEP 1/6 - Failed to download NVM installer
    echo.
    echo Could not download NVM from GitHub. Check your internet connection.
    echo.
    echo Manual installation:
    echo   1. Visit: https://github.com/coreybutler/nvm-windows/releases
    echo   2. Download: nvm-setup.exe latest version
    echo   3. Run installer and follow setup wizard
    echo   4. Restart your computer
    echo   5. Run this script again
    echo.
    pause
    exit /b 1
)

echo Running NVM installer...
call "%NVM_TEMP%\nvm-setup.exe" /SILENT

if errorlevel 1 (
    echo.
    echo [ERROR] STEP 1/6 - NVM installer execution failed
    echo.
    echo The NVM setup wizard encountered an error.
    echo.
    echo Troubleshooting:
    echo   1. Run as Administrator and try again
    echo   2. Check for antivirus or firewall blocking installer
    echo   3. Visit: https://github.com/coreybutler/nvm-windows/releases
    echo   4. Download and run nvm-setup.exe manually
    echo   5. Run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] NVM installed successfully

REM Clean up temporary files
if exist "%NVM_TEMP%" rmdir /s /q "%NVM_TEMP%"

echo Note: You may need to restart your terminal for NVM to work

:nvm_ready
echo.
echo Installing Node.js 24.12.0 via NVM...
nvm install 24.12.0 2>logs\nvm-install-error-%TIMESTAMP%.log

if errorlevel 1 (
    echo.
    echo [ERROR] STEP 1/6 - Node.js 24.12.0 installation via NVM failed
    echo.
    echo Error log: logs\nvm-install-error-%TIMESTAMP%.log
    echo.
    echo Troubleshooting:
    echo   1. Check error log above for details
    echo   2. Try command manually: nvm install 24.12.0
    echo   3. Ensure internet connection is stable
    echo   4. Run: nvm list to see available versions
    echo   5. Try: nvm install 22.0.0 instead
    echo.
    pause
    exit /b 1
)

echo Making Node.js 24.12.0 active...
nvm use 24.12.0 2>logs\nvm-use-error-%TIMESTAMP%.log

if errorlevel 1 (
    echo.
    echo [ERROR] STEP 1/6 - Failed to activate Node.js 24.12.0
    echo.
    echo Error log: logs\nvm-use-error-%TIMESTAMP%.log
    echo.
    echo Troubleshooting:
    echo   1. Check error log above
    echo   2. Run: nvm list to see installed versions
    echo   3. Try: nvm use 22.0.0 if 24.12.0 not listed
    echo   4. Restart terminal and try again
    echo   5. Check: node --version in new terminal window
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js 24.12.0 installed and activated via NVM
echo.

:node_check_done

REM Check if pnpm is installed
echo Checking pnpm...
set PNPM_INSTALLED=0
where pnpm >nul 2>&1
if not errorlevel 1 set PNPM_INSTALLED=1

if %PNPM_INSTALLED% equ 1 (
    echo [OK] pnpm is installed
    goto pnpm_check_done
)

echo [WARNING] pnpm not found in PATH. Installing...
npm install -g pnpm 2>logs\pnpm-install-error-%TIMESTAMP%.log

if errorlevel 1 (
    echo.
    echo [ERROR] STEP 1/6 - pnpm installation failed
    echo.
    echo Error log: logs\pnpm-install-error-%TIMESTAMP%.log
    echo.
    echo Troubleshooting:
    echo   1. Check error log above
    echo   2. Ensure npm is working: npm --version
    echo   3. Clear npm cache: npm cache clean --force
    echo   4. Try manual install: npm install -g pnpm@latest
    echo   5. Restart terminal and run script again
    echo.
    pause
    exit /b 1
)
echo [OK] pnpm installed

:pnpm_check_done

REM Check if ComfyUI portable exists
echo Checking ComfyUI portable...
set COMFYUI_FOUND=0
if exist "..\comfyui_portable\run_nvidia_gpu.bat" (
    set COMFYUI_PATH=..\comfyui_portable
    set COMFYUI_FOUND=1
)
if exist "..\comfyui_portable\ComfyUI\main.py" (
    set COMFYUI_PATH=..\comfyui_portable
    set COMFYUI_FOUND=1
)

if %COMFYUI_FOUND% equ 1 goto comfyui_found

echo [ERROR] ComfyUI portable not found
echo Expected path: ..\comfyui_portable
echo Expected files: run_nvidia_gpubat or ComfyUI\main.py
pause
exit /b 1

:comfyui_found
echo [OK] ComfyUI portable found at: %COMFYUI_PATH%

echo [SUCCESS] All preflight checks passed!
echo.

REM ============================================================================
REM STEP 2: Environment Setup
REM ============================================================================
echo [STEP 2/6] Setting up environment variables...
echo.

if not exist ".env" (
    echo Creating .env from env.example...
    if exist "env.example" (
        copy env.example .env >nul 2>logs\env-copy-error-!TIMESTAMP!.log
        if errorlevel 1 (
            echo.
            echo [ERROR] STEP 2/6 - Failed to create .env file
            echo.
            echo Could not copy env.example to .env
            echo Error log: logs\env-copy-error-!TIMESTAMP!.log
            echo.
            echo Troubleshooting:
            echo   1. Check file permissions on current directory
            echo   2. Ensure logs directory exists: mkdir logs
            echo   3. Try running as Administrator
            echo   4. Check disk space is available
            echo   5. Manually copy: env.example ^> .env
            echo.
            pause
            exit /b 1
        )
    ) else (
        echo Creating minimal .env...
        (
            echo POSTGRES_URL=postgresql://dev_user:dev_password@localhost:5432/postgres_flux2
            echo NEXT_PUBLIC_APP_URL=http://localhost:3000
            echo BLOB_READ_WRITE_TOKEN=
        ) > .env
    )
    echo [OK] .env created
) else (
    echo [OK] .env already exists
)

echo.

REM ============================================================================
REM STEP 3: Install Dependencies
REM ============================================================================
echo [STEP 3/6] Installing dependencies...
echo.

call pnpm install 2>logs\pnpm-deps-error-!TIMESTAMP!.log
if errorlevel 1 (
    echo.
    echo [ERROR] STEP 3/6 - pnpm install failed
    echo.
    echo Error log: logs\pnpm-deps-error-!TIMESTAMP!.log
    echo.
    echo Troubleshooting:
    echo   1. Review error log above for specific errors
    echo   2. Try clearing cache: pnpm store prune
    echo   3. Delete node_modules and pnpm-lock.yaml
    echo   4. Try: pnpm install --force
    echo   5. Check Node.js version: node --version
    echo   6. Check npm version: npm --version
    echo.
    pause
    exit /b 1
)

echo [OK] Dependencies installed
echo.

REM ============================================================================
REM STEP 4: Start Docker and Database
REM ============================================================================
echo [STEP 4/6] Starting Docker and PostgreSQL...
echo.

REM Create logs directory for error capture
if not exist "logs" mkdir logs

REM Generate timestamp for log file (using PowerShell for reliable timestamp)
for /f "delims=" %%a in ('powershell -Command "Get-Date -Format 'yyyyMMdd-HHmmss'"') do set TIMESTAMP=%%a

echo Starting Docker containers...
call docker compose up -d 2>logs\docker-compose-error-!TIMESTAMP!.log
if errorlevel 1 (
    echo.
    echo [ERROR] STEP 4/6 - Failed to start Docker containers
    echo.
    echo Error log: logs\docker-compose-error-!TIMESTAMP!.log
    echo.
    echo Troubleshooting:
    echo   1. Review error log above
    echo   2. Check Docker is running: docker ps
    echo   3. View container logs: docker compose logs
    echo   4. Free up disk space if needed
    echo   5. Clean up: docker compose down, then retry
    echo   6. Check docker-compose.yml file exists
    echo.
    pause
    exit /b 1
)

echo [OK] Docker containers started

echo Waiting for PostgreSQL to become healthy...
set HEALTH_RETRY=0
set MAX_HEALTH_RETRIES=60

:health_loop
REM Check retry limit
if %HEALTH_RETRY% geq %MAX_HEALTH_RETRIES% goto health_timeout

timeout /t 1 /nobreak >nul

REM Check if container is healthy using inspect command
REM First, get the actual container ID/name
for /f "delims=" %%a in ('docker compose ps --quiet postgres 2^>nul') do set CONTAINER_ID=%%a

if "%CONTAINER_ID%"=="" goto health_increment

REM Container exists, check its health status
for /f "delims=" %%a in ('docker inspect --format="{{.State.Health.Status}}" %CONTAINER_ID% 2^>nul') do set HEALTH_STATUS=%%a

if "%HEALTH_STATUS%"=="healthy" goto postgres_ready

:health_increment
set /a HEALTH_RETRY=%HEALTH_RETRY%+1
goto health_loop

:health_timeout
echo.
echo [ERROR] STEP 4/6 - PostgreSQL failed to become healthy after %MAX_HEALTH_RETRIES% seconds
echo.
echo Collecting diagnostic logs to: logs\docker-startup-error-%TIMESTAMP%.log
call docker compose logs postgres > logs\docker-startup-error-%TIMESTAMP%.log 2>&1
echo.
echo Troubleshooting:
echo   1. Check Docker Desktop system resources - CPU/Memory
echo   2. Review logs above for error details
echo   3. Try: docker compose logs postgres
echo   4. Try: docker compose down then retry
echo   5. Restart Docker Desktop
echo   6. Check available disk space
echo.
call docker compose down
pause
exit /b 1

:postgres_ready
echo [OK] PostgreSQL is healthy

echo Running database migrations...
set MIGRATION_RETRY=0
set MAX_MIGRATION_RETRIES=3

:migration_loop
REM Check retry limit
if %MIGRATION_RETRY% geq %MAX_MIGRATION_RETRIES% goto migration_failed

call pnpm db:migrate 2>logs\migration-error-%TIMESTAMP%.log
if not errorlevel 1 goto migration_done

set /a MIGRATION_RETRY=%MIGRATION_RETRY%+1
if %MIGRATION_RETRY% lss %MAX_MIGRATION_RETRIES% (
    echo Retrying migrations - attempt %MIGRATION_RETRY% of %MAX_MIGRATION_RETRIES%...
    timeout /t 5 /nobreak >nul
    goto migration_loop
)

:migration_failed
echo.
echo [ERROR] STEP 4/6 - Database migrations failed after %MAX_MIGRATION_RETRIES% attempts
echo.
echo Collecting diagnostic logs to: logs\docker-startup-error-%TIMESTAMP%.log
call docker compose logs postgres > logs\docker-startup-error-%TIMESTAMP%.log 2>&1
echo.
echo Troubleshooting:
echo   1. Check PostgreSQL is healthy: docker compose ps
echo   2. Review migration errors above
echo   3. Try: pnpm db:migrate manually
echo   4. Check database connection: psql -U dev_user -d postgres_flux2
echo   5. Review Drizzle config: drizzle.config.ts
echo.
pause
exit /b 1

:migration_done
echo [OK] Database ready
echo [OK] Database migration completed successfully
echo.

REM ============================================================================
REM STEP 5: GPU/CPU Mode Selection
REM ============================================================================
echo [STEP 5/6] Selecting ComfyUI mode...
echo.

echo Which mode would you like to run ComfyUI in?
echo.
echo [1] GPU Mode - NVIDIA recommended
echo [2] CPU Mode - Slower but works on any machine
echo.

set /p GPU_CHOICE="Enter your choice (1 or 2): "

if "%GPU_CHOICE%"=="2" (
    set COMFYUI_BATCH=run_cpu.bat
    echo [OK] CPU mode selectedz
) else (
    set COMFYUI_BATCH=run_nvidia_gpu.bat
    echo [OK] GPU mode selected - NVIDIA
)

echo.
echo Launching ComfyUI in a new window...
echo This may take 30-60 seconds on first startup...
echo.

REM Launch ComfyUI in a new terminal window
start "ComfyUI Server" cmd /k "pushd %COMFYUI_PATH% && call %COMFYUI_BATCH% && popd"

echo [OK] ComfyUI launched in new window
echo Waiting for ComfyUI to be ready - 30 seconds...
timeout /t 30 /nobreak >nul

echo [OK] ComfyUI should be running

echo.

REM ============================================================================
REM STEP 6: Start Development Server
REM ============================================================================
echo [STEP 6/6] Starting Next.js development server...
echo.
echo The dev server will open at: http://localhost:3000
echo.
echo Services:
echo   Web App:  http://localhost:3000
echo   ComfyUI:  http://localhost:8000
echo   Database: localhost:5432
echo.
echo To stop all services:
echo   1. Close the ComfyUI window
echo   2. Press Ctrl+C in this window
echo   3. Run: docker compose down
echo.

call pnpm dev

REM Cleanup on exit
echo.
echo Shutting down services...
call docker compose down

endlocal
exit /b 0
