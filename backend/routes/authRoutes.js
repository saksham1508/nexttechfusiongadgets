const express = require('express');
const { body } = require('express-validator');
const passport = require('../config/passport');

// Check if MongoDB is available
const mongoose = require('mongoose');
const isMongoConnected = mongoose.connection.readyState === 1;

// Use appropriate controller and middleware based on MongoDB availability
let authController, auth;
if (isMongoConnected) {
  authController = require('../controllers/authController');
  auth = require('../middleware/auth').auth;
} else {
  console.log('🔄 Using mock auth controller (MongoDB not available)');
  authController = require('../controllers/mockAuthController');
  auth = require('../middleware/mockAuth').auth;
}

let register, login, getProfile, updateProfile, appleAuthCallback, appleAuth;

if (isMongoConnected) {
  ({ register, login, getProfile, updateProfile, appleAuthCallback, appleAuth } = authController);
} else {
  // Map mock functions to expected names
  register = authController.mockRegister;
  login = authController.mockLogin;
  getProfile = authController.mockGetProfile;
  updateProfile = authController.mockUpdateProfile;
  appleAuthCallback = authController.mockAppleLogin; // Fallback
  appleAuth = authController.mockAppleLogin; // Fallback
}

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
