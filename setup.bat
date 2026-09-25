@echo off
TITLE Gym Fee & Membership Management System - Installer
color 0A

echo =======================================================
echo    GYM FEE & MEMBERSHIP MANAGEMENT SYSTEM SETUP
echo =======================================================
echo.

echo [1/5] Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please download and install Node.js (v18 or higher) from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is detected!
echo.

echo [2/5] Creating environment file (.env)...
if not exist .env (
    echo DATABASE_URL="file:./dev.db" > .env
    echo JWT_SECRET="gym_management_super_secure_jwt_secret_key_2026" >> .env
    echo NEXT_PUBLIC_APP_URL="http://localhost:3000" >> .env
    echo .env created successfully.
) else (
    echo .env already exists.
)
echo.

echo [3/5] Installing project dependencies (npm install)...
call npm install
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Failed to install npm dependencies.
    pause
    exit /b 1
)
echo.

echo [4/5] Initializing Database & Prisma Schema...
call npx prisma db push
call node prisma/seed.js
echo.

echo [5/5] Building Next.js Production App...
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Build failed.
    pause
    exit /b 1
)
echo.

echo =======================================================
echo    SETUP COMPLETED SUCCESSFULLY!
echo =======================================================
echo.
echo You can now start the application anytime by double-clicking 'start.bat'
echo Or start now:
echo.
echo Login URL: http://localhost:3000/login
echo Admin:    admin@gym.com / admin123
echo Staff:    staff@gym.com / staff123
echo =======================================================
echo.
pause
start http://localhost:3000/login
npm start
