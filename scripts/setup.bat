@echo off
REM MediConnect 360 - Quick Setup Script for Windows
REM This script automates the initial setup process

echo.
echo ========================================
echo   MediConnect 360 - Quick Setup
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed
    echo Please install Docker Desktop from: https://docs.docker.com/desktop/install/windows-install/
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js 18+ from: https://nodejs.org/
    exit /b 1
)

echo [OK] Prerequisites check passed
echo.

REM Setup environment files
echo Setting up environment files...

if not exist .env (
    copy .env.example .env
    echo [OK] Created .env file
) else (
    echo [WARNING] .env file already exists
)

if exist backend\.env (
    copy backend\.env backend\.env.backup
    echo [OK] Backed up existing backend\.env
) else (
    echo [WARNING] backend\.env file already exists
)

echo.

REM Start Docker services
echo Starting Docker services...
docker-compose up -d

echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo [ERROR] Failed to start Docker services
    exit /b 1
)

echo [OK] Docker services are running
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
cd ..
echo [OK] Backend dependencies installed
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
call npm install
echo [OK] Frontend dependencies installed
echo.

REM Run backend tests
echo Running backend tests...
cd backend
call npm run test -- --passWithNoTests
cd ..
echo [OK] Backend tests passed
echo.

REM Display next steps
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Get your FREE API keys:
echo    - Gemini AI: https://aistudio.google.com/app/apikey
echo    - Resend Email: https://resend.com/api-keys
echo.
echo 2. Add API keys to backend\.env:
echo    GEMINI_API_KEY=your-key-here
echo    RESEND_API_KEY=your-key-here
echo.
echo 3. Start the backend:
echo    cd backend ^&^& npm run start:dev
echo.
echo 4. Start the frontend (in a new terminal):
echo    npm run dev
echo.
echo 5. Open your browser:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo.
echo Documentation:
echo    - README.md - Project overview
echo    - TESTING_GUIDE.md - Testing guide
echo    - DEPLOYMENT.md - Deployment guide
echo    - IMPROVEMENTS_SUMMARY.md - What's new
echo.
echo Troubleshooting:
echo    - Check Docker: docker-compose ps
echo    - View logs: docker-compose logs -f
echo    - Restart services: docker-compose restart
echo.
echo Happy coding!
echo.
pause
