@echo off
echo ========================================
echo Firestore Index Deployment Script
echo ========================================
echo.
echo This script will deploy Firestore indexes to Firebase.
echo.
echo Prerequisites:
echo 1. You must be logged in to Firebase CLI
echo 2. If not logged in, the script will prompt you to login
echo.
pause

echo.
echo Checking Firebase login status...
firebase projects:list >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ Not logged in to Firebase
    echo.
    echo Please login to Firebase CLI:
    echo.
    firebase login
    if errorlevel 1 (
        echo.
        echo ❌ Login failed. Please try again.
        pause
        exit /b 1
    )
)

echo.
echo ✅ Firebase CLI authenticated
echo.
echo Deploying Firestore indexes...
echo.

firebase deploy --only firestore:indexes

if errorlevel 1 (
    echo.
    echo ❌ Index deployment failed
    echo.
    echo Please check the error above and try again.
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ Indexes deployed successfully!
    echo.
    echo The indexes are now building in Firebase.
    echo This may take 1-5 minutes to complete.
    echo.
    echo You can check the status at:
    echo https://console.firebase.google.com/project/aspms-pro-v1/firestore/indexes
    echo.
)

pause
