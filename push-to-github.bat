@echo off
echo ============================================
echo   Prakash Clayworks - GitHub Push Script
echo ============================================
echo.

REM Check if remote 'origin' exists
git remote -v | find "origin" >nul
if %errorlevel% neq 0 (
    echo Adding GitHub remote repository...
    git remote add origin https://github.com/contactabhalok-dotcom/prakash-clayworks.git
) else (
    echo Remote 'origin' already exists.
)

echo.
echo Current branch: 
git branch --show-current

echo.
echo Setting branch to main...
git branch -M main

echo.
echo Pushing to GitHub...
echo NOTE: You will be prompted for GitHub credentials
echo If this fails, please create the repository manually at:
echo https://github.com/new
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo   SUCCESS! Code pushed to GitHub!
    echo ============================================
    echo.
    echo Repository: https://github.com/contactabhalok-dotcom/prakash-clayworks
    echo.
    echo Next steps:
    echo 1. Go to https://vercel.com/new
    echo 2. Import your GitHub repository
    echo 3. Deploy WEB APP:
    echo    - Root Directory: apps/web
    echo    - Build Command: cd ..\.. ^&^& pnpm install ^&^& cd apps/web ^&^& pnpm build
    echo 4. Deploy ADMIN:
    echo    - Root Directory: apps/admin
    echo    - Build Command: cd ..\.. ^&^& pnpm install ^&^& cd apps/admin ^&^& pnpm build
    echo.
    echo See VERCEL_DEPLOYMENT.md for detailed instructions
    echo.
) else (
    echo.
    echo ============================================
    echo   PUSH FAILED!
    echo ============================================
    echo.
    echo Please follow these steps:
    echo.
    echo 1. Create repository on GitHub:
    echo    - Go to: https://github.com/new
    echo    - Repository name: prakash-clayworks
    echo    - Owner: contactabhalok-dotcom
    echo    - Set to Private
    echo    - DO NOT initialize with README, .gitignore, or license
    echo.
    echo 2. After creating, run this script again
    echo.
)

pause
