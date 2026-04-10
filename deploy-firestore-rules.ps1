# Firestore Rules Deployment Script for Prakash Clayworks
# This script helps deploy Firestore security rules to Firebase

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Firestore Rules Deployment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
try {
    $firebaseVersion = firebase --version 2>$null
    Write-Host "✓ Firebase CLI detected: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Firebase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "  npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Checking Firebase authentication..." -ForegroundColor Yellow

# Try to list projects to check if logged in
$projects = firebase projects:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Not logged in to Firebase" -ForegroundColor Red
    Write-Host ""
    Write-Host "Logging in to Firebase..." -ForegroundColor Yellow
    firebase login

    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Login failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ Authenticated successfully" -ForegroundColor Green
Write-Host ""

# Deploy Firestore rules
Write-Host "Deploying Firestore rules to prakash-clayworks..." -ForegroundColor Yellow
firebase deploy --only firestore:rules

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "✓ Deployment Successful!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your Firestore security rules have been updated." -ForegroundColor Green
    Write-Host "The profile permissions issue should now be resolved." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ Deployment failed" -ForegroundColor Red
    Write-Host "Please check the error message above." -ForegroundColor Yellow
}
