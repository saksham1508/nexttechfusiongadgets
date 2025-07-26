# Environment Configuration Guide

## Overview
This project now supports three distinct environments with visual and functional differences:

## Environments

### 🟢 Development Environment
- **Visual Indicator**: Green badge in top-right corner
- **Title Prefix**: "Development - NextTechFusionGadgets..."
- **API URL**: http://localhost:5000/api
- **Database**: nexttechfusion_dev
- **Features**: 
  - Full debugging enabled
  - Redux DevTools enabled
  - Console logs enabled
  - Mock payments enabled
  - Debug routes available

### 🟡 Test Environment  
- **Visual Indicator**: Orange/Yellow badge in top-right corner
- **Title Prefix**: "Testing - NextTechFusionGadgets..."
- **API URL**: http://localhost:3001/api
- **Database**: nexttechfusion_test
- **Features**:
  - Testing mode enabled
  - Isolated test database
  - Mock payments enabled
  - Database reset on start
  - Test routes available

### 🔴 Production Environment
- **Visual Indicator**: Red badge (hidden by default)
- **Title Prefix**: "Production - NextTechFusionGadgets..."
- **API URL**: https://api.nexttechfusiongadgets.com
- **Database**: nexttechfusion_prod
- **Features**:
  - Debug mode disabled
  - Redux DevTools disabled
  - Console logs disabled
  - Live payments enabled
  - Enhanced security

## Quick Start Commands

### Development
```bash
# Windows PowerShell
./start-dev-environment.ps1

# Manual start
cd frontend && npm run start:dev
cd backend && npm run start:dev
```

### Test
```bash
# Windows PowerShell
./start-test-environment.ps1

# Manual start
cd frontend && npm run start:test
cd backend && npm run start:test
```

### Production
```bash
# Windows PowerShell
./start-prod-environment.ps1

# Manual start
cd frontend && npm run build:prod && npx serve -s build
cd backend && npm run start:prod
```

## Visual Distinctions

1. **Environment Badge**: Colored badge in top-right corner
2. **Browser Title**: Environment prefix in page title
3. **Border Color**: Top border color matches environment
4. **Environment Info Panel**: Debug panel (bottom-left) in dev/test modes

## Configuration Files

### Frontend Environment Files
- `.env.development` - Development settings
- `.env.test` - Test settings  
- `.env.production` - Production settings

### Backend Environment Files
- `.env.development` - Development settings
- `.env.test` - Test settings
- `.env.production` - Production settings

## Environment Variables

### Frontend (REACT_APP_*)
- `REACT_APP_ENV` - Environment name
- `REACT_APP_ENV_NAME` - Display name
- `REACT_APP_ENV_COLOR` - Badge color
- `REACT_APP_ENV_BADGE` - Show/hide badge
- `REACT_APP_DEBUG_MODE` - Enable debug features
- `REACT_APP_MOCK_PAYMENTS` - Enable mock payments

### Backend
- `NODE_ENV` - Node environment
- `ENV_NAME` - Display name
- `PORT` - Server port
- `MONGODB_URI` - Database connection
- `ENABLE_DEBUG_ROUTES` - Debug endpoints

## Safety Features

1. **Production Warnings**: Clear visual indicators for production
2. **Environment Isolation**: Separate databases and configurations
3. **Feature Toggles**: Environment-specific feature enabling/disabling
4. **Debug Information**: Detailed environment info in dev/test modes

## Best Practices

1. Always verify environment before making changes
2. Use environment-specific startup scripts
3. Check the environment badge before testing
4. Review environment info panel for configuration details
5. Never use production credentials in dev/test environments