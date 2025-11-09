const crypto = require('crypto');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'security' },
  transports: [
    new winston.transports.File({ filename: 'logs/security-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/security-combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class SecurityService {
  constructor() {
    this.suspiciousPatterns = [
      /(\b(?:union|select|insert|delete|update|drop|create|alter|exec|execute)\b)/gi,
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];

    this.rateLimits = new Map();
    this.failedAttempts = new Map();
    this.blockedIPs = new Set();
  }

  // Input Validation & Sanitization
  validateInput(input, type = 'general') {
    if (!input || typeof input !== 'string') {
      return { valid: false, error: 'Invalid input type' };
    }

    // Check for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(input)) {
        logger.warn('Suspicious input detected', { input, pattern: pattern.toString() });
        return { valid: false, error: 'Potentially malicious input detected' };
      }
    }

    // Type-specific validation
    switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input)) {
        return { valid: false, error: 'Invalid email format' };
      }
      break;

    case 'phone':
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(input)) {
        return { valid: false, error: 'Invalid phone format' };
      }
      break;

    case 'amount':
      const amount = parseFloat(input);
      if (isNaN(amount) || amount < 0 || amount > 1000000) {
        return { valid: false, error: 'Invalid amount' };
      }
      break;
    }

    return { valid: true, sanitized: this.sanitizeInput(input) };
  }

  sanitizeInput(input) {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .trim();
  }

  // Rate Limiting
  checkRateLimit(identifier, maxRequests = 100, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.rateLimits.has(identifier)) {
      this.rateLimits.set(identifier, []);
    }

    const requests = this.rateLimits.get(identifier);

    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);

    if (validRequests.length >= maxRequests) {
      logger.warn('Rate limit exceeded', { identifier, requests: validRequests.length });
      return { allowed: false, retryAfter: windowMs };
    }

    validRequests.push(now);
    this.rateLimits.set(identifier, validRequests);

    return { allowed: true, remaining: maxRequests - validRequests.length };
  }

  // Payment Security
  validatePaymentData(paymentData) {
    const errors = [];

    // Validate amount
    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Invalid payment amount');
    }

    // Validate currency
    const validCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD'];
    if (!validCurrencies.includes(paymentData.currency)) {
      errors.push('Invalid currency');
    }

    // Validate payment method
    const validMethods = ['stripe', 'razorpay', 'paypal', 'googlepay', 'upi'];
    if (!validMethods.includes(paymentData.paymentMethod)) {
      errors.push('Invalid payment method');
    }

    // Check for suspicious amounts
    if (paymentData.amount > 50000) {
      logger.info('High-value transaction detected', { amount: paymentData.amount });
    }

    return {
      valid: errors.length === 0,
      errors,
      riskScore: this.calculateRiskScore(paymentData)
    };
  }

  calculateRiskScore(paymentData) {
    let score = 0;

    // High amount increases risk
    if (paymentData.amount > 10000) {score += 30;}
    else if (paymentData.amount > 1000) {score += 10;}

    // International transactions
    if (paymentData.currency !== 'INR') {score += 20;}

    // New payment methods
    if (['bitcoin', 'ethereum'].includes(paymentData.paymentMethod)) {score += 40;}

    // Time-based risk (late night transactions)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {score += 15;}

    return Math.min(score, 100);
  }

  // Fraud Detection
  detectFraud(transactionData, userHistory = []) {
    const flags = [];
    let riskScore = 0;

    // Velocity checks
    const recentTransactions = userHistory.filter(
      t => Date.now() - new Date(t.createdAt).getTime() < 3600000 // Last hour
    );

    if (recentTransactions.length > 5) {
      flags.push('High transaction velocity');
      riskScore += 40;
    }

    // Amount pattern analysis
    const amounts = userHistory.map(t => t.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;

    if (transactionData.amount > avgAmount * 5) {
      flags.push('Unusual transaction amount');
      riskScore += 30;
    }

    // Geographic anomalies (if IP location data available)
    if (transactionData.ipLocation && userHistory.length > 0) {
      const lastLocation = userHistory[0].ipLocation;
      if (this.calculateDistance(transactionData.ipLocation, lastLocation) > 1000) {
        flags.push('Geographic anomaly');
        riskScore += 25;
      }
    }

    // Device fingerprinting
    if (transactionData.deviceFingerprint) {
      const knownDevices = userHistory.map(t => t.deviceFingerprint).filter(Boolean);
      if (!knownDevices.includes(transactionData.deviceFingerprint)) {
        flags.push('New device');
        riskScore += 15;
      }
    }

    return {
      riskScore: Math.min(riskScore, 100),
      flags,
      recommendation: this.getFraudRecommendation(riskScore),
      requiresReview: riskScore > 70
    };
  }

  getFraudRecommendation(riskScore) {
    if (riskScore < 30) {return 'approve';}
    if (riskScore < 70) {return 'review';}
    return 'decline';
  }

  calculateDistance(loc1, loc2) {
    // Simplified distance calculation (Haversine formula)
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(loc2.lat - loc1.lat);
    const dLon = this.toRad(loc2.lon - loc1.lon);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(loc1.lat)) * Math.cos(this.toRad(loc2.lat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRad(deg) {
    return deg * (Math.PI/180);
  }

  // Token Security
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  hashSensitiveData(data, salt = null) {
    if (!salt) {
      salt = crypto.randomBytes(16).toString('hex');
    }

    const hash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
    return { hash, salt };
  }

  verifyHash(data, hash, salt) {
    const verifyHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  // Encryption for sensitive data
  encrypt(text, key = process.env.ENCRYPTION_KEY) {
    if (!key) {
      throw new Error('Encryption key not provided');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', key);
    cipher.setAutoPadding(true);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      iv: iv.toString('hex')
    };
  }

  decrypt(encryptedData, key = process.env.ENCRYPTION_KEY) {
    if (!key) {
      throw new Error('Encryption key not provided');
    }

    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Security Headers
  getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': 'default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }

  // Audit Logging
  logSecurityEvent(event, details = {}) {
    logger.info('Security event', {
      event,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  // IP Blocking
  blockIP(ip, reason, duration = 3600000) { // 1 hour default
    this.blockedIPs.add(ip);
    this.logSecurityEvent('IP_BLOCKED', { ip, reason });

    // Auto-unblock after duration
    setTimeout(() => {
      this.blockedIPs.delete(ip);
      this.logSecurityEvent('IP_UNBLOCKED', { ip });
    }, duration);
  }

  isIPBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  // Failed Login Attempts
  recordFailedAttempt(identifier) {
    if (!this.failedAttempts.has(identifier)) {
      this.failedAttempts.set(identifier, { count: 0, lastAttempt: Date.now() });
    }

    const attempts = this.failedAttempts.get(identifier);
    attempts.count++;
    attempts.lastAttempt = Date.now();

    // Block after 5 failed attempts
    if (attempts.count >= 5) {
      this.blockIP(identifier, 'Too many failed login attempts');
      return { blocked: true, attempts: attempts.count };
    }

    return { blocked: false, attempts: attempts.count };
  }

  clearFailedAttempts(identifier) {
    this.failedAttempts.delete(identifier);
  }
}

module.exports = new SecurityService();
