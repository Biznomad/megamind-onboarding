@echo off
echo ============================================
echo MegaMind Portal - One-Click Deploy
echo ============================================
echo.

cd /d %~dp0

echo Step 1: Creating GitHub repo page...
start https://github.com/new?name=megamind-onboarding&description=MegaMind+10-Question+Onboarding+Portal
timeout /t 3 >nul

echo.
echo ACTION REQUIRED:
echo 1. In the browser window, click "Create repository"
echo 2. Press ANY KEY here when done...
pause >nul

echo.
echo Step 2: Pushing code to GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/Biznomad/megamind-onboarding.git
git push -u origin master

if errorlevel 1 (
    echo.
    echo ERROR: Push failed. Make sure you created the repo!
    pause
    exit /b 1
)

echo.
echo SUCCESS! Code pushed to GitHub.
echo.

echo Step 3: Opening Netlify...
start https://app.netlify.com/start

echo.
echo ============================================
echo FINAL STEPS IN NETLIFY:
echo ============================================
echo 1. Click "Import from GitHub"
echo 2. Select "megamind-onboarding"
echo 3. Click "Deploy site"
echo 4. After deploy, go to Site settings - Environment variables
echo 5. Add: MEGAMIND_PASSWORD = Knumoney0226?
echo 6. Copy your site URL
echo ============================================
echo.
echo Your URL will be like: https://SOMETHING.netlify.app
echo.
pause
