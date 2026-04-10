@echo off
REM Firestore Rules Deployment Script for Prakash Clayworks

echo =====================================
echo Firestore Rules Deployment
echo =====================================
echo.

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Firebase CLI not found
    echo Please install it first: npm install -g firebase-tools
    pause
    exit /b 1
)

echo [OK] Firebase CLI detected
echo.

echo Checking Firebase authentication...
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Not logged in. Logging in to Firebase...
    firebase login
    if %errorlevel% neq 0 (
        echo [ERROR] Login failed
        pause
        exit /b 1
    )
)

echo [OK] Authenticated successfully
echo.

echo Deploying Firestore rules to prakash-clayworks...
firebase deploy --only firestore:rules

if %errorlevel% equ 0 (
    echo.
    echo =====================================
    echo [SUCCESS] Deployment Successful!
    echo =====================================
    echo.
    echo Your Firestore security rules have been updated.
    echo The profile permissions issue should now be resolved.
) else (
    echo.
    echo [ERROR] Deployment failed
    echo Please check the error message above.
)

echo.
pause
