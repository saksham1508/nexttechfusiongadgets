# Start Development Environment
Write-Host "🚀 Starting Development Environment..." -ForegroundColor Green

# Set environment variables
$env:NODE_ENV = "development"
$env:REACT_APP_ENV = "development"

# Start backend in development mode
Write-Host "📡 Starting Backend (Development)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:/Users/dell/OneDrive/Desktop/nexttechfusiongadgets/backend'; cp .env.development .env; npm run dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in development mode
Write-Host "🌐 Starting Frontend (Development)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:/Users/dell/OneDrive/Desktop/nexttechfusiongadgets/frontend'; cp .env.development .env; npm run start:dev"

Write-Host "✅ Development environment started!" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Environment: DEVELOPMENT (Green Badge)" -ForegroundColor Green