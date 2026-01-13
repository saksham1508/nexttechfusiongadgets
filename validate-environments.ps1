# Environment Validation Script
Write-Host "Validating Environment Configurations..."

$rootPath = "."
$allFilesExist = $true

Write-Host "Checking Environment Files..."

$envFiles = @(
    "frontend/.env.development",
    "frontend/.env.test", 
    "frontend/.env.production",
    "backend/.env.development",
    "backend/.env.test",
    "backend/.env.production"
)

foreach ($file in $envFiles) {
    $fullPath = Join-Path $rootPath $file
    if (Test-Path $fullPath) {
        Write-Host "OK: $file exists"
    } else {
        Write-Host "MISSING: $file"
        $allFilesExist = $false
    }
}

Write-Host "Checking Startup Scripts..."

$startupScripts = @(
    "start-dev-environment.ps1",
    "start-test-environment.ps1",
    "start-prod-environment.ps1"
)

foreach ($script in $startupScripts) {
    $fullPath = Join-Path $rootPath $script
    if (Test-Path $fullPath) {
        Write-Host "OK: $script exists"
    } else {
        Write-Host "MISSING: $script"
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    Write-Host "SUCCESS: All environment configurations are properly set up!"
} else {
    Write-Host "FAILURE: Some environment configurations are missing!"
}
