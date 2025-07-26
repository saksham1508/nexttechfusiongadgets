# Quick Start Backend Script
Write-Host "🚀 Starting NextTechFusionGadgets Backend..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "backend")) {
    Write-Host "❌ Backend directory not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "`n📁 Navigating to backend directory..." -ForegroundColor Yellow
Set-Location backend

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚙️ Creating .env file from example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created from .env.example" -ForegroundColor Green
        Write-Host "⚠️ Please update the .env file with your actual configuration" -ForegroundColor Yellow
    } else {
        Write-Host "Creating basic .env file..." -ForegroundColor Yellow
        @"
# Basic configuration for development
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nexttechfusiongadgets
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:3000

# Optional: Add your API keys here
# STRIPE_SECRET_KEY=sk_test_...
# RAZORPAY_KEY_ID=rzp_test_...
# OPENAI_API_KEY=sk-...
"@ | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "✅ Basic .env file created" -ForegroundColor Green
    }
}

# Check if MongoDB is running (optional)
Write-Host "`n🗄️ Checking MongoDB connection..." -ForegroundColor Yellow
try {
    $mongoTest = mongo --eval "db.runCommand('ping')" --quiet 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️ MongoDB not detected - using fallback configuration" -ForegroundColor Yellow
        Write-Host "   The server will still start but some features may be limited" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️ MongoDB check skipped - server will attempt to connect on startup" -ForegroundColor Yellow
}

Write-Host "`n🚀 Starting backend server..." -ForegroundColor Green
Write-Host "📊 Health check will be available at: http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "📚 API documentation: http://localhost:5000/api/docs" -ForegroundColor Cyan
Write-Host "🔧 Press Ctrl+C to stop the server" -ForegroundColor Gray

# Try to start the full server first, fallback to simple server if dependencies are missing
Write-Host "Attempting to start full server..." -ForegroundColor Yellow
try {
    npm run dev
} catch {
    Write-Host "⚠️ Full server failed to start, trying simple server..." -ForegroundColor Yellow
    Write-Host "🚀 Starting simple server (no database required)..." -ForegroundColor Green
    node server-simple.js
}