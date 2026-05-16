const User = require('../models/User');
const Wallet = require('../models/Wallet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const crypto = require('crypto');

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Twilio client setup
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID?.startsWith('AC')) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Generate JWT tokens
const generateTokens = (user) => {
  const accessToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();
  
  return { accessToken, refreshToken };
};

// Send email verification
const sendEmailVerification = async (user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Verify Your RoalDate Account',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin-bottom: 10px;">Welcome to RoalDate!</h1>
          <p style="color: #6b7280; font-size: 16px;">Verify your email to get started</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #374151; margin-bottom: 15px;">Hi ${user.firstName || user.username},</h2>
          <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
            Thank you for signing up for RoalDate! To complete your registration and start using our platform, 
            please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; 
                      border-radius: 8px; font-weight: 600; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 20px;">
            Or copy and paste this link in your browser:<br>
            <span style="color: #6366f1; word-break: break-all;">${verificationUrl}</span>
          </p>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send SMS verification
const sendSMSVerification = async (user, verificationCode) => {
  if (!twilioClient) {
    console.warn('⚠️ Twilio not configured. SMS verification skipped.');
    return;
  }
  const message = `Your RoalDate verification code is: ${verificationCode}. It will expire in 10 minutes.`;
  
  await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: user.phone
  });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Reset Your RoalDate Password',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin-bottom: 10px;">Password Reset</h1>
          <p style="color: #6b7280; font-size: 16px;">Reset your RoalDate password</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #374151; margin-bottom: 15px;">Hi ${user.firstName || user.username},</h2>
          <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your RoalDate account. 
            Click the button below to reset your password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; 
                      border-radius: 8px; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 20px;">
            Or copy and paste this link in your browser:<br>
            <span style="color: #6366f1; word-break: break-all;">${resetUrl}</span>
          </p>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, you can safely ignore this email.</p>
        </div>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Register user
const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmailOrUsername(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email or username already exists'
      });
    }
    
    // Check if phone already exists
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({
          error: 'Phone number already in use'
        });
      }
    }
    
    // Create user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      phone
    });
    
    await user.save();
    
    // Create wallet for user
    const wallet = new Wallet({ user: user._id });
    await wallet.save();
    
    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();
    
    // Send verification email
    await sendEmailVerification(user, emailVerificationToken);
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.',
      user: user.toSafeObject(),
      tokens: { accessToken, refreshToken }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;
    
    // Find user
    const user = await User.findByEmailOrUsername(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }
    
    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        error: 'Account is banned',
        reason: user.banReason
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }
    
    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          requiresTwoFactor: true,
          message: 'Two-factor authentication code required'
        });
      }
      
      const isValid2FA = user.verify2FAToken(twoFactorCode);
      if (!isValid2FA) {
        return res.status(401).json({
          error: 'Invalid two-factor authentication code'
        });
      }
    }
    
    // Update last active
    user.lastActive = new Date();
    user.lastSeen = new Date();
    await user.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    res.json({
      message: 'Login successful',
      user: user.toSafeObject(),
      tokens: { accessToken, refreshToken }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired verification token'
      });
    }
    
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    res.json({
      message: 'Email verified successfully'
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: 'Email verification failed'
    });
  }
};

// Resend email verification
const resendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({
        error: 'Email already verified'
      });
    }
    
    // Generate new token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();
    
    // Send verification email
    await sendEmailVerification(user, emailVerificationToken);
    
    res.json({
      message: 'Verification email sent successfully'
    });
    
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      error: 'Failed to resend verification email'
    });
  }
};

// Send phone verification
const sendPhoneVerification = async (req, res) => {
  try {
    const { phone } = req.body;
    
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    if (user.isPhoneVerified) {
      return res.status(400).json({
        error: 'Phone already verified'
      });
    }
    
    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.phoneVerificationCode = verificationCode;
    user.phoneVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    
    // Send SMS
    await sendSMSVerification(user, verificationCode);
    
    res.json({
      message: 'Verification code sent successfully'
    });
    
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({
      error: 'Failed to send verification code'
    });
  }
};

// Verify phone
const verifyPhone = async (req, res) => {
  try {
    const { phone, code } = req.body;
    
    const user = await User.findOne({
      phone,
      phoneVerificationCode: code,
      phoneVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired verification code'
      });
    }
    
    user.isPhoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpires = undefined;
    await user.save();
    
    res.json({
      message: 'Phone verified successfully'
    });
    
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({
      error: 'Phone verification failed'
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();
    
    // Send reset email
    await sendPasswordResetEmail(user, resetToken);
    
    res.json({
      message: 'Password reset email sent successfully'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Failed to send reset email'
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired reset token'
      });
    }
    
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.lastPasswordChange = new Date();
    await user.save();
    
    res.json({
      message: 'Password reset successful'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Password reset failed'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    user.lastPasswordChange = new Date();
    await user.save();
    
    res.json({
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Password change failed'
    });
  }
};

// Setup 2FA
const setup2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `RoalDate (${user.email})`,
      issuer: 'RoalDate',
      length: 32
    });
    
    // Save secret to user (temporarily)
    user.twoFactorSecret = secret.base32;
    await user.save();
    
    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    
    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32
    });
    
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      error: 'Failed to setup 2FA'
    });
  }
};

// Verify and enable 2FA
const verifyAndEnable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    if (!user.twoFactorSecret) {
      return res.status(400).json({
        error: '2FA setup not initiated'
      });
    }
    
    // Verify token
    const isValid = user.verify2FAToken(token);
    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid verification code'
      });
    }
    
    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();
    
    res.json({
      message: '2FA enabled successfully'
    });
    
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({
      error: 'Failed to enable 2FA'
    });
  }
};

// Disable 2FA
const disable2FA = async (req, res) => {
  try {
    const { password, token } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        error: 'Invalid password'
      });
    }
    
    // Verify 2FA token if 2FA is enabled
    if (user.twoFactorEnabled) {
      const isValid = user.verify2FAToken(token);
      if (!isValid) {
        return res.status(400).json({
          error: 'Invalid 2FA token'
        });
      }
    }
    
    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();
    
    res.json({
      message: '2FA disabled successfully'
    });
    
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({
      error: 'Failed to disable 2FA'
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    
    res.json({
      tokens: { accessToken, refreshToken: newRefreshToken }
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Invalid refresh token'
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    // In a real implementation, you might want to blacklist the token
    // or maintain a list of active tokens
    
    res.json({
      message: 'Logout successful'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed'
    });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendEmailVerification,
  sendPhoneVerification,
  verifyPhone,
  forgotPassword,
  resetPassword,
  changePassword,
  setup2FA,
  verifyAndEnable2FA,
  disable2FA,
  refreshToken,
  logout
};
