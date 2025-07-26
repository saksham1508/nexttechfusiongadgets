# NextTechFusionGadgets - Enhanced Dependencies Installation Script
# This script installs all required dependencies for the enhanced e-commerce platform

Write-Host "🚀 Installing Enhanced Dependencies for NextTechFusionGadgets..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 16+ first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location backend

# Install existing dependencies
npm install

# Install new enhanced dependencies
Write-Host "Installing payment processing dependencies..." -ForegroundColor Cyan
npm install razorpay@^2.9.2
npm install @paypal/checkout-server-sdk@^1.0.3

Write-Host "Installing real-time communication dependencies..." -ForegroundColor Cyan
npm install socket.io@^4.7.4

Write-Host "Installing caching and performance dependencies..." -ForegroundColor Cyan
npm install redis@^4.6.10
npm install bull@^4.12.2

Write-Host "Installing logging and monitoring dependencies..." -ForegroundColor Cyan
npm install winston@^3.11.0

Write-Host "Installing security dependencies..." -ForegroundColor Cyan
npm install helmet@^7.0.0
npm install express-rate-limit@^7.1.5

Write-Host "Installing AI and analytics dependencies..." -ForegroundColor Cyan
npm install openai@^5.8.2

Write-Host "Installing development and testing dependencies..." -ForegroundColor Cyan
npm install --save-dev nodemon@^3.0.1
npm install --save-dev jest@^29.7.0
npm install --save-dev supertest@^6.3.3

Write-Host "✅ Backend dependencies installed successfully!" -ForegroundColor Green

Write-Host "`n📦 Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location ../frontend

# Install existing dependencies
npm install

# Install new enhanced dependencies
Write-Host "Installing enhanced UI dependencies..." -ForegroundColor Cyan
npm install framer-motion@^10.18.0
npm install react-intersection-observer@^9.16.0

Write-Host "Installing payment UI dependencies..." -ForegroundColor Cyan
npm install @stripe/react-stripe-js@^3.7.0
npm install @stripe/stripe-js@^7.4.0
npm install @paypal/react-paypal-js@^8.8.3

Write-Host "Installing state management dependencies..." -ForegroundColor Cyan
npm install @reduxjs/toolkit@^1.9.7
npm install react-redux@^8.1.3
npm install redux-persist@^6.0.0

Write-Host "Installing chart and analytics dependencies..." -ForegroundColor Cyan
npm install recharts@^3.1.0

Write-Host "Installing real-time dependencies..." -ForegroundColor Cyan
npm install socket.io-client@^4.8.1

Write-Host "Installing notification dependencies..." -ForegroundColor Cyan
npm install react-hot-toast@^2.5.2

Write-Host "Installing TypeScript dependencies..." -ForegroundColor Cyan
npm install --save-dev @types/react@^18.3.23
npm install --save-dev @types/react-dom@^18.3.7
npm install --save-dev @types/node@^24.0.10

Write-Host "✅ Frontend dependencies installed successfully!" -ForegroundColor Green

# Return to root directory
Set-Location ..

Write-Host "`n🔧 Setting up environment files..." -ForegroundColor Yellow

# Create enhanced .env file for backend if it doesn't exist
if (-not (Test-Path "backend/.env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Cyan
    @"
# Database
MONGODB_URI=mongodb://localhost:27017/nexttechfusiongadgets
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_51234567890abcdef
STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdef
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef

RAZORPAY_KEY_ID=rzp_test_1234567890abcdef
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

PAYPAL_CLIENT_ID=AYourPayPalClientId1234567890
PAYPAL_CLIENT_SECRET=EYourPayPalClientSecret1234567890
PAYPAL_MODE=sandbox

# Google Pay
GOOGLE_PAY_MERCHANT_ID=your_google_pay_merchant_id
GOOGLE_PAY_ENVIRONMENT=TEST

# UPI
UPI_MERCHANT_ID=your_upi_merchant_id

# Redis (for caching and sessions)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# AI Services
OPENAI_API_KEY=sk-your-openai-api-key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Security
ENCRYPTION_KEY=your-32-character-encryption-key-here
CORS_ORIGIN=http://localhost:3000

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Monitoring
LOG_LEVEL=info
ENABLE_MONITORING=true
"@ | Out-File -FilePath "backend/.env" -Encoding UTF8
    Write-Host "✅ Backend .env file created" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend .env file already exists" -ForegroundColor Yellow
}

# Create enhanced .env file for frontend if it doesn't exist
if (-not (Test-Path "frontend/.env")) {
    Write-Host "Creating frontend .env file..." -ForegroundColor Cyan
    @"
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Payment Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdef
REACT_APP_RAZORPAY_KEY_ID=rzp_test_1234567890abcdef
REACT_APP_PAYPAL_CLIENT_ID=AYourPayPalClientId1234567890
REACT_APP_GOOGLE_PAY_ENVIRONMENT=TEST
REACT_APP_GOOGLE_PAY_MERCHANT_ID=your_google_pay_merchant_id

# App Configuration
REACT_APP_NAME=NextTechFusionGadgets
REACT_APP_VERSION=2.0.0
REACT_APP_ENVIRONMENT=development

# Features
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_CHAT=true

# Google Services
REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Social Login
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
"@ | Out-File -FilePath "frontend/.env" -Encoding UTF8
    Write-Host "✅ Frontend .env file created" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend .env file already exists" -ForegroundColor Yellow
}

Write-Host "`n📁 Creating necessary directories..." -ForegroundColor Yellow

# Create logs directory
if (-not (Test-Path "backend/logs")) {
    New-Item -ItemType Directory -Path "backend/logs"
    Write-Host "✅ Created backend/logs directory" -ForegroundColor Green
}

# Create uploads directory
if (-not (Test-Path "backend/uploads")) {
    New-Item -ItemType Directory -Path "backend/uploads"
    Write-Host "✅ Created backend/uploads directory" -ForegroundColor Green
}

Write-Host "`n🔧 Setting up development scripts..." -ForegroundColor Yellow

# Update package.json scripts if needed
Write-Host "Updating package.json scripts..." -ForegroundColor Cyan

Write-Host "`n✅ Enhanced Dependencies Installation Complete!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update the .env files with your actual API keys and configuration" -ForegroundColor White
Write-Host "2. Make sure MongoDB is running on your system" -ForegroundColor White
Write-Host "3. Make sure Redis is running for caching (optional but recommended)" -ForegroundColor White
Write-Host "4. Run 'npm run dev' in the backend directory to start the server" -ForegroundColor White
Write-Host "5. Run 'npm start' in the frontend directory to start the React app" -ForegroundColor White

Write-Host "`n🚀 Your enhanced e-commerce platform is ready for development!" -ForegroundColor Green

Write-Host "`n📚 New Features Added:" -ForegroundColor Cyan
Write-Host "• Enhanced Google Pay integration with retry logic and error handling" -ForegroundColor White
Write-Host "• AI-powered payment failure analysis and recommendations" -ForegroundColor White
Write-Host "• Advanced security monitoring and fraud detection" -ForegroundColor White
Write-Host "• Real-time payment analytics and monitoring dashboard" -ForegroundColor White
Write-Host "• Redis caching for improved performance" -ForegroundColor White
Write-Host "• Enhanced payment method management with risk scoring" -ForegroundColor White
Write-Host "• Comprehensive logging and monitoring system" -ForegroundColor White
Write-Host "• Rate limiting and security headers" -ForegroundColor White

Write-Host "`n⚠️  Important Security Notes:" -ForegroundColor Red
Write-Host "• Change all default API keys and secrets in production" -ForegroundColor White
Write-Host "• Enable HTTPS in production" -ForegroundColor White
Write-Host "• Set up proper firewall rules" -ForegroundColor White
Write-Host "• Regularly update dependencies for security patches" -ForegroundColor White
Write-Host "• Monitor logs for suspicious activities" -ForegroundColor White