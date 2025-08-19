const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Mock user database for testing
const mockUsers = [
  {
    _id: 'mock_user_1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpassword', // In real app, this would be hashed
    role: 'customer',
    isVerified: true,
    phone: '+1234567890',
    createdAt: new Date(),
    preferences: {
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    }
  },
  // Add demo user for frontend compatibility
  {
    _id: 'demo_user_123',
    name: 'Demo User',
    email: 'test@example.com',
    password: 'testpassword',
    role: 'customer',
    isVerified: true,
    phone: '+1234567890',
    createdAt: new Date(),
    preferences: {
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    }
  },
  {
    _id: 'mock_admin_1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpassword',
    role: 'admin',
    isVerified: true,
    phone: '+1234567891',
    createdAt: new Date(),
    preferences: {
      notifications: {
        email: true,
        sms: true,
        push: true
      }
    }
  },
  {
    _id: 'mock_google_user',
    name: 'Google User',
    email: 'googleuser@gmail.com',
    role: 'customer',
    isVerified: true,
    authProvider: 'google',
    createdAt: new Date()
  },
  // Vendor users
  {
    _id: 'vendor_1',
    name: 'Acme Supplies',
    email: 'vendor1@example.com',
    password: 'Vendor@123',
    role: 'seller',
    isVerified: true,
    phone: '9000000001',
    createdAt: new Date(),
    preferences: {
      notifications: {
        email: true,
        sms: true,
        push: true
      }
    }
  },
  {
    _id: 'vendor_2',
    name: 'TechBazaar',
    email: 'vendor2@example.com',
    password: 'Vendor@123',
    role: 'seller',
    isVerified: true,
    phone: '9000000002',
    createdAt: new Date(),
    preferences: {
      notifications: {
        email: true,
        sms: true,
        push: true
      }
    }
  },
  {
    _id: 'vendor_3',
    name: 'GadgetHub',
    email: 'vendor3@example.com',
    password: 'Vendor@123',
    role: 'seller',
    isVerified: true,
    phone: '9000000003',
    createdAt: new Date(),
    preferences: {
      notifications: {
        email: true,
        sms: true,
        push: true
      }
    }
  }
];

// Generate JWT token
const generateToken = (id, options = {}) => {
  const payload = { 
    id,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomUUID()
  };

  const tokenOptions = {
    expiresIn: options.expiresIn || '30d',
    issuer: 'nexttechfusiongadgets',
    audience: 'nexttechfusiongadgets-users'
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key', tokenOptions);
};

// Mock login function
const mockLogin = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    console.log('🔄 Mock Login Attempt:', { email, ip: clientIP });

    // Validate input
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

    // Find mock user
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user || (user.password && user.password !== password)) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: 'Invalid email or password',
          timestamp: new Date().toISOString(),
          hint: 'Try: test@example.com / testpassword or admin@example.com / adminpassword'
        }
      });
    }

    // Generate tokens
    const tokenExpiry = rememberMe ? '30d' : '1d';
    const accessToken = generateToken(user._id, { expiresIn: tokenExpiry });
    const refreshToken = generateToken(user._id, { expiresIn: '7d' });

    // Success response
    const response = {
      success: true,
      message: 'Login successful (Mock Mode)',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        phone: user.phone,
        authProvider: user.authProvider,
        preferences: user.preferences,
        lastLogin: new Date(),
        createdAt: user.createdAt
      },
      token: accessToken,
      refreshToken,
      expiresIn: tokenExpiry,
      mockMode: true,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Mock Login Success:', { email, userId: user._id });
    res.json(response);

  } catch (error) {
    console.error('❌ Mock Login Error:', error);
    res.status(500).json({
      success: false,
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Login failed',
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Mock register function
const mockRegister = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    console.log('🔄 Mock Register Attempt:', { email, name });

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          type: 'DUPLICATE_RESOURCE',
          message: 'An account with this email already exists',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Create new mock user
    const newUser = {
      _id: 'mock_user_' + Date.now(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password, // In real app, this would be hashed
      phone: phone?.trim(),
      role: role || 'customer',
      isVerified: false,
      createdAt: new Date(),
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      }
    };

    // Add to mock database
    mockUsers.push(newUser);

    // Generate tokens
    const accessToken = generateToken(newUser._id);
    const refreshToken = generateToken(newUser._id, { expiresIn: '7d' });

    const response = {
      success: true,
      message: 'Registration successful (Mock Mode)',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
        phone: newUser.phone,
        createdAt: newUser.createdAt
      },
      token: accessToken,
      refreshToken,
      mockMode: true,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Mock Register Success:', { email, userId: newUser._id });
    res.status(201).json(response);

  } catch (error) {
    console.error('❌ Mock Register Error:', error);
    res.status(500).json({
      success: false,
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Registration failed',
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Mock Google login
const mockGoogleLogin = async (req, res) => {
  try {
    const { googleId, email, name, picture, givenName, familyName } = req.body;

    console.log('🔄 Mock Google Login:', { email, name });

    // Find or create Google user
    let user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      user = {
        _id: 'mock_google_' + Date.now(),
        name: name || `${givenName} ${familyName}`,
        email: email.toLowerCase(),
        role: 'customer',
        isVerified: true,
        authProvider: 'google',
        avatar: picture,
        createdAt: new Date(),
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: true
          }
        }
      };
      mockUsers.push(user);
    }

    const accessToken = generateToken(user._id);
    const refreshToken = generateToken(user._id, { expiresIn: '7d' });

    const response = {
      success: true,
      message: 'Google login successful (Mock Mode)',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        authProvider: user.authProvider,
        avatar: user.avatar,
        createdAt: user.createdAt
      },
      token: accessToken,
      refreshToken,
      mockMode: true,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Mock Google Login Success:', { email, userId: user._id });
    res.json(response);

  } catch (error) {
    console.error('❌ Mock Google Login Error:', error);
    res.status(500).json({
      success: false,
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Google login failed',
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Mock Facebook login
const mockFacebookLogin = async (req, res) => {
  try {
    const { token } = req.body;

    console.log('🔄 Mock Facebook Login');

    // Create mock Facebook user
    const user = {
      _id: 'mock_facebook_' + Date.now(),
      name: 'Facebook User',
      email: 'facebook.user@example.com',
      role: 'customer',
      isVerified: true,
      authProvider: 'facebook',
      createdAt: new Date(),
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      }
    };

    const accessToken = generateToken(user._id);
    const refreshToken = generateToken(user._id, { expiresIn: '7d' });

    const response = {
      success: true,
      message: 'Facebook login successful (Mock Mode)',
      user: user,
      token: accessToken,
      refreshToken,
      mockMode: true,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Mock Facebook Login Success:', { userId: user._id });
    res.json(response);

  } catch (error) {
    console.error('❌ Mock Facebook Login Error:', error);
    res.status(500).json({
      success: false,
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Facebook login failed',
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Mock Apple login
const mockAppleLogin = async (req, res) => {
  try {
    const { identityToken, authorizationCode, user: appleUser } = req.body;

    console.log('🔄 Mock Apple Login');

    // Create mock Apple user
    const user = {
      _id: 'mock_apple_' + Date.now(),
      name: appleUser?.name ? `${appleUser.name.firstName || ''} ${appleUser.name.lastName || ''}`.trim() : 'Apple User',
      email: appleUser?.email || 'apple.user@icloud.com',
      role: 'customer',
      isVerified: true,
      authProvider: 'apple',
      createdAt: new Date(),
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      }
    };

    const accessToken = generateToken(user._id);
    const refreshToken = generateToken(user._id, { expiresIn: '7d' });

    const response = {
      success: true,
      message: 'Apple login successful (Mock Mode)',
      data: {
        user: user,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: '30d'
        }
      },
      metadata: {
        authProvider: 'apple',
        demoMode: true
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ Mock Apple Login Success:', { userId: user._id });
    res.json(response);

  } catch (error) {
    console.error('❌ Mock Apple Login Error:', error);
    res.status(500).json({
      success: false,
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Apple login failed',
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Mock phone login
const mockPhoneLogin = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    console.log('🔄 Mock Phone Login:', { phone, otp });

    // Validate OTP (mock validation)
    if (otp !== '123456') {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: 'Invalid OTP. Use 123456 for demo.',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Create or find phone user
    let user = mockUsers.find(u => u.phone === phone);
    
    if (!user) {
      user = {
        _id: 'mock_phone_' + Date.now(),
        name: 'Phone User',
        email: phone.replace(/\D/g, '') + '@phone.demo',
        phone: phone,
        role: 'customer',
        isVerified: true,
        authProvider: 'phone',
        createdAt: new Date(),
        preferences: {
          notifications: {
            email: false,
            sms: true,
            push: true
          }
        }
      };
      mockUsers.push(user);
    }

    const accessToken = generateToken(user._id);
    const refreshToken = generateToken(user._id, { expiresIn: '7d' });

    const response = {
      success: true,
      message: 'Phone login successful (Mock Mode)',
      user: user,
      token: accessToken,
      refreshToken,
      mockMode: true,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Mock Phone Login Success:', { phone, userId: user._id });
    res.json(response);

  } catch (error) {
    console.error('❌ Mock Phone Login Error:', error);
    res.status(500).json({
      success: false,
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Phone login failed',
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Mock profile functions
const mockGetProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = mockUsers.find(u => u._id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString()
        }
      });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword,
      mockMode: true
    });

  } catch (error) {
    console.error('❌ Mock Get Profile Error:', error);
    res.status(500).json({
      success: false,
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get profile',
        timestamp: new Date().toISOString()
      }
    });
  }
};

const mockUpdateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const userIndex = mockUsers.findIndex(u => u._id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Update user data
    const allowedUpdates = ['name', 'phone', 'preferences'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates, updatedAt: new Date() };
    
    const { password, ...userWithoutPassword } = mockUsers[userIndex];
    
    res.json({
      success: true,
      message: 'Profile updated successfully (Mock Mode)',
      user: userWithoutPassword,
      mockMode: true
    });

  } catch (error) {
    console.error('❌ Mock Update Profile Error:', error);
    res.status(500).json({
      success: false,
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update profile',
        timestamp: new Date().toISOString()
      }
    });
  }
};

module.exports = {
  mockLogin,
  mockRegister,
  mockGoogleLogin,
  mockFacebookLogin,
  mockAppleLogin,
  mockPhoneLogin,
  mockGetProfile,
  mockUpdateProfile,
  mockUsers // Export for testing
};