const express = require('express');
const { body } = require('express-validator');
const passport = require('../config/passport');

// Import real controllers and middleware
const {
  register,
  login,
  getProfile,
  updateProfile,
  appleAuthCallback,
  appleAuth
} = require('../controllers/authController');

const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required')
], register);

router.post('/login', login);
router.route('/profile').get(auth, getProfile).put(auth, updateProfile);

// Apple Authentication Routes
router.get('/apple', passport.authenticate('apple', { scope: ['name', 'email'] }));
router.post('/apple/callback', passport.authenticate('apple', { session: false }), appleAuthCallback);
router.post('/apple', appleAuth);

module.exports = router;
