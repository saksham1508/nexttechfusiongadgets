# Quick Start Script - Get Your App Running Fast!
Write-Host "🚀 Quick Start - NextTechFusionGadgets" -ForegroundColor Green

Write-Host "`n📁 Navigating to backend directory..." -ForegroundColor Yellow
Set-Location backend

Write-Host "`n🔧 Installing basic dependencies..." -ForegroundColor Yellow
npm install express cors

Write-Host "`n🚀 Starting simple backend server..." -ForegroundColor Green
Write-Host "📊 Health check: http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "🌐 API endpoints: http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "🔧 Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the simple server
node server-simple.js