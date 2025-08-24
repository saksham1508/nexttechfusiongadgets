const jwt = require('jsonwebtoken');

// Mock users database (kept in sync with mockAuthController.js mock users)
const mockUsers = [
  // Customer users
  {
    _id: 'user_1',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'customer',
    isVerified: true,
    phone: '9876543210',
    createdAt: new Date('2024-01-01')
  },
  {
    _id: 'mock_user_1', // matches mockAuthController
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'customer',
    isVerified: true,
    phone: '+1234567890',
    createdAt: new Date('2024-01-01')
  },
  {
    _id: 'demo_user_123', // matches mockAuthController
    name: 'Demo User',
    email: 'test@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'customer',
    isVerified: true,
    phone: '+1234567890',
    createdAt: new Date('2024-01-01')
  },
  // Admin users
  {
    _id: 'admin_1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // adminpassword
    role: 'admin',
    isVerified: true,
    phone: '9876543211',
    createdAt: new Date('2024-01-01')
  },
  {
    _id: 'mock_admin_1', // matches mockAuthController
    name: 'Admin User',
    email: 'admin@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'admin',
    isVerified: true,
    phone: '+1234567891',
    createdAt: new Date('2024-01-01')
  },
  // Vendor users (sellers)
  {
    _id: 'vendor_1',
    name: 'Acme Supplies',
    email: 'vendor1@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // Vendor@123
    role: 'seller',
    isVerified: true,
    phone: '9000000001',
    createdAt: new Date('2024-01-01')
  },
  {
    _id: 'vendor_2',
    name: 'TechBazaar',
    email: 'vendor2@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // Vendor@123
    role: 'seller',
    isVerified: true,
    phone: '9000000002',
    createdAt: new Date('2024-01-01')
  },
  {
    _id: 'vendor_3',
    name: 'GadgetHub',
    email: 'vendor3@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // Vendor@123
    role: 'seller',
    isVerified: true,
    phone: '9000000003',
    createdAt: new Date('2024-01-01')
  }
];

const auth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Demo/mock vendor token fallback (non-JWT)
      if (token.startsWith('mock_vendor_token_')) {
        // Token format: mock_vendor_token_<vendorId>
        const vendorId = token.replace('mock_vendor_token_', '');
        let user = mockUsers.find(u => u._id === vendorId);
        if (!user) {
          // Default to first seller if specific not found
          user = mockUsers.find(u => u.role === 'seller') || mockUsers[0];
        }
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
        return next();
      }

      // Try to verify as JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      
      // Find user in mock database; if missing (e.g., newly mock-registered), fallback to a default customer
      let user = mockUsers.find(u => u._id === decoded.id);
      if (!user) {
        console.warn('Mock auth: decoded user not found in local list, falling back to default customer for mock mode');
        const fallback = mockUsers.find(u => u.role === 'customer') || mockUsers[0];
        user = { ...fallback, _id: decoded.id };
      }
      
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
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
      const user = mockUsers.find(u => u._id === decoded.id);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      } else {
        req.user = null;
      }
    } catch (error) {
      // Token is invalid, but we continue without user
      req.user = null;
    }
  } else {
    req.user = null;
  }
  
  next();
};

module.exports = { auth, adminAuth, seller, optional };