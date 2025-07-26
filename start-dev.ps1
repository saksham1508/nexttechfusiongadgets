# PowerShell script to start both frontend and backend servers
Write-Host "Starting NextTechFusionGadgets Development Servers..." -ForegroundColor Green

# Start backend server in background
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:/Users/dell/OneDrive/Desktop/nexttechfusiongadgets/backend'; npm start"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server in background
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:/Users/dell/OneDrive/Desktop/nexttechfusiongadgets/frontend'; npm start"

Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")