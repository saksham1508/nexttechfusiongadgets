# MongoDB Local Installation Guide for Windows

## Method 1: MongoDB Community Server (Recommended)

### Step 1: Download MongoDB
1. Go to https://www.mongodb.com/try/download/community
2. Select:
   - **Version**: 7.0.x (Current)
   - **Platform**: Windows
   - **Package**: msi
3. Click "Download"

### Step 2: Install MongoDB
1. Run the downloaded .msi file
2. Choose "Complete" installation
3. **Important**: Check "Install MongoDB as a Service"
4. **Important**: Check "Install MongoDB Compass" (GUI tool)
5. Complete the installation

### Step 3: Verify Installation
1. Open Command Prompt as Administrator
2. Run: `mongod --version`
3. Should show MongoDB version

### Step 4: Start MongoDB Service
MongoDB should start automatically as a service. If not:
1. Open Services (Win + R → services.msc)
2. Find "MongoDB" service
3. Right-click → Start

### Step 5: Test Connection
```bash
# In Command Prompt
mongosh
# Should connect to MongoDB shell
```

## Method 2: Using Chocolatey (Package Manager)

### Step 1: Install Chocolatey (if not installed)
1. Open PowerShell as Administrator
2. Run:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### Step 2: Install MongoDB
```powershell
choco install mongodb
```

### Step 3: Start MongoDB
```powershell
# Create data directory
mkdir C:\data\db

# Start MongoDB
mongod
```

## Method 3: Portable Installation

### Step 1: Download ZIP
1. Go to https://www.mongodb.com/try/download/community
2. Select "zip" package
3. Extract to `C:\MongoDB`

### Step 2: Setup
1. Create data directory: `C:\data\db`
2. Add to PATH: `C:\MongoDB\bin`

### Step 3: Start MongoDB
```cmd
mongod --dbpath C:\data\db
```

## Verification

### Test Database Connection
```bash
cd d:\intern\nexttechfusiongadgets\backend
npm run test:db
```

### Using MongoDB Compass (GUI)
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Create database: `nexttechfusiongadgets`

## Troubleshooting

### Common Issues

#### Port 27017 Already in Use
```cmd
netstat -ano | findstr :27017
taskkill /PID <PID_NUMBER> /F
```

#### Service Won't Start
1. Check Windows Event Logs
2. Ensure data directory exists: `C:\data\db`
3. Run as Administrator

#### Connection Refused
1. Check if MongoDB service is running
2. Verify firewall settings
3. Check MongoDB logs in Event Viewer

## Next Steps
After installation, your .env file should work with:
```env
MONGO_URI=mongodb://localhost:27017/nexttechfusiongadgets
```