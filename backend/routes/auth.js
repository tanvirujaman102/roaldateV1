const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authenticate, rateLimiter } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth routes
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: {
    error: 'Too many requests. Please try again later.'
  }
});

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Register
router.post('/register',
  authRateLimit,
  [
    body('username')
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-30 characters long and contain only letters, numbers, and underscores'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, and one number'),
    body('firstName')
      .optional()
      .isLength({ max: 50 })
      .trim()
      .withMessage('First name must be less than 50 characters'),
    body('lastName')
      .optional()
      .isLength({ max: 50 })
      .trim()
      .withMessage('Last name must be less than 50 characters'),
    body('phone')
      .optional()
      .matches(/^[+]?[\d\s\-\(\)]+$/)
      .withMessage('Please provide a valid phone number')
  ],
  handleValidationErrors,
  authController.register
);

// Login
router.post('/login',
  authRateLimit,
  [
    body('email')
      .notEmpty()
      .withMessage('Email or username is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    body('twoFactorCode')
      .optional()
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('Two-factor code must be 6 digits')
  ],
  handleValidationErrors,
  authController.login
);

// Verify email
router.get('/verify-email',
  [
    body('token')
      .notEmpty()
      .withMessage('Verification token is required')
  ],
  handleValidationErrors,
  authController.verifyEmail
);

// Resend email verification
router.post('/resend-email-verification',
  authRateLimit,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
  ],
  handleValidationErrors,
  authController.resendEmailVerification
);

// Send phone verification
router.post('/send-phone-verification',
  authRateLimit,
  [
    body('phone')
      .matches(/^[+]?[\d\s\-\(\)]+$/)
      .withMessage('Please provide a valid phone number')
  ],
  handleValidationErrors,
  authController.sendPhoneVerification
);

// Verify phone
router.post('/verify-phone',
  authRateLimit,
  [
    body('phone')
      .matches(/^[+]?[\d\s\-\(\)]+$/)
      .withMessage('Please provide a valid phone number'),
    body('code')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('Verification code must be 6 digits')
  ],
  handleValidationErrors,
  authController.verifyPhone
);

// Forgot password
router.post('/forgot-password',
  authRateLimit,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
  ],
  handleValidationErrors,
  authController.forgotPassword
);

// Reset password
router.post('/reset-password',
  authRateLimit,
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, and one number')
  ],
  handleValidationErrors,
  authController.resetPassword
);

// Change password (authenticated)
router.post('/change-password',
  authenticate,
  authRateLimit,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, and one number')
  ],
  handleValidationErrors,
  authController.changePassword
);

// Setup 2FA
router.post('/setup-2fa',
  authenticate,
  authController.setup2FA
);

// Verify and enable 2FA
router.post('/verify-2fa',
  authenticate,
  [
    body('token')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('Verification code must be 6 digits')
  ],
  handleValidationErrors,
  authController.verifyAndEnable2FA
);

// Disable 2FA
router.post('/disable-2fa',
  authenticate,
  authRateLimit,
  [
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    body('token')
      .optional()
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('Verification code must be 6 digits')
  ],
  handleValidationErrors,
  authController.disable2FA
);

// Refresh token
router.post('/refresh-token',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required')
  ],
  handleValidationErrors,
  authController.refreshToken
);

// Logout
router.post('/logout',
  authenticate,
  authController.logout
);

// Check token validity
router.get('/check-token',
  authenticate,
  (req, res) => {
    res.json({
      valid: true,
      user: req.user.toSafeObject()
    });
  }
);

// Get current user info
router.get('/me',
  authenticate,
  (req, res) => {
    res.json({
      user: req.user.toSafeObject()
    });
  }
);

// OAuth routes
const googleAuthController = require('../controllers/googleAuthController');

router.post('/oauth/google', googleAuthController.googleLogin);
router.post('/oauth/facebook', googleAuthController.facebookLogin);

module.exports = router;
