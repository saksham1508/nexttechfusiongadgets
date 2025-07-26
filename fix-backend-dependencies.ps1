# Fix Backend Dependencies Script
Write-Host "🔧 Fixing Backend Dependencies..." -ForegroundColor Yellow

# Check if we're in the right directory
if (-not (Test-Path "backend")) {
    Write-Host "❌ Backend directory not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "`n📁 Navigating to backend directory..." -ForegroundColor Cyan
Set-Location backend

Write-Host "`n📦 Installing missing dependencies..." -ForegroundColor Cyan

# Install the missing express-rate-limit package
Write-Host "Installing express-rate-limit..." -ForegroundColor White
npm install express-rate-limit@^7.1.5

# Install other potentially missing dependencies
Write-Host "Installing additional dependencies..." -ForegroundColor White
npm install express-validator@^7.0.1
npm install express-async-handler@^1.2.0
npm install helmet@^7.0.0
npm install morgan@^1.10.0
npm install compression@^1.7.4

# Check if MongoDB is available (optional)
Write-Host "`n🗄️ Checking MongoDB availability..." -ForegroundColor Cyan
try {
    $mongoCheck = Get-Command mongod -ErrorAction SilentlyContinue
    if ($mongoCheck) {
        Write-Host "✅ MongoDB is installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️ MongoDB not found - will use fallback configuration" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ MongoDB check skipped" -ForegroundColor Yellow
}

Write-Host "`n✅ Dependencies installation complete!" -ForegroundColor Green

Write-Host "`n🚀 Starting backend server..." -ForegroundColor Green
Write-Host "📊 Health check: http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "🔧 Press Ctrl+C to stop the server" -ForegroundColor Gray

# Start the development server
npm run dev