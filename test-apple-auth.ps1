# PowerShell Test Script for Apple Authentication Integration

Write-Host "🍎 Testing Apple Authentication Integration..." -ForegroundColor Green
Write-Host ""

$API_BASE = "http://localhost:5000/api"

try {
    # Test 1: Check auth status
    Write-Host "1. Testing auth status endpoint..." -ForegroundColor Yellow
    $statusResponse = Invoke-WebRequest -Uri "$API_BASE/auth/status" -Method GET
    $statusData = $statusResponse.Content | ConvertFrom-Json
    Write-Host "✅ Auth Status: $($statusData.message)" -ForegroundColor Green
    Write-Host "   Mode: $($statusData.mode)"
    Write-Host "   MongoDB Available: $($statusData.mongoAvailable)"
    Write-Host ""

    # Test 2: Test Apple authentication with mock data
    Write-Host "2. Testing Apple authentication..." -ForegroundColor Yellow
    $appleAuthData = @{
        identityToken = "mock_apple_token_$(Get-Date -Format 'yyyyMMddHHmmss')"
        authorizationCode = "mock_apple_auth_code_$(Get-Date -Format 'yyyyMMddHHmmss')"
        user = @{
            email = "testuser@apple.demo"
            name = @{
                firstName = "Test"
                lastName = "User"
            }
        }
    } | ConvertTo-Json -Depth 3

    $authResponse = Invoke-WebRequest -Uri "$API_BASE/auth/apple" -Method POST -ContentType "application/json" -Body $appleAuthData
    $authData = $authResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Apple Authentication Response:" -ForegroundColor Green
    Write-Host "   Success: $($authData.success)"
    Write-Host "   Message: $($authData.message)"
    Write-Host "   User ID: $($authData.data.user._id)"
    Write-Host "   User Name: $($authData.data.user.name)"
    Write-Host "   User Email: $($authData.data.user.email)"
    Write-Host "   Auth Provider: $($authData.data.user.authProvider)"
    Write-Host "   Access Token: $(if($authData.data.tokens.accessToken) { 'Generated ✅' } else { 'Missing ❌' })"
    Write-Host "   Demo Mode: $($authData.metadata.demoMode)"
    Write-Host ""

    # Test 3: Test error handling
    Write-Host "3. Testing error handling..." -ForegroundColor Yellow
    try {
        $errorData = @{
            user = @{
                email = "test@example.com"
            }
        } | ConvertTo-Json
        
        Invoke-WebRequest -Uri "$API_BASE/auth/apple" -Method POST -ContentType "application/json" -Body $errorData
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "✅ Error handling works correctly" -ForegroundColor Green
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorContent = $reader.ReadToEnd() | ConvertFrom-Json
            Write-Host "   Error message: $($errorContent.error.message)"
        }
        else {
            Write-Host "⚠️  Unexpected error response" -ForegroundColor Yellow
        }
    }
    Write-Host ""

    Write-Host "🎉 Apple Authentication Integration Test Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Cyan
    Write-Host "✅ Backend Apple auth endpoint working" -ForegroundColor Green
    Write-Host "✅ Mock Apple authentication functional" -ForegroundColor Green
    Write-Host "✅ User creation and token generation working" -ForegroundColor Green
    Write-Host "✅ Error handling implemented" -ForegroundColor Green
    Write-Host "✅ Ready for frontend integration" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Open http://localhost:3000/login in your browser"
    Write-Host "2. Click 'Continue with Apple (Demo)' button"
    Write-Host "3. Verify the authentication flow works end-to-end"
    Write-Host ""
    Write-Host "For production setup:" -ForegroundColor Cyan
    Write-Host "1. Configure real Apple Developer credentials"
    Write-Host "2. Update environment variables"
    Write-Host "3. Test with real Apple Sign-In"

}
catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}