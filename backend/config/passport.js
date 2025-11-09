const passport = require('passport');
const AppleStrategy = require('passport-apple').Strategy;
const User = require('../models/User');

// Apple Strategy Configuration - only initialize if environment variables are set
const appleClientId = process.env.APPLE_CLIENT_ID;
const appleTeamId = process.env.APPLE_TEAM_ID;
const appleKeyId = process.env.APPLE_KEY_ID;

if (appleClientId && appleTeamId && appleKeyId &&
    !appleClientId.includes('mock') &&
    !appleClientId.includes('your-')) {

  console.log('✅ Initializing Apple Strategy with real credentials');

  passport.use(new AppleStrategy({
    clientID: appleClientId,
    teamID: appleTeamId,
    keyID: appleKeyId,
    privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH || './config/apple-private-key.p8',
    callbackURL: process.env.APPLE_CALLBACK_URL || '/api/auth/apple/callback',
    scope: ['name', 'email'],
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, idToken, profile, done) => {
    try {
      console.log('Apple Strategy - Profile received:', profile);

      // Extract user information from Apple profile
      const appleId = profile.id;
      const email = profile.email;
      const name = profile.name;

      // Check if user already exists with this Apple ID
      let user = await User.findOne({ appleId });

      if (user) {
      // User exists, update last login
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }

      // Check if user exists with the same email
      user = await User.findOne({ email: email?.toLowerCase() });

      if (user) {
      // Link Apple account to existing user
        user.appleId = appleId;
        user.authProvider = 'apple';
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }

      // Create new user
      const newUser = new User({
        appleId,
        email: email?.toLowerCase(),
        name: name ? `${name.firstName || ''} ${name.lastName || ''}`.trim() : 'Apple User',
        firstName: name?.firstName,
        lastName: name?.lastName,
        authProvider: 'apple',
        isEmailVerified: true, // Apple emails are verified
        registrationIP: req.ip || req.connection.remoteAddress,
        registrationUserAgent: req.get('User-Agent'),
        lastLogin: new Date()
      });

      await newUser.save();
      return done(null, newUser);

    } catch (error) {
      console.error('Apple Strategy Error:', error);
      return done(error, null);
    }
  }));
} else {
  console.log('⚠️  Apple Strategy not initialized - missing or mock environment variables');
  console.log('   Set APPLE_CLIENT_ID, APPLE_TEAM_ID, and APPLE_KEY_ID for production Apple authentication');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
