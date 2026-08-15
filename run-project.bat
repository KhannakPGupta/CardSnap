@echo off
title CardSnap Launcher
echo ===================================================
echo             CardSnap HUD Application
echo ===================================================
echo.
echo [1/2] Launching FastAPI Backend Server...
start cmd /k "echo Starting CardSnap API... && cd backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

echo.
echo [2/2] Launching React Vite Frontend...
cd frontend
npm run dev
