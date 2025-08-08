const jwt = require('jsonwebtoken');

// Import mock users for fallback
const { mockUsers } = require('../controllers/mockAuthController');

// Check if MongoDB is available
const isMongoAvailable = () => {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState === 1; // 1 = connected
  } catch (error) {
    return false;
  }
};

// Get user from real database
const getUserFromDB = async (userId) => {
  try {
    const User = require('../models/User');
    return await User.findById(userId).select('-password');
  } catch (error) {
    return null;
  }
};

// Get user from mock database
const getUserFromMock = (userId) => {
  const user = mockUsers.find(u => u._id === userId);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

const auth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      
      let user = null;
      
      // Try to get user from real database first
      if (isMongoAvailable()) {
        try {
          user = await getUserFromDB(decoded.id);
          console.log('🔄 Auth: Using real user from MongoDB');
        } catch (error) {
          console.log('⚠️ Auth: MongoDB failed, falling back to mock');
        }
      }
      
      // Fallback to mock user if real database is not available or user not found
      if (!user) {
        user = getUserFromMock(decoded.id);
        console.log('🔄 Auth: Using mock user');
      }
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized, user not found',
          timestamp: new Date().toISOString()
        });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error('❌ Auth Error:', error.message);
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, token failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  } else {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token provided',
      timestamp: new Date().toISOString()
    });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Not authorized as admin',
      timestamp: new Date().toISOString()
    });
  }
};

const seller = (req, res, next) => {
  if (req.user && (req.user.role === 'seller' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Not authorized as seller',
      timestamp: new Date().toISOString()
    });
  }
};

const optional = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      
      let user = null;
      
      // Try to get user from real database first
      if (isMongoAvailable()) {
        try {
          user = await getUserFromDB(decoded.id);
        } catch (error) {
          // Ignore error, will fallback to mock
        }
      }
      
      // Fallback to mock user
      if (!user) {
        user = getUserFromMock(decoded.id);
      }
      
      req.user = user;
    } catch (error) {
      // Token is invalid, but we continue without user
      req.user = null;
    }
  }

  next();
};

module.exports = { auth, adminAuth, seller, optional };