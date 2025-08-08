const jwt = require('jsonwebtoken');

// Mock user database (same as in mockAuthController)
const mockUsers = [
  {
    _id: 'mock_user_1',
    id: 'mock_user_1',
    name: 'Test User',
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
  // Add demo user for frontend compatibility
  {
    _id: 'demo_user_123',
    id: 'demo_user_123',
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
    id: 'mock_admin_1',
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
    id: 'mock_google_user',
    name: 'Google User',
    email: 'googleuser@gmail.com',
    role: 'customer',
    isVerified: true,
    authProvider: 'google',
    createdAt: new Date()
  }
];

const auth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Handle demo tokens (fallback for frontend demo login)
      if (token.startsWith('demo_token_')) {
        console.log('🔄 Using demo token fallback');
        // Use the default test user for demo tokens
        const user = mockUsers.find(u => u.email === 'test@example.com');
        if (user) {
          const { password, ...userWithoutPassword } = user;
          req.user = userWithoutPassword;
          return next();
        }
      }
      
      // Try to verify as JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      
      // Find user in mock database
      const user = mockUsers.find(u => u._id === decoded.id || u.id === decoded.id);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
      
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as admin' });
  }
};

const seller = (req, res, next) => {
  if (req.user && (req.user.role === 'seller' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as seller' });
  }
};

const optional = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      
      // Find user in mock database
      const user = mockUsers.find(u => u._id === decoded.id || u.id === decoded.id);
      
      if (user) {
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      }
    } catch (error) {
      // Token is invalid, but we continue without user
      req.user = null;
    }
  }

  next();
};

module.exports = { auth, adminAuth, seller, optional };