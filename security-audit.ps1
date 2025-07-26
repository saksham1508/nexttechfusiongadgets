# Security Audit Script for NextTechFusionGadgets
Write-Host "🔒 Running Security Audit..." -ForegroundColor Red

Write-Host "`n1. 📦 Checking for vulnerable dependencies..." -ForegroundColor Yellow

# Backend dependency audit
Write-Host "Backend dependencies:" -ForegroundColor Cyan
Set-Location backend
npm audit --audit-level=moderate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Vulnerabilities found in backend dependencies" -ForegroundColor Yellow
    Write-Host "Run: npm audit fix" -ForegroundColor White
}

# Frontend dependency audit
Write-Host "`nFrontend dependencies:" -ForegroundColor Cyan
Set-Location ../frontend
npm audit --audit-level=moderate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Vulnerabilities found in frontend dependencies" -ForegroundColor Yellow
    Write-Host "Run: npm audit fix" -ForegroundColor White
}

Set-Location ..

Write-Host "`n2. 🔐 Environment Security Check..." -ForegroundColor Yellow

# Check for sensitive data in environment files
$envFiles = @("backend/.env", "frontend/.env")
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Host "Checking $file..." -ForegroundColor Cyan
        $content = Get-Content $file
        
        # Check for default/weak values
        $weakPatterns = @(
            @{ Pattern = "JWT_SECRET=your-super-secret"; Message = "Weak JWT secret detected" },
            @{ Pattern = "ENCRYPTION_KEY=your-32-character"; Message = "Default encryption key detected" },
            @{ Pattern = "PASSWORD=password"; Message = "Default password detected" },
            @{ Pattern = "SECRET=secret"; Message = "Default secret detected" }
        )
        
        foreach ($pattern in $weakPatterns) {
            if ($content -match $pattern.Pattern) {
                Write-Host "❌ $($pattern.Message) in $file" -ForegroundColor Red
            }
        }
        
        # Check for missing critical variables
        $requiredVars = @("JWT_SECRET", "MONGODB_URI", "NODE_ENV")
        foreach ($var in $requiredVars) {
            if (-not ($content -match "$var=")) {
                Write-Host "⚠️ Missing $var in $file" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host "`n3. 🌐 HTTPS and Security Headers Check..." -ForegroundColor Yellow

# Create security headers test
@"
const express = require('express');
const helmet = require('helmet');

const app = express();

// Security headers check
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.get('/security-test', (req, res) => {
  res.json({ 
    message: 'Security headers applied',
    headers: res.getHeaders()
  });
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Security test server running on port ${port}`);
});
"@ | Out-File -FilePath "security-test.js" -Encoding UTF8

Write-Host "✅ Security test server created" -ForegroundColor Green

Write-Host "`n4. 🔍 Code Security Scan..." -ForegroundColor Yellow

# Check for common security issues in code
$securityIssues = @()

# Check for hardcoded secrets
$codeFiles = Get-ChildItem -Recurse -Include "*.js", "*.ts", "*.jsx", "*.tsx" | Where-Object { $_.FullName -notmatch "node_modules" }

foreach ($file in $codeFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Check for hardcoded API keys
    if ($content -match "(sk_|pk_|rzp_|AIza)[a-zA-Z0-9]{20,}") {
        $securityIssues += "Potential hardcoded API key in $($file.Name)"
    }
    
    # Check for SQL injection vulnerabilities
    if ($content -match "query.*\+.*req\.(body|params|query)") {
        $securityIssues += "Potential SQL injection in $($file.Name)"
    }
    
    # Check for XSS vulnerabilities
    if ($content -match "innerHTML.*req\.(body|params|query)") {
        $securityIssues += "Potential XSS vulnerability in $($file.Name)"
    }
    
    # Check for eval usage
    if ($content -match "\beval\s*\(") {
        $securityIssues += "Dangerous eval() usage in $($file.Name)"
    }
}

if ($securityIssues.Count -gt 0) {
    Write-Host "⚠️ Security issues found:" -ForegroundColor Red
    foreach ($issue in $securityIssues) {
        Write-Host "  - $issue" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ No obvious security issues found in code" -ForegroundColor Green
}

Write-Host "`n5. 🔒 Database Security Check..." -ForegroundColor Yellow

# MongoDB security checklist
$mongoSecurityChecks = @(
    "Authentication enabled",
    "Authorization configured", 
    "Network access restricted",
    "Encryption at rest enabled",
    "Regular backups configured",
    "Audit logging enabled"
)

Write-Host "MongoDB Security Checklist:" -ForegroundColor Cyan
foreach ($check in $mongoSecurityChecks) {
    Write-Host "  ☐ $check" -ForegroundColor White
}

Write-Host "`n6. 🚦 Rate Limiting Test..." -ForegroundColor Yellow

# Create rate limiting test script
@"
const axios = require('axios');

async function testRateLimit() {
  const baseURL = 'http://localhost:5000/api';
  const requests = [];
  
  console.log('Testing rate limiting...');
  
  // Send 20 rapid requests
  for (let i = 0; i < 20; i++) {
    requests.push(
      axios.get(`${baseURL}/products`)
        .then(response => ({ status: response.status, attempt: i + 1 }))
        .catch(error => ({ 
          status: error.response?.status || 'ERROR', 
          attempt: i + 1,
          message: error.message 
        }))
    );
  }
  
  const results = await Promise.all(requests);
  
  const rateLimited = results.filter(r => r.status === 429);
  
  if (rateLimited.length > 0) {
    console.log('✅ Rate limiting is working');
    console.log(`Rate limited after ${rateLimited[0].attempt} requests`);
  } else {
    console.log('⚠️ Rate limiting may not be configured properly');
  }
}

testRateLimit().catch(console.error);
"@ | Out-File -FilePath "test-rate-limit.js" -Encoding UTF8

Write-Host "✅ Rate limiting test script created" -ForegroundColor Green

Write-Host "`n7. 📋 Security Recommendations..." -ForegroundColor Yellow

$recommendations = @(
    "Enable HTTPS in production",
    "Use strong, unique passwords for all accounts",
    "Implement proper session management",
    "Set up Web Application Firewall (WAF)",
    "Enable database encryption at rest",
    "Implement proper logging and monitoring",
    "Regular security updates and patches",
    "Use Content Security Policy (CSP) headers",
    "Implement proper CORS configuration",
    "Use secure cookie settings",
    "Enable API rate limiting",
    "Implement input validation and sanitization",
    "Use parameterized queries to prevent SQL injection",
    "Implement proper error handling (don't expose sensitive info)",
    "Regular security audits and penetration testing"
)

Write-Host "Security Recommendations:" -ForegroundColor Cyan
foreach ($rec in $recommendations) {
    Write-Host "  • $rec" -ForegroundColor White
}

Write-Host "`n8. 🛡️ Security Monitoring Setup..." -ForegroundColor Yellow

# Create security monitoring configuration
@"
# Security Monitoring Configuration

## Log Files to Monitor
- /var/log/auth.log (authentication attempts)
- /var/log/nginx/access.log (web server access)
- /var/log/nginx/error.log (web server errors)
- application logs (custom security events)

## Alerts to Set Up
- Multiple failed login attempts
- Unusual API usage patterns
- Database connection failures
- High error rates
- Suspicious IP addresses
- Payment fraud attempts

## Tools to Consider
- Fail2ban (intrusion prevention)
- OSSEC (host-based intrusion detection)
- ELK Stack (log analysis)
- Prometheus + Grafana (monitoring)
- Sentry (error tracking)

## Regular Security Tasks
- [ ] Weekly dependency updates
- [ ] Monthly security patches
- [ ] Quarterly penetration testing
- [ ] Annual security audit
- [ ] Regular backup testing
- [ ] SSL certificate renewal
"@ | Out-File -FilePath "security-monitoring.md" -Encoding UTF8

Write-Host "✅ Security monitoring guide created" -ForegroundColor Green

Write-Host "`n🔒 Security Audit Complete!" -ForegroundColor Green
Write-Host "📄 Review the generated files:" -ForegroundColor Cyan
Write-Host "  - security-test.js" -ForegroundColor White
Write-Host "  - test-rate-limit.js" -ForegroundColor White  
Write-Host "  - security-monitoring.md" -ForegroundColor White

Write-Host "`n🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Fix any identified vulnerabilities" -ForegroundColor White
Write-Host "2. Update weak passwords and secrets" -ForegroundColor White
Write-Host "3. Enable HTTPS for production" -ForegroundColor White
Write-Host "4. Set up monitoring and alerting" -ForegroundColor White
Write-Host "5. Schedule regular security audits" -ForegroundColor White