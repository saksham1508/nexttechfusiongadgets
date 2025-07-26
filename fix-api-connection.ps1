# Fix API Connection Issues Script
Write-Host "🔧 Fixing API Connection Issues..." -ForegroundColor Yellow

Write-Host "`n1. 🔍 Checking Backend Server Status..." -ForegroundColor Cyan

# Check if backend server is running
$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend server is running on port 5000" -ForegroundColor Green
    $backendRunning = $true
} catch {
    Write-Host "❌ Backend server is not running on port 5000" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Check alternative ports
if (-not $backendRunning) {
    $ports = @(3001, 8000, 8080, 5001)
    foreach ($port in $ports) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$port" -Method GET -TimeoutSec 2 -ErrorAction Stop
            Write-Host "✅ Found server running on port $port" -ForegroundColor Green
            $backendRunning = $true
            break
        } catch {
            # Continue checking other ports
        }
    }
}

Write-Host "`n2. 🚀 Starting Backend Server..." -ForegroundColor Cyan

if (-not $backendRunning) {
    Write-Host "Starting backend server..." -ForegroundColor White
    
    # Check if backend directory exists
    if (Test-Path "backend") {
        Set-Location backend
        
        # Check if package.json exists
        if (Test-Path "package.json") {
            Write-Host "Installing backend dependencies..." -ForegroundColor White
            npm install
            
            Write-Host "Starting backend server..." -ForegroundColor White
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
            
            Write-Host "✅ Backend server starting in new window..." -ForegroundColor Green
            Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        } else {
            Write-Host "❌ package.json not found in backend directory" -ForegroundColor Red
        }
        
        Set-Location ..
    } else {
        Write-Host "❌ Backend directory not found" -ForegroundColor Red
    }
}

Write-Host "`n3. 🔧 Creating Robust API Service..." -ForegroundColor Cyan

# Create improved API service with error handling
@"
// Enhanced API Service with Error Handling
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isOnline = true;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  // Check if API is available
  async checkApiStatus() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`\${this.baseURL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        this.isOnline = true;
        return { status: 'online', message: 'API is available' };
      } else {
        this.isOnline = false;
        return { status: 'error', message: `API returned status: \${response.status}` };
      }
    } catch (error) {
      this.isOnline = false;
      
      if (error.name === 'AbortError') {
        return { status: 'timeout', message: 'API request timed out' };
      }
      
      return { 
        status: 'offline', 
        message: 'Backend server is not running. Please start the backend server.',
        error: error.message 
      };
    }
  }

  // Generic API request with retry logic
  async request(endpoint, options = {}) {
    const url = `\${this.baseURL}\${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const requestOptions = { ...defaultOptions, ...options };

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: \${response.status}`);
        }

        const data = await response.json();
        this.isOnline = true;
        return { success: true, data };

      } catch (error) {
        console.warn(`API request attempt \${attempt} failed:`, error.message);
        
        if (attempt === this.retryAttempts) {
          this.isOnline = false;
          return {
            success: false,
            error: error.message,
            isNetworkError: error.name === 'TypeError' && error.message.includes('fetch')
          };
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  // Specific API methods
  async getProducts() {
    return this.request('/products');
  }

  async getUsers() {
    return this.request('/users');
  }

  async getOrders() {
    return this.request('/orders');
  }

  async getPaymentMethods() {
    return this.request('/payment-methods');
  }

  // Health check with user-friendly messages
  async healthCheck() {
    const result = await this.checkApiStatus();
    
    switch (result.status) {
      case 'online':
        return { 
          isHealthy: true, 
          message: '✅ Backend server is running normally',
          status: 'success'
        };
      case 'timeout':
        return { 
          isHealthy: false, 
          message: '⏱️ Backend server is slow to respond',
          status: 'warning',
          suggestion: 'The server might be overloaded. Please wait a moment and try again.'
        };
      case 'offline':
        return { 
          isHealthy: false, 
          message: '❌ Backend server is not running',
          status: 'error',
          suggestion: 'Please start the backend server by running "npm run dev" in the backend directory.'
        };
      default:
        return { 
          isHealthy: false, 
          message: '⚠️ Backend server returned an error',
          status: 'error',
          suggestion: 'Please check the backend server logs for more information.'
        };
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
"@ | Out-File -FilePath "frontend/src/services/apiService.js" -Encoding UTF8

Write-Host "✅ Enhanced API service created" -ForegroundColor Green

Write-Host "`n4. 🛡️ Creating API Status Component..." -ForegroundColor Cyan

# Create API status component
@"
import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const ApiStatusIndicator = () => {
  const [apiStatus, setApiStatus] = useState({
    isHealthy: null,
    message: 'Checking connection...',
    status: 'loading'
  });

  const checkApiHealth = async () => {
    const health = await apiService.healthCheck();
    setApiStatus(health);
  };

  useEffect(() => {
    checkApiHealth();
    
    // Check API health every 30 seconds
    const interval = setInterval(checkApiHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (apiStatus.status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (apiStatus.status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '🔄';
    }
  };

  if (apiStatus.isHealthy === true) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg shadow-md">
          <div className={`w-2 h-2 rounded-full \${getStatusColor()} mr-2 animate-pulse`}></div>
          <span className="text-sm font-medium">API Connected</span>
        </div>
      </div>
    );
  }

  if (apiStatus.isHealthy === false) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">{getStatusIcon()}</span>
            <h3 className="text-lg font-semibold text-gray-900">
              Connection Issue
            </h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            {apiStatus.message}
          </p>
          
          {apiStatus.suggestion && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
              <p className="text-sm text-blue-700">
                <strong>Suggestion:</strong> {apiStatus.suggestion}
              </p>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={checkApiHealth}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Retry Connection
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Refresh Page
            </button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            Make sure the backend server is running on port 5000
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg shadow-md">
        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2 animate-pulse"></div>
        <span className="text-sm font-medium">Connecting...</span>
      </div>
    </div>
  );
};

export default ApiStatusIndicator;
"@ | Out-File -FilePath "frontend/src/components/ApiStatusIndicator.jsx" -Encoding UTF8

Write-Host "✅ API status component created" -ForegroundColor Green

Write-Host "`n5. 🔧 Creating Backend Health Endpoint..." -ForegroundColor Cyan

# Create health endpoint for backend
@"
const express = require('express');
const router = express.Router();

// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
router.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    status: 'healthy',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  try {
    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.message = error.message;
    healthCheck.status = 'error';
    res.status(503).json(healthCheck);
  }
});

// @desc    Detailed system status
// @route   GET /api/health/detailed
// @access  Public
router.get('/detailed', async (req, res) => {
  const status = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    services: {}
  };

  try {
    // Check database connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      status.services.database = { status: 'connected', message: 'MongoDB is connected' };
    } else {
      status.services.database = { status: 'disconnected', message: 'MongoDB is not connected' };
      status.status = 'degraded';
    }

    // Check Redis connection (if available)
    try {
      const cacheService = require('../services/cacheService');
      if (cacheService.isConnected) {
        status.services.cache = { status: 'connected', message: 'Redis is connected' };
      } else {
        status.services.cache = { status: 'disconnected', message: 'Redis is not connected' };
      }
    } catch (error) {
      status.services.cache = { status: 'not_configured', message: 'Redis is not configured' };
    }

    // System metrics
    status.system = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version
    };

    res.status(200).json(status);
  } catch (error) {
    status.status = 'error';
    status.error = error.message;
    res.status(503).json(status);
  }
});

module.exports = router;
"@ | Out-File -FilePath "backend/routes/healthRoutes.js" -Encoding UTF8

Write-Host "✅ Health routes created" -ForegroundColor Green

Write-Host "`n6. 📝 Creating Backend Server Starter..." -ForegroundColor Cyan

# Create a simple backend server if it doesn't exist
@"
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health routes
app.use('/api/health', require('./routes/healthRoutes'));

// Basic routes
app.get('/api', (req, res) => {
  res.json({
    message: 'NextTechFusionGadgets API is running!',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port \${PORT}`);
  console.log(`📊 Health check: http://localhost:\${PORT}/api/health`);
  console.log(`🌐 Environment: \${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
"@ | Out-File -FilePath "backend/server-basic.js" -Encoding UTF8

Write-Host "✅ Basic server template created" -ForegroundColor Green

Write-Host "`n7. 📋 Creating Startup Instructions..." -ForegroundColor Cyan

@"
# 🚀 Quick Start Guide - Fix API Connection

## The Problem
Your React frontend is trying to connect to a backend API server that isn't running.

## Quick Fix Steps:

### 1. Start Backend Server
```bash
cd backend
npm install
npm run dev
```

If you don't have a server.js file, use the basic server:
```bash
node server-basic.js
```

### 2. Verify Backend is Running
Open http://localhost:5000/api/health in your browser
You should see: {"message": "OK", "status": "healthy"}

### 3. Update Your App.js
Add the API status indicator to your main App component:

```jsx
import ApiStatusIndicator from './components/ApiStatusIndicator';

function App() {
  return (
    <div className="App">
      <ApiStatusIndicator />
      {/* Your existing app content */}
    </div>
  );
}
```

### 4. Use the Enhanced API Service
Replace any direct fetch calls with the new apiService:

```jsx
import apiService from './services/apiService';

// Instead of:
// fetch('http://localhost:5000/api/products')

// Use:
const result = await apiService.getProducts();
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

## Environment Variables
Make sure your frontend .env file has:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Backend won't start?
1. Check if port 5000 is already in use
2. Try a different port: `PORT=5001 npm run dev`
3. Update REACT_APP_API_URL accordingly

### Still getting errors?
1. Check browser console for specific error messages
2. Verify backend logs for any startup errors
3. Test API endpoints directly in browser or Postman

### CORS Issues?
Make sure your backend has CORS configured:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## Files Created:
- ✅ Enhanced API service with retry logic
- ✅ API status indicator component  
- ✅ Backend health check endpoints
- ✅ Basic server template
- ✅ Error handling and user feedback

Your app will now gracefully handle API connection issues!
"@ | Out-File -FilePath "API_CONNECTION_FIX.md" -Encoding UTF8

Write-Host "✅ Startup guide created" -ForegroundColor Green

Write-Host "`n🎯 Final Steps:" -ForegroundColor Yellow
Write-Host "1. Start your backend server:" -ForegroundColor White
Write-Host "   cd backend && npm run dev" -ForegroundColor Gray
Write-Host "2. Add ApiStatusIndicator to your App.js" -ForegroundColor White
Write-Host "3. Replace direct fetch calls with apiService" -ForegroundColor White
Write-Host "4. Restart your frontend: npm start" -ForegroundColor White

Write-Host "`n✅ API Connection Fix Complete!" -ForegroundColor Green
Write-Host "📄 Files created:" -ForegroundColor Cyan
Write-Host "  - frontend/src/services/apiService.js" -ForegroundColor White
Write-Host "  - frontend/src/components/ApiStatusIndicator.jsx" -ForegroundColor White
Write-Host "  - backend/routes/healthRoutes.js" -ForegroundColor White
Write-Host "  - backend/server-basic.js" -ForegroundColor White
Write-Host "  - API_CONNECTION_FIX.md" -ForegroundColor White

Write-Host "`n🔧 Next: Start your backend server and refresh your frontend!" -ForegroundColor Yellow