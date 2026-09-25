@echo off
TITLE Gym Management System - Server
color 0B

echo =======================================================
echo    STARTING GYM MANAGEMENT SYSTEM...
echo =======================================================
echo.
echo Opening browser at http://localhost:3000/login ...
start http://localhost:3000/login
echo.
echo Running server... (Press Ctrl+C to stop)
npm start
