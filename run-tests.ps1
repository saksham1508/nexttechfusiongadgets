<#
.SYNOPSIS
    Comprehensive Test Suite for NextTechFusionGadgets

.DESCRIPTION
    This script runs a complete test suite including:
    - Backend unit and integration tests
    - Frontend unit tests and build
    - API endpoint testing
    - Database connectivity tests
    - Payment gateway integration tests
    - Security and performance tests

.PARAMETER SkipSlowTests
    Skip performance and integration tests for faster execution

.EXAMPLE
    .\run-tests.ps1
    Run all tests

.EXAMPLE
    .\run-tests.ps1 -SkipSlowTests
    Run only fast tests
#>

param(
    [switch]$SkipSlowTests = $false
)

# Comprehensive Test Suite for NextTechFusionGadgets
Write-Host "Running Comprehensive Test Suite..." -ForegroundColor Green

if ($SkipSlowTests) {
    Write-Host "Fast mode enabled - skipping slow tests" -ForegroundColor Yellow
}

# Function to run tests and capture results
function Run-TestSuite {
    param($TestName, $Command, $Directory)
    
    Write-Host "`nRunning $TestName..." -ForegroundColor Yellow
    
    if ($Directory) {
        Push-Location $Directory
    }
    
    try {
        $result = Invoke-Expression $Command
        if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq $null) {
            Write-Host "$TestName passed!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "$TestName failed with exit code: $LASTEXITCODE" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "$TestName failed with error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    } finally {
        if ($Directory) {
            Pop-Location
        }
    }
}

$testResults = @{}

# 1. Backend Unit Tests
$testResults["Backend Unit Tests"] = Run-TestSuite "Backend Unit Tests" "npm test" "backend"

# 2. Backend Integration Tests
if (-not $SkipSlowTests) {
    $testResults["Backend Integration Tests"] = Run-TestSuite "Backend Integration Tests" "npm run test:integration" "backend"
} else {
    Write-Host "Skipping Backend Integration Tests (slow test)" -ForegroundColor Yellow
    $testResults["Backend Integration Tests"] = $null
}

# 3. Frontend Unit Tests
$testResults["Frontend Unit Tests"] = Run-TestSuite "Frontend Unit Tests" "npm test -- --watchAll=false" "frontend"

# 4. API Endpoint Tests
Write-Host "`nTesting API Endpoints..." -ForegroundColor Yellow
$apiTests = @(
    @{ Name = "Health Check"; Url = "http://localhost:5000/api/health" },
    @{ Name = "User Registration"; Url = "http://localhost:5000/api/auth/register"; Method = "POST" },
    @{ Name = "Payment Methods"; Url = "http://localhost:5000/api/payment-methods" },
    @{ Name = "Products"; Url = "http://localhost:5000/api/products" }
)

foreach ($test in $apiTests) {
    try {
        if ($test.Method -eq "POST") {
            $response = Invoke-RestMethod -Uri $test.Url -Method POST -ContentType "application/json" -Body '{"test": true}' -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $test.Url -ErrorAction Stop
        }
        Write-Host "$($test.Name) endpoint is working" -ForegroundColor Green
        $testResults[$test.Name] = $true
    } catch {
        Write-Host "$($test.Name) endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
        $testResults[$test.Name] = $false
    }
}

# 5. Database Connection Test
Write-Host "`nTesting Database Connection..." -ForegroundColor Yellow
try {
    $mongoTest = & mongo --eval "db.runCommand('ping')" nexttechfusiongadgets 2>&1
    if ($mongoTest -match "ok.*1") {
        Write-Host "MongoDB connection successful" -ForegroundColor Green
        $testResults["MongoDB Connection"] = $true
    } else {
        Write-Host "MongoDB connection failed" -ForegroundColor Red
        $testResults["MongoDB Connection"] = $false
    }
} catch {
    Write-Host "MongoDB connection test failed: $_" -ForegroundColor Red
    $testResults["MongoDB Connection"] = $false
}

# 6. Redis Connection Test (if enabled)
Write-Host "`nTesting Redis Connection..." -ForegroundColor Yellow
try {
    $redisTest = & redis-cli ping 2>&1
    if ($redisTest -eq "PONG") {
        Write-Host "Redis connection successful" -ForegroundColor Green
        $testResults["Redis Connection"] = $true
    } else {
        Write-Host "Redis connection failed" -ForegroundColor Red
        $testResults["Redis Connection"] = $false
    }
} catch {
    Write-Host "Redis not available (optional)" -ForegroundColor Yellow
    $testResults["Redis Connection"] = $null
}

# 7. Payment Gateway Tests
Write-Host "`nTesting Payment Gateways..." -ForegroundColor Yellow

# Test Stripe
try {
    $stripeTest = Invoke-RestMethod -Uri "http://localhost:5000/api/payment-methods/stripe/test" -ErrorAction Stop
    Write-Host "Stripe integration working" -ForegroundColor Green
    $testResults["Stripe Integration"] = $true
} catch {
    Write-Host "Stripe integration failed" -ForegroundColor Red
    $testResults["Stripe Integration"] = $false
}

# Test Razorpay
try {
    $razorpayTest = Invoke-RestMethod -Uri "http://localhost:5000/api/payment-methods/razorpay/test" -ErrorAction Stop
    Write-Host "Razorpay integration working" -ForegroundColor Green
    $testResults["Razorpay Integration"] = $true
} catch {
    Write-Host "Razorpay integration failed" -ForegroundColor Red
    $testResults["Razorpay Integration"] = $false
}

# 8. Security Tests
Write-Host "`nRunning Security Tests..." -ForegroundColor Yellow

# Test rate limiting
try {
    for ($i = 1; $i -le 10; $i++) {
        try {
            Invoke-RestMethod -Uri "http://localhost:5000/api/test-rate-limit" -ErrorAction Stop
        } catch {
            if ($_.Exception.Response.StatusCode -eq 429) {
                Write-Host "Rate limiting is working (triggered after $i requests)" -ForegroundColor Green
                $testResults["Rate Limiting"] = $true
                break
            } else {
                throw
            }
        }
    }
    # If we get here, rate limiting didn't trigger
    if (-not $testResults.ContainsKey("Rate Limiting")) {
        Write-Host "Rate limiting may not be working properly" -ForegroundColor Yellow
        $testResults["Rate Limiting"] = $false
    }
} catch {
    Write-Host "Rate limiting test failed: $($_.Exception.Message)" -ForegroundColor Red
    $testResults["Rate Limiting"] = $false
}

# 9. Performance Tests
if (-not $SkipSlowTests) {
    Write-Host "`nRunning Performance Tests..." -ForegroundColor Yellow

    $performanceTests = @(
        @{ Name = "API Response Time"; Url = "http://localhost:5000/api/products"; MaxTime = 2000 },
        @{ Name = "Database Query Time"; Url = "http://localhost:5000/api/users/me"; MaxTime = 1000 }
    )

    foreach ($test in $performanceTests) {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        try {
            Invoke-RestMethod -Uri $test.Url -ErrorAction Stop
            $stopwatch.Stop()
            $responseTime = $stopwatch.ElapsedMilliseconds
            
            if ($responseTime -le $test.MaxTime) {
                Write-Host "$($test.Name): ${responseTime}ms (within $($test.MaxTime)ms limit)" -ForegroundColor Green
                $testResults[$test.Name] = $true
            } else {
                Write-Host "$($test.Name): ${responseTime}ms (exceeds $($test.MaxTime)ms limit)" -ForegroundColor Yellow
                $testResults[$test.Name] = $false
            }
        } catch {
            Write-Host "$($test.Name) failed: $($_.Exception.Message)" -ForegroundColor Red
            $testResults[$test.Name] = $false
        }
    }
} else {
    Write-Host "`nSkipping Performance Tests (slow tests)" -ForegroundColor Yellow
    $testResults["API Response Time"] = $null
    $testResults["Database Query Time"] = $null
}

# 10. Frontend Build Test
Write-Host "`nTesting Frontend Build..." -ForegroundColor Yellow
$testResults["Frontend Build"] = Run-TestSuite "Frontend Build" "npm run build" "frontend"

# Generate Test Report
Write-Host "`nTest Results Summary:" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

$passedTests = 0
$failedTests = 0
$skippedTests = 0

foreach ($test in $testResults.GetEnumerator()) {
    switch ($test.Value) {
        $true { 
            Write-Host "$($test.Key): PASSED" -ForegroundColor Green
            $passedTests++
        }
        $false { 
            Write-Host "$($test.Key): FAILED" -ForegroundColor Red
            $failedTests++
        }
        $null { 
            Write-Host "$($test.Key): SKIPPED" -ForegroundColor Yellow
            $skippedTests++
        }
    }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host "Skipped: $skippedTests" -ForegroundColor Yellow

# Generate detailed report file
$reportContent = @"
# Test Report - $(Get-Date)

## Summary
- **Passed**: $passedTests
- **Failed**: $failedTests  
- **Skipped**: $skippedTests

## Detailed Results
"@

foreach ($test in $testResults.GetEnumerator()) {
    $status = switch ($test.Value) {
        $true { "PASSED" }
        $false { "FAILED" }
        $null { "SKIPPED" }
    }
    $reportContent += "`n- **$($test.Key)**: $status"
}

$reportContent | Out-File -FilePath "test-report.md" -Encoding UTF8

Write-Host "`nDetailed report saved to: test-report.md" -ForegroundColor Cyan

if ($failedTests -eq 0) {
    Write-Host "`nAll critical tests passed! Your application is ready for the next phase." -ForegroundColor Green
} else {
    Write-Host "`nSome tests failed. Please review and fix the issues before proceeding." -ForegroundColor Yellow
}

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Fix any failed tests" -ForegroundColor White
Write-Host "2. Run security audit: npm audit" -ForegroundColor White
Write-Host "3. Performance optimization" -ForegroundColor White
Write-Host "4. Deploy to staging environment" -ForegroundColor White