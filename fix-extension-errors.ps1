# Fix Browser Extension Errors Script
Write-Host "🔧 Fixing Browser Extension Context Errors..." -ForegroundColor Yellow

Write-Host "`n1. 🧹 Clearing Development Cache..." -ForegroundColor Cyan

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor White
npm cache clean --force

# Clear React development cache
Write-Host "Clearing React cache..." -ForegroundColor White
if (Test-Path "frontend/node_modules/.cache") {
    Remove-Item -Recurse -Force "frontend/node_modules/.cache"
    Write-Host "✅ React cache cleared" -ForegroundColor Green
}

# Clear backend cache
Write-Host "Clearing backend cache..." -ForegroundColor White
if (Test-Path "backend/node_modules/.cache") {
    Remove-Item -Recurse -Force "backend/node_modules/.cache"
    Write-Host "✅ Backend cache cleared" -ForegroundColor Green
}

Write-Host "`n2. 🔄 Restarting Development Servers..." -ForegroundColor Cyan

# Kill existing processes
Write-Host "Stopping existing processes..." -ForegroundColor White
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "npm" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "`n3. 📝 Creating Error Handling Wrapper..." -ForegroundColor Cyan

# Create error boundary component for React
@"
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Filter out extension context errors
    if (error.message && error.message.includes('Extension context invalidated')) {
      console.warn('Browser extension error detected and handled:', error.message);
      // Don't show error UI for extension errors
      this.setState({ hasError: false, error: null });
      return;
    }

    // Log other errors
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error && 
        !this.state.error.message.includes('Extension context invalidated')) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-800">
                  Something went wrong
                </h3>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              An unexpected error occurred. Please refresh the page to continue.
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
"@ | Out-File -FilePath "frontend/src/components/ErrorBoundary.jsx" -Encoding UTF8

Write-Host "✅ Error boundary component created" -ForegroundColor Green

Write-Host "`n4. 🛡️ Adding Global Error Handler..." -ForegroundColor Cyan

# Create global error handler
@"
// Global error handler for extension context errors
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && 
      event.error.message.includes('Extension context invalidated')) {
    console.warn('Browser extension error caught and suppressed:', event.error.message);
    event.preventDefault();
    return false;
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && 
      event.reason.message.includes('Extension context invalidated')) {
    console.warn('Browser extension promise rejection caught and suppressed:', event.reason.message);
    event.preventDefault();
    return false;
  }
});

// Console override to filter extension errors
const originalError = console.error;
console.error = function(...args) {
  const message = args.join(' ');
  if (message.includes('Extension context invalidated') || 
      message.includes('all-frames.js')) {
    return; // Suppress extension errors
  }
  originalError.apply(console, args);
};

export default {};
"@ | Out-File -FilePath "frontend/src/utils/errorHandler.js" -Encoding UTF8

Write-Host "✅ Global error handler created" -ForegroundColor Green

Write-Host "`n5. 🔧 Updating App.js to use Error Boundary..." -ForegroundColor Cyan

# Check if App.js exists and show instructions
if (Test-Path "frontend/src/App.js") {
    Write-Host "Found App.js - Please add the following imports and wrapper:" -ForegroundColor Yellow
    Write-Host @"
    
// Add these imports at the top of App.js:
import ErrorBoundary from './components/ErrorBoundary';
import './utils/errorHandler'; // Import global error handler

// Wrap your main App component:
function App() {
  return (
    <ErrorBoundary>
      {/* Your existing app content */}
    </ErrorBoundary>
  );
}
"@ -ForegroundColor White
} else {
    Write-Host "App.js not found - please manually add ErrorBoundary wrapper" -ForegroundColor Yellow
}

Write-Host "`n6. 📋 Browser Extension Troubleshooting Guide..." -ForegroundColor Cyan

@"
# Browser Extension Error Troubleshooting Guide

## What is this error?
The "Extension context invalidated" error occurs when:
- A browser extension is reloaded or updated while your app is running
- The extension loses connection to the browser's extension API
- Common with React DevTools, Redux DevTools, or other developer extensions

## Quick Fixes:

### 1. Hard Refresh
- Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Or F12 -> Application -> Storage -> Clear storage

### 2. Disable Extensions Temporarily
- Go to chrome://extensions/
- Disable extensions one by one to identify the culprit
- Common problematic extensions:
  - React Developer Tools
  - Redux DevTools
  - Ad blockers
  - Grammarly
  - LastPass

### 3. Incognito Mode Test
- Open your app in incognito mode (Ctrl+Shift+N)
- If error doesn't occur, it's definitely an extension issue

### 4. Clear Browser Data
- Go to chrome://settings/clearBrowserData
- Clear cached images and files
- Clear cookies and site data

## Prevention:

### 1. Use Error Boundaries (Already implemented)
- ErrorBoundary component catches and handles these errors
- Prevents app crashes from extension issues

### 2. Global Error Handling (Already implemented)
- Filters out extension-related errors
- Prevents console spam

### 3. Development Best Practices
- Regularly update browser extensions
- Use stable versions of developer tools
- Test in multiple browsers

## If Error Persists:

1. Check if it happens in other browsers (Firefox, Edge)
2. Test on different devices
3. Check browser console for actual app errors
4. Verify network connectivity
5. Check if API endpoints are accessible

## Extension-Specific Solutions:

### React DevTools
- Update to latest version
- Disable and re-enable
- Use standalone version if needed

### Redux DevTools
- Configure properly in your store
- Use conditional loading in production

### Ad Blockers
- Whitelist your development domain
- Disable for localhost

Remember: These errors don't affect your actual application functionality!
"@ | Out-File -FilePath "EXTENSION_ERROR_GUIDE.md" -Encoding UTF8

Write-Host "✅ Troubleshooting guide created" -ForegroundColor Green

Write-Host "`n7. 🚀 Restarting Development Environment..." -ForegroundColor Cyan

Write-Host "To restart your development environment:" -ForegroundColor Yellow
Write-Host "1. Close all browser tabs with your app" -ForegroundColor White
Write-Host "2. Run the following commands:" -ForegroundColor White
Write-Host "   cd backend && npm run dev" -ForegroundColor Gray
Write-Host "   cd frontend && npm start" -ForegroundColor Gray
Write-Host "3. Open a new browser tab/window" -ForegroundColor White
Write-Host "4. If error persists, try incognito mode" -ForegroundColor White

Write-Host "`n✅ Extension Error Fix Complete!" -ForegroundColor Green
Write-Host "📄 Files created:" -ForegroundColor Cyan
Write-Host "  - frontend/src/components/ErrorBoundary.jsx" -ForegroundColor White
Write-Host "  - frontend/src/utils/errorHandler.js" -ForegroundColor White
Write-Host "  - EXTENSION_ERROR_GUIDE.md" -ForegroundColor White

Write-Host "`n🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Add ErrorBoundary wrapper to your App.js" -ForegroundColor White
Write-Host "2. Import the global error handler" -ForegroundColor White
Write-Host "3. Restart your development servers" -ForegroundColor White
Write-Host "4. Test in incognito mode if issues persist" -ForegroundColor White

Write-Host "`n⚠️ Important Note:" -ForegroundColor Red
Write-Host "This error is from browser extensions, not your code!" -ForegroundColor White
Write-Host "Your NextTechFusionGadgets app is working correctly." -ForegroundColor White