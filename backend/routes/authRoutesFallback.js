const express = require('express');
const { body } = require('express-validator');
const passport = require('../config/passport');

// Import both real and mock controllers
const {
  register,
  login,
  getProfile,
  updateProfile,
  appleAuthCallback,
  appleAuth
} = require('../controllers/authController');

const {
  mockLogin,
  mockRegister,
  mockGoogleLogin,
  mockFacebookLogin,
  mockAppleLogin,
  mockPhoneLogin,
  mockGetProfile,
  mockUpdateProfile
} = require('../controllers/mockAuthController');

const { auth } = require('../middleware/authFallback');

const router = express.Router();

// Check if MongoDB is available
const isMongoAvailable = () => {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState === 1; // 1 = connected
  } catch (error) {
    return false;
  }
};

// Middleware to choose between real and mock authentication
const authMiddleware = (realHandler, mockHandler) => {
  return async (req, res, next) => {
    try {
      if (isMongoAvailable()) {
        console.log('🔄 Using real authentication (MongoDB connected)');
        return await realHandler(req, res, next);
      }
      console.log('🔄 Using mock authentication (MongoDB not available)');
      return await mockHandler(req, res, next);

    } catch (error) {
      console.log('⚠️ Real auth failed, falling back to mock:', error.message);
      return await mockHandler(req, res, next);
    }
  };
};

// Routes with fallback logic
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional()
], authMiddleware(register, mockRegister));

router.post('/login', authMiddleware(login, mockLogin));

// Social authentication routes
router.post('/google', authMiddleware(
  async (req, res, next) => {
    // Delegate to real controller googleAuth when Mongo is available
    const { googleAuth } = require('../controllers/authController');
    return googleAuth(req, res, next);
  },
  mockGoogleLogin
));

router.post('/facebook', authMiddleware(
  async (req, res, next) => {
    const { facebookAuth } = require('../controllers/authController');
    return facebookAuth(req, res, next);
  },
  mockFacebookLogin
));

router.post('/phone', authMiddleware(
  async (req, res) => {
    // Real phone auth would be handled by the main auth controller
    res.status(501).json({ message: 'Phone auth not implemented in real mode yet' });
  },
  mockPhoneLogin
));

// Apple authentication routes
router.get('/apple', authMiddleware(
  (req, res, next) => {
    // Check if Apple strategy is available
    if (passport._strategy('apple')) {
      return passport.authenticate('apple', { scope: ['name', 'email'] })(req, res, next);
    }
    return res.redirect('/api/auth/apple/mock');

  },
  async (req, res) => {
    res.redirect('/api/auth/apple/mock');
  }
));

router.post('/apple/callback', authMiddleware(
  (req, res, next) => {
    // Check if Apple strategy is available
    if (passport._strategy('apple')) {
      return passport.authenticate('apple', { session: false })(req, res, next);
    }
    return res.redirect('/api/auth/apple/mock');

  },
  async (req, res) => {
    res.redirect('/api/auth/apple/mock');
  }
));

router.post('/apple', authMiddleware(appleAuth, mockAppleLogin));

// Profile routes
router.route('/profile')
  .get(auth, authMiddleware(getProfile, mockGetProfile))
  .put(auth, authMiddleware(updateProfile, mockUpdateProfile));

// Health check endpoint to show which mode is active
router.get('/status', (req, res) => {
  const mongoAvailable = isMongoAvailable();
  res.json({
    success: true,
    mode: mongoAvailable ? 'real' : 'mock',
    mongoAvailable,
    message: mongoAvailable
      ? 'Using real authentication with MongoDB'
      : 'Using mock authentication (MongoDB not available)',
    timestamp: new Date().toISOString(),
    testCredentials: mongoAvailable ? null : {
      customer: {
        email: 'test@example.com',
        password: 'testpassword'
      },
      admin: {
        email: 'admin@example.com',
        password: 'adminpassword'
      },
      vendors: [
        { email: 'vendor1@example.com', password: 'Vendor@123', name: 'Acme Supplies' },
        { email: 'vendor2@example.com', password: 'Vendor@123', name: 'TechBazaar' },
        { email: 'vendor3@example.com', password: 'Vendor@123', name: 'GadgetHub' }
      ]
    }
  });
});

module.exports = router;
