@echo off
echo ========================================
echo  Firestore Rules Deployment Script
echo ========================================
echo.

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Firebase CLI is not installed.
    echo.
    echo Please install it by running:
    echo   npm install -g firebase-tools
    echo.
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo [1/3] Firebase CLI found!
echo.

REM Login to Firebase
echo [2/3] Logging in to Firebase...
firebase login
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Firebase login failed.
    pause
    exit /b 1
)
echo.

REM Deploy Firestore rules
echo [3/3] Deploying Firestore rules...
echo.
firebase deploy --only firestore:rules

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Deployment failed!
    echo Please check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Deployment Successful! ✓
echo ========================================
echo.
echo Your admin dashboard should now work properly.
echo Please refresh your browser and try again.
echo.
pause
