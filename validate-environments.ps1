# Environment Validation Script
Write-Host "🔍 Validating Environment Configurations..." -ForegroundColor Cyan

$rootPath = "c:/Users/dell/OneDrive/Desktop/nexttechfusiongadgets"

# Check if environment files exist
Write-Host "`n📁 Checking Environment Files..." -ForegroundColor Yellow

$envFiles = @(
    "frontend/.env.development",
    "frontend/.env.test", 
    "frontend/.env.production",
    "backend/.env.development",
    "backend/.env.test",
    "backend/.env.production"
)

$allFilesExist = $true
foreach ($file in $envFiles) {
    $fullPath = Join-Path $rootPath $file
    if (Test-Path $fullPath) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
        $allFilesExist = $false
    }
}

# Check startup scripts
Write-Host "`n🚀 Checking Startup Scripts..." -ForegroundColor Yellow

$startupScripts = @(
    "start-dev-environment.ps1",
    "start-test-environment.ps1",
    "start-prod-environment.ps1"
)

foreach ($script in $startupScripts) {
    $fullPath = Join-Path $rootPath $script
    if (Test-Path $fullPath) {
        Write-Host "✅ $script exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $script missing" -ForegroundColor Red
        $allFilesExist = $false
    }
}

# Check component files
Write-Host "`n🧩 Checking Environment Components..." -ForegroundColor Yellow

$componentFiles = @(
    "frontend/src/components/EnvironmentBadge.tsx",
    "frontend/src/components/EnvironmentInfo.tsx"
)

foreach ($component in $componentFiles) {
    $fullPath = Join-Path $rootPath $component
    if (Test-Path $fullPath) {
        Write-Host "✅ $component exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $component missing" -ForegroundColor Red
        $allFilesExist = $false
    }
}

# Validate package.json scripts
Write-Host "`n📦 Checking Package.json Scripts..." -ForegroundColor Yellow

$frontendPackage = Join-Path $rootPath "frontend/package.json"
$backendPackage = Join-Path $rootPath "backend/package.json"

if (Test-Path $frontendPackage) {
    $frontendContent = Get-Content $frontendPackage -Raw | ConvertFrom-Json
    $requiredFrontendScripts = @("start:dev", "start:test", "start:prod", "build:dev", "build:test", "build:prod")
    
    foreach ($script in $requiredFrontendScripts) {
        if ($frontendContent.scripts.$script) {
            Write-Host "✅ Frontend script '$script' exists" -ForegroundColor Green
        } else {
            Write-Host "❌ Frontend script '$script' missing" -ForegroundColor Red
            $allFilesExist = $false
        }
    }
}

if (Test-Path $backendPackage) {
    $backendContent = Get-Content $backendPackage -Raw | ConvertFrom-Json
    $requiredBackendScripts = @("start:dev", "start:test", "start:prod")
    
    foreach ($script in $requiredBackendScripts) {
        if ($backendContent.scripts.$script) {
            Write-Host "✅ Backend script '$script' exists" -ForegroundColor Green
        } else {
            Write-Host "❌ Backend script '$script' missing" -ForegroundColor Red
            $allFilesExist = $false
        }
    }
}

# Summary
Write-Host "`n📊 Validation Summary" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

if ($allFilesExist) {
    Write-Host "✅ All environment configurations are properly set up!" -ForegroundColor Green
    Write-Host "`n🚀 You can now use the following commands:" -ForegroundColor Yellow
    Write-Host "   • ./start-dev-environment.ps1   (Development)" -ForegroundColor Green
    Write-Host "   • ./start-test-environment.ps1   (Testing)" -ForegroundColor Yellow  
    Write-Host "   • ./start-prod-environment.ps1   (Production)" -ForegroundColor Red
    Write-Host "`n📋 See environment-config.md for detailed information" -ForegroundColor Cyan
} else {
    Write-Host "❌ Some environment configurations are missing!" -ForegroundColor Red
    Write-Host "Please check the missing files and run this script again." -ForegroundColor Yellow
}

Write-Host "`n🔍 Environment Features:" -ForegroundColor Cyan
Write-Host "• Visual badges to distinguish environments" -ForegroundColor White
Write-Host "• Environment-specific configurations" -ForegroundColor White
Write-Host "• Separate databases for each environment" -ForegroundColor White
Write-Host "• Debug information panel" -ForegroundColor White
Write-Host "• Environment-aware API endpoints" -ForegroundColor White