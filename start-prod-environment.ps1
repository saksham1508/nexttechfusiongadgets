# Start Production Environment (Local)
Write-Host "🔴 Starting Production Environment..." -ForegroundColor Red

# Stop any running dev/prod servers on common ports
$ports = 5000,3000
foreach ($p in $ports) {
  $pid = (Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue | Select-Object -First 1 OwningProcess).OwningProcess
  if ($pid) {
    Write-Host "🛑 Stopping PID $pid on port $p" -ForegroundColor Yellow
    try { Stop-Process -Id $pid -Force -ErrorAction Stop } catch { Write-Host "Failed to stop PID $pid: $($_.Exception.Message)" -ForegroundColor Red }
    Start-Sleep -Milliseconds 300
  }
}

# Set environment variables
$env:NODE_ENV = "production"
$env:REACT_APP_ENV = "production"

# Build frontend for production
Write-Host "🏗️ Building Frontend for Production..." -ForegroundColor Red
Push-Location "$PSScriptRoot/frontend"
cp .env.production .env
npm run build:prod
Pop-Location

# Start backend in production mode
Write-Host "📡 Starting Backend (Production)..." -ForegroundColor Red
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/backend'; cp .env.production .env; npm run start:prod"

# Serve frontend build
Write-Host "🌐 Serving Frontend (Production Build)..." -ForegroundColor Red
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/frontend'; npx serve -s build -l 3000"

Write-Host "✅ Production environment started!" -ForegroundColor Red
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Environment: PRODUCTION (Red Badge)" -ForegroundColor Red
Write-Host "⚠️  WARNING: This is PRODUCTION mode!" -ForegroundColor Red