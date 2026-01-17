@echo off
echo.
echo ========================================
echo   Decisio Cloud Functions Deployment
echo ========================================
echo.

echo [1/3] Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: npm install failed!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo [2/3] Testing Firebase login...
call firebase login --reauth

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Firebase login failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Deploying functions to Firebase...
call firebase deploy --only functions

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Deployment failed!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deployment Successful!
echo ========================================
echo.
echo Your Cloud Functions are now live!
echo.
echo Next steps:
echo 1. Check Firebase Console: https://console.firebase.google.com
echo 2. View logs: firebase functions:log
echo 3. Test with: node admin-broadcast.js "Test" "Hello!"
echo.
pause
