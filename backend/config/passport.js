const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const logger = require('../utils/logger');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/oauth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ $or: [{ email: profile.emails[0].value }, { oauthId: profile.id, oauthProvider: 'google' }] });

    if (user) {
      // User exists, update Google info if not already set
      if (!user.oauthId) {
        user.oauthId = profile.id;
        await user.save();
      }
      return done(null, user);
    } else {
      // Create new user
      const newUser = new User({
        oauthId: profile.id,
        oauthProvider: 'google',
        username: profile.emails[0].value.split('@')[0],
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        profilePicture: profile.photos[0]?.value,
        isEmailVerified: true,
        isPhoneVerified: false,
        isTwoFactorEnabled: false,
      });

      await newUser.save();
      logger.info(`New user created via Google OAuth: ${newUser.email}`);
      return done(null, newUser);
    }
  } catch (error) {
    logger.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: '/api/auth/oauth/facebook/callback',
  profileFields: ['id', 'emails', 'name', 'picture'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails?.[0]?.value });

    if (user) {
      // User exists, update Facebook info if not already set
      if (!user.oauthId) {
        user.oauthId = profile.id;
        await user.save();
      }
      return done(null, user);
    } else {
      // Create new user
      const newUser = new User({
        oauthId: profile.id,
        oauthProvider: 'facebook',
        username: profile.emails[0]?.value?.split('@')[0] || `fb_user_${profile.id}`,
        email: profile.emails?.[0]?.value,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        avatar: profile.photos?.[0]?.value,
        isEmailVerified: true,
        isPhoneVerified: false,
        isTwoFactorEnabled: false,
      });

      await newUser.save();
      logger.info(`New user created via Facebook OAuth: ${newUser.email}`);
      return done(null, newUser);
    }
  } catch (error) {
    logger.error('Facebook OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    logger.error('Deserialize user error:', error);
    done(error, null);
  }
});

module.exports = passport;
