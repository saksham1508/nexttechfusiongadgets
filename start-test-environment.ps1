# Start Test Environment
Write-Host "🧪 Starting Test Environment..." -ForegroundColor Yellow

# Set environment variables
$env:NODE_ENV = "test"
$env:REACT_APP_ENV = "test"

# Start backend in test mode
Write-Host "📡 Starting Backend (Test)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:/Users/dell/OneDrive/Desktop/nexttechfusiongadgets/backend'; cp .env.test .env; $env:PORT=3001; npm run dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in test mode
Write-Host "🌐 Starting Frontend (Test)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:/Users/dell/OneDrive/Desktop/nexttechfusiongadgets/frontend'; cp .env.test .env; npm run start:test"

Write-Host "✅ Test environment started!" -ForegroundColor Yellow
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Environment: TESTING (Orange Badge)" -ForegroundColor Yellow