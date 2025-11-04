@echo off
echo ========================================
echo ASPMS Deployment Script
echo ========================================
echo.

echo Step 1: Syncing server files to functions...
cp server/routes.ts functions/src/server/routes.ts
cp server/routes-ofivio.ts functions/src/server/routes-ofivio.ts
cp server/routes-extensions.ts functions/src/server/routes-extensions.ts
cp server/routes-lifecycle.ts functions/src/server/routes-lifecycle.ts
cp server/auth.ts functions/src/server/auth.ts
cp server/logger.ts functions/src/server/logger.ts
cp server/index.ts functions/src/index.ts
cp shared/schema.ts functions/src/shared/schema.ts
echo ✓ Server files synced successfully
echo.

echo Step 2: Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ✗ Build failed!
    pause
    exit /b %errorlevel%
)
echo ✓ Build completed successfully
echo.

echo Step 3: Deploying to Firebase...
echo.
echo NOTE: If you get an authentication error, run: firebase login --reauth
echo.
call firebase deploy --only hosting,functions
if %errorlevel% neq 0 (
    echo.
    echo ✗ Deployment failed!
    echo.
    echo Try running: firebase login --reauth
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo ✓ Deployment completed successfully!
echo ========================================
echo.
echo Your app is now live at:
echo https://aspms-pro-v1.web.app
echo.
echo Next steps:
echo 1. Visit the URL above
echo 2. Test all features from DEPLOYMENT_GUIDE.md
echo 3. Check Firebase Console for any errors
echo.
pause
