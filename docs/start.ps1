# IntelliTrip - Start All Services
# Run this script from the IntelliTrip root directory: .\start.ps1

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   IntelliTrip - AI-Powered Smart Tourism Platform" -ForegroundColor Cyan
Write-Host "   Starting all services..." -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Start Python FastAPI ML Microservice in new window
Write-Host "[1/3] Starting Python FastAPI ML Microservice on port 8000..." -ForegroundColor Blue
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd "d:\IntelliTrip\ai-service"; Write-Host "Python FastAPI ML Service" -ForegroundColor Blue; python -m uvicorn app:app --reload --port 8000' -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Node.js Express Backend in new window
Write-Host "[2/3] Starting Node.js Express Backend on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd "d:\IntelliTrip\backend"; Write-Host "Node.js Express Backend" -ForegroundColor Green; npm run dev' -WindowStyle Normal

Start-Sleep -Seconds 2

# Start React Vite Frontend in new window
Write-Host "[3/3] Starting React Vite Frontend on port 5173..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd "d:\IntelliTrip\frontend"; Write-Host "React Vite Frontend" -ForegroundColor Magenta; npm run dev' -WindowStyle Normal

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   All 3 services launched in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "   Python FastAPI ML : http://localhost:8000" -ForegroundColor Blue
Write-Host "   Node.js Backend   : http://localhost:5000" -ForegroundColor Green
Write-Host "   React Frontend    : http://localhost:5173" -ForegroundColor Magenta
Write-Host ""
Write-Host "   Opening IntelliTrip in your browser..." -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

Start-Sleep -Seconds 4
Start-Process "http://localhost:5173"
