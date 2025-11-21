const express = require('express');
const { body } = require('express-validator');
const passport = require('../config/passport');

// Import real controllers only
const {
  register,
  login,
  getProfile,
  updateProfile,
  appleAuthCallback,
  appleAuth,
  googleAuth,
  facebookAuth
} = require('../controllers/authController');

const { auth } = require('../middleware/auth');

const router = express.Router();

// Authentication routes
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required')
], register);

router.post('/login', login);

// Social authentication routes
router.post('/google', googleAuth);
router.post('/facebook', facebookAuth);
router.post('/phone', (req, res) => {
  res.status(501).json({ message: 'Phone auth not implemented yet' });
});

// Apple authentication routes
router.get('/apple', passport.authenticate('apple', { scope: ['name', 'email'] }));
router.post('/apple/callback', passport.authenticate('apple', { session: false }), appleAuthCallback);
router.post('/apple', appleAuth);

// Profile routes
router.route('/profile')
  .get(auth, getProfile)
  .put(auth, updateProfile);

// Health check endpoint
router.get('/status', (req, res) => {
  res.json({
    success: true,
    mode: 'production',
    message: 'Using production authentication with MongoDB',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
