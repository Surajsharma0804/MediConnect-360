@echo off
echo 🔧 Fixing build issues for deployment...

REM Navigate to backend directory
cd backend

REM Create disabled features directory
if not exist "src\disabled-features" mkdir "src\disabled-features"

REM Move problematic controllers and services to disabled folder
echo 📁 Moving advanced features to disabled folder...

REM Move entire directories that have missing dependencies
move "src\ai\voice.controller.ts" "src\disabled-features\" >nul 2>&1
move "src\documents" "src\disabled-features\" >nul 2>&1
move "src\insurance" "src\disabled-features\" >nul 2>&1
move "src\lab-diagnostics" "src\disabled-features\" >nul 2>&1
move "src\appointments" "src\disabled-features\" >nul 2>&1
move "src\emergency" "src\disabled-features\" >nul 2>&1

echo ✅ Advanced features temporarily disabled

REM Test the build
echo 🔨 Testing build...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful! Ready for deployment.
    echo.
    echo 📝 Next steps:
    echo 1. git add .
    echo 2. git commit -m "Temporarily disable advanced features for deployment"
    echo 3. git push origin main
    echo 4. Deploy to Render using the FREE_DEPLOYMENT_GUIDE.md
) else (
    echo ❌ Build still failing. Check the errors above.
)

pause