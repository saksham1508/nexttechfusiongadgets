# Redis Setup Script for Windows
Write-Host "🔴 Setting up Redis for NextTechFusionGadgets..." -ForegroundColor Red

Write-Host "📋 Redis Setup Options:" -ForegroundColor Yellow
Write-Host "1. Use Redis Cloud (Recommended for development)" -ForegroundColor White
Write-Host "2. Install Redis on Windows Subsystem for Linux (WSL)" -ForegroundColor White
Write-Host "3. Use Docker Desktop" -ForegroundColor White
Write-Host "4. Skip Redis (will disable caching features)" -ForegroundColor White

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "🌐 Setting up Redis Cloud..." -ForegroundColor Cyan
        Write-Host "1. Go to https://redis.com/try-free/" -ForegroundColor White
        Write-Host "2. Create a free account" -ForegroundColor White
        Write-Host "3. Create a new database" -ForegroundColor White
        Write-Host "4. Copy the connection details to your .env file" -ForegroundColor White
        Write-Host "   REDIS_HOST=your-redis-host" -ForegroundColor Gray
        Write-Host "   REDIS_PORT=your-redis-port" -ForegroundColor Gray
        Write-Host "   REDIS_PASSWORD=your-redis-password" -ForegroundColor Gray
    }
    "2" {
        Write-Host "🐧 Setting up Redis with WSL..." -ForegroundColor Cyan
        Write-Host "1. Install WSL: wsl --install" -ForegroundColor White
        Write-Host "2. Install Ubuntu from Microsoft Store" -ForegroundColor White
        Write-Host "3. In WSL terminal, run:" -ForegroundColor White
        Write-Host "   sudo apt update" -ForegroundColor Gray
        Write-Host "   sudo apt install redis-server" -ForegroundColor Gray
        Write-Host "   sudo service redis-server start" -ForegroundColor Gray
        Write-Host "4. Test: redis-cli ping" -ForegroundColor White
    }
    "3" {
        Write-Host "🐳 Setting up Redis with Docker..." -ForegroundColor Cyan
        Write-Host "1. Install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor White
        Write-Host "2. Run: docker run -d -p 6379:6379 --name redis redis:alpine" -ForegroundColor Gray
        Write-Host "3. Test: docker exec -it redis redis-cli ping" -ForegroundColor White
        
        # Create docker-compose file for easy management
        @"
version: '3.8'
services:
  redis:
    image: redis:alpine
    container_name: nexttechfusion-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes

  mongodb:
    image: mongo:latest
    container_name: nexttechfusion-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped
    environment:
      MONGO_INITDB_DATABASE: nexttechfusiongadgets

volumes:
  redis_data:
  mongo_data:
"@ | Out-File -FilePath "docker-compose.yml" -Encoding UTF8
        
        Write-Host "✅ Docker Compose file created. Run: docker-compose up -d" -ForegroundColor Green
    }
    "4" {
        Write-Host "⚠️ Skipping Redis setup. Caching features will be disabled." -ForegroundColor Yellow
        Write-Host "Update your .env file:" -ForegroundColor White
        Write-Host "   REDIS_HOST=" -ForegroundColor Gray
        Write-Host "   ENABLE_CACHE=false" -ForegroundColor Gray
    }
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host "`n✅ Redis setup instructions provided!" -ForegroundColor Green