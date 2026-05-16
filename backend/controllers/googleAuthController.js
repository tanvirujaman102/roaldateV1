const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Google token is required' });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { email },
        { oauthId: googleId, oauthProvider: 'google' }
      ]
    });

    if (!user) {
      // Create new user
      const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') + Math.floor(Math.random() * 1000);
      
      user = new User({
        email,
        username,
        firstName: name?.split(' ')[0] || '',
        lastName: name?.split(' ').slice(1).join(' ') || '',
        profilePicture: picture || '',
        oauthId: googleId,
        oauthProvider: 'google',
        isEmailVerified: true,
        isActive: true,
        password: Math.random().toString(36).slice(-12) + 'Aa1!', // random password
      });

      await user.save();
    } else {
      // Update OAuth info if missing
      if (!user.oauthId) {
        user.oauthId = googleId;
        user.oauthProvider = 'google';
        user.isEmailVerified = true;
        await user.save();
      }
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Your account has been banned' });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    const tokens = generateTokens(user._id);

    res.json({
      message: 'Google login successful',
      user: user.toSafeObject(),
      tokens,
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
};

exports.facebookLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Facebook access token is required' });
    }

    // Verify Facebook token
    const fbResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );
    const fbData = await fbResponse.json();

    if (fbData.error) {
      return res.status(401).json({ error: 'Invalid Facebook token' });
    }

    const { id: facebookId, name, email, picture } = fbData;

    let user = await User.findOne({
      $or: [
        { email: email || null },
        { oauthId: facebookId, oauthProvider: 'facebook' }
      ].filter(Boolean)
    });

    if (!user) {
      const username = (name?.replace(/\s+/g, '').toLowerCase() || 'user') + Math.floor(Math.random() * 1000);

      user = new User({
        email: email || `fb_${facebookId}@roaldate.com`,
        username,
        firstName: name?.split(' ')[0] || '',
        lastName: name?.split(' ').slice(1).join(' ') || '',
        profilePicture: picture?.data?.url || '',
        oauthId: facebookId,
        oauthProvider: 'facebook',
        isEmailVerified: !!email,
        isActive: true,
        password: Math.random().toString(36).slice(-12) + 'Aa1!',
      });

      await user.save();
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Your account has been banned' });
    }

    user.lastActive = new Date();
    await user.save();

    const tokens = generateTokens(user._id);

    res.json({
      message: 'Facebook login successful',
      user: user.toSafeObject(),
      tokens,
    });

  } catch (error) {
    console.error('Facebook login error:', error);
    res.status(401).json({ error: 'Facebook login failed' });
  }
};
