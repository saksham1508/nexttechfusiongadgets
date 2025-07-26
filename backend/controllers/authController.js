const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const { errorMetrics } = require('../middleware/errorHandler');

// Six Sigma: Define - Authentication metrics and security tracking
class AuthMetrics {
  constructor() {
    this.loginAttempts = new Map();
    this.failedLogins = new Map();
    this.registrations = [];
    this.securityEvents = [];
  }

  recordLoginAttempt(email, success, ip, userAgent) {
    const key = `${email}_${ip}`;
    const attempts = this.loginAttempts.get(key) || [];
    
    attempts.push({
      timestamp: new Date(),
      success,
      ip,
      userAgent
    });

    // Keep only last 10 attempts per email/IP combination
    this.loginAttempts.set(key, attempts.slice(-10));

    if (!success) {
      const failedCount = this.failedLogins.get(key) || 0;
      this.failedLogins.set(key, failedCount + 1);
      
      // Security event for multiple failed attempts
      if (failedCount >= 3) {
        this.recordSecurityEvent('MULTIPLE_FAILED_LOGINS', { email, ip, attempts: failedCount + 1 });
      }
    } else {
      // Reset failed login count on successful login
      this.failedLogins.delete(key);
    }
  }

  recordRegistration(email, ip, userAgent) {
    this.registrations.push({
      email,
      ip,
      userAgent,
      timestamp: new Date()
    });

    // Keep only last 1000 registrations
    if (this.registrations.length > 1000) {
      this.registrations = this.registrations.slice(-1000);
    }
  }

  recordSecurityEvent(type, details) {
    this.securityEvents.push({
      type,
      details,
      timestamp: new Date()
    });

    // Keep only last 500 security events
    if (this.securityEvents.length > 500) {
      this.securityEvents = this.securityEvents.slice(-500);
    }

    // Log critical security events
    if (['MULTIPLE_FAILED_LOGINS', 'SUSPICIOUS_ACTIVITY', 'ACCOUNT_LOCKOUT'].includes(type)) {
      console.warn(`🚨 Security Event: ${type}`, details);
    }
  }

  isAccountLocked(email, ip) {
    const key = `${email}_${ip}`;
    const failedCount = this.failedLogins.get(key) || 0;
    return failedCount >= 5; // Lock after 5 failed attempts
  }

  getMetrics() {
    return {
      totalLoginAttempts: Array.from(this.loginAttempts.values()).flat().length,
      totalFailedLogins: Array.from(this.failedLogins.values()).reduce((sum, count) => sum + count, 0),
      totalRegistrations: this.registrations.length,
      securityEvents: this.securityEvents.slice(-10), // Last 10 events
      lockedAccounts: Array.from(this.failedLogins.entries()).filter(([, count]) => count >= 5).length
    };
  }
}

const authMetrics = new AuthMetrics();

// Agile: Enhanced token generation with security features
const generateToken = (id, options = {}) => {
  const payload = { 
    id,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomUUID() // JWT ID for token tracking
  };

  const tokenOptions = {
    expiresIn: options.expiresIn || process.env.JWT_EXPIRE || '30d',
    issuer: 'nexttechfusiongadgets',
    audience: 'nexttechfusiongadgets-users'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, tokenOptions);
};

// Six Sigma: Secure token refresh mechanism
const generateRefreshToken = (id) => {
  return jwt.sign(
    { id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @desc    Register user with enhanced security and validation
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { name, email, password, phone, role } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');

  // Six Sigma: Measure - Validate input data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: 'Invalid registration data',
        details: errors.array(),
        timestamp: new Date().toISOString()
      }
    });
  }

  // Check for existing user
  const existingUser = await User.findOne({ 
    $or: [
      { email: email.toLowerCase() },
      ...(phone ? [{ phone }] : [])
    ]
  });

  if (existingUser) {
    // Record security event for duplicate registration attempt
    authMetrics.recordSecurityEvent('DUPLICATE_REGISTRATION_ATTEMPT', {
      email,
      existingField: existingUser.email === email.toLowerCase() ? 'email' : 'phone',
      ip: clientIP
    });

    return res.status(409).json({
      success: false,
      error: {
        type: 'DUPLICATE_RESOURCE',
        message: 'An account with this email or phone number already exists',
        timestamp: new Date().toISOString()
      }
    });
  }

  // Six Sigma: Analyze - Create user with enhanced data
  const userData = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone?.trim(),
    role: role || 'customer',
    registrationIP: clientIP,
    registrationUserAgent: userAgent,
    isVerified: false,
    verificationToken: crypto.randomBytes(32).toString('hex'),
    loginAttempts: 0,
    lockUntil: null,
    lastLogin: null,
    preferences: {
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      privacy: {
        profileVisible: false,
        dataSharing: false
      }
    }
  };

  const user = await User.create(userData);

  // Record registration metrics
  authMetrics.recordRegistration(email, clientIP, userAgent);

  const processingTime = Date.now() - startTime;

  // Six Sigma: Control - Structured response
  const response = {
    success: true,
    message: 'Registration successful. Please verify your email address.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      },
      tokens: {
        accessToken: generateToken(user._id),
        refreshToken: generateRefreshToken(user._id)
      },
      nextSteps: [
        'Verify your email address',
        'Complete your profile',
        'Set up two-factor authentication (recommended)'
      ]
    },
    metadata: {
      processingTime,
      requiresVerification: true
    },
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId
  };

  // Agile: Set secure cookie for refresh token
  res.cookie('refreshToken', response.data.tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(201).json(response);
});

// @desc    Authenticate user with enhanced security
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { email, password, rememberMe } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');

  // Six Sigma: Measure - Input validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: 'Email and password are required',
        timestamp: new Date().toISOString()
      }
    });
  }

  // Check if account is locked
  if (authMetrics.isAccountLocked(email, clientIP)) {
    authMetrics.recordSecurityEvent('ACCOUNT_LOCKOUT_ATTEMPT', {
      email,
      ip: clientIP,
      userAgent
    });

    return res.status(423).json({
      success: false,
      error: {
        type: 'ACCOUNT_LOCKED',
        message: 'Account temporarily locked due to multiple failed login attempts. Please try again later.',
        retryAfter: 900, // 15 minutes
        timestamp: new Date().toISOString()
      }
    });
  }

  // Find user and include security fields
  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password +loginAttempts +lockUntil +lastLogin');

  const isValidPassword = user && (await user.matchPassword(password));

  // Record login attempt
  authMetrics.recordLoginAttempt(email, isValidPassword, clientIP, userAgent);

  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      error: {
        type: 'AUTHENTICATION_ERROR',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      }
    });
  }

  // Six Sigma: Analyze - Update user login information
  const updateData = {
    lastLogin: new Date(),
    loginAttempts: 0,
    lockUntil: null,
    $push: {
      loginHistory: {
        timestamp: new Date(),
        ip: clientIP,
        userAgent,
        success: true
      }
    }
  };

  await User.findByIdAndUpdate(user._id, updateData);

  const processingTime = Date.now() - startTime;

  // Generate tokens with appropriate expiration
  const tokenExpiry = rememberMe ? '30d' : '1d';
  const accessToken = generateToken(user._id, { expiresIn: tokenExpiry });
  const refreshToken = generateRefreshToken(user._id);

  // Six Sigma: Control - Comprehensive response
  const response = {
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        preferences: user.preferences
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: tokenExpiry
      },
      session: {
        loginTime: new Date(),
        rememberMe: !!rememberMe,
        deviceInfo: {
          ip: clientIP,
          userAgent
        }
      }
    },
    metadata: {
      processingTime,
      securityLevel: user.twoFactorEnabled ? 'high' : 'standard'
    },
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId
  };

  // Set secure cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.cookie('sessionId', crypto.randomUUID(), cookieOptions);

  res.json(response);
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
