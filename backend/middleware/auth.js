const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate user
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password -twoFactorSecret');
      
      if (!user) {
        return res.status(401).json({
          error: 'Invalid token. User not found.'
        });
      }
      
      if (!user.isActive) {
        return res.status(401).json({
          error: 'Account is deactivated.'
        });
      }
      
      if (user.isBanned) {
        return res.status(403).json({
          error: 'Account is banned.',
          reason: user.banReason
        });
      }
      
      req.user = user;
      next();
      
    } catch (tokenError) {
      return res.status(401).json({
        error: 'Invalid token.'
      });
    }
    
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed.'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password -twoFactorSecret');
      
      if (user && user.isActive && !user.isBanned) {
        req.user = user;
      }
      
      next();
      
    } catch (tokenError) {
      next();
    }
    
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required.'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin access required.'
    });
  }
  
  next();
};

// Check if user is moderator or admin
const requireModerator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required.'
    });
  }
  
  if (!['admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({
      error: 'Moderator access required.'
    });
  }
  
  next();
};

// Check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required.'
    });
  }
  
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      error: 'Email verification required.'
    });
  }
  
  next();
};

// Check if user has premium subscription
const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required.'
    });
  }
  
  const subscriptionType = req.user.wallet?.subscription?.type || 'free';
  
  if (!['basic', 'premium', 'vip'].includes(subscriptionType)) {
    return res.status(403).json({
      error: 'Premium subscription required.'
    });
  }
  
  next();
};

// Check if user has specific subscription tier
const requireSubscriptionTier = (requiredTier) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required.'
      });
    }
    
    const subscriptionType = req.user.wallet?.subscription?.type || 'free';
    
    const tierHierarchy = {
      'free': 0,
      'basic': 1,
      'premium': 2,
      'vip': 3
    };
    
    if (tierHierarchy[subscriptionType] < tierHierarchy[requiredTier]) {
      return res.status(403).json({
        error: `${requiredTier} subscription required.`
      });
    }
    
    next();
  };
};

// Rate limiting middleware
const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.user ? req.user._id.toString() : req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old requests
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    }
    
    // Check rate limit
    const userRequests = requests.get(key) || [];
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    userRequests.push(now);
    requests.set(key, userRequests);
    
    next();
  };
};

// Check if user can access resource
const checkResourceAccess = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const userId = req.user._id;
      
      let resource;
      let ownerField;
      
      switch (resourceType) {
        case 'post':
          resource = require('../models/Post').findById(resourceId);
          ownerField = 'author';
          break;
        case 'chat':
          resource = require('../models/Chat').findById(resourceId);
          ownerField = 'participants.user';
          break;
        case 'party':
          resource = require('../models/Party').findById(resourceId);
          ownerField = 'participants.user';
          break;
        default:
          return res.status(400).json({
            error: 'Invalid resource type.'
          });
      }
      
      resource = await resource;
      
      if (!resource) {
        return res.status(404).json({
          error: 'Resource not found.'
        });
      }
      
      // Check if user is owner or participant
      if (ownerField === 'participants.user') {
        const isParticipant = resource.participants.some(p => 
          p.user.toString() === userId.toString()
        );
        
        if (!isParticipant) {
          return res.status(403).json({
            error: 'Access denied. You are not a participant.'
          });
        }
      } else {
        if (resource[ownerField].toString() !== userId.toString()) {
          return res.status(403).json({
            error: 'Access denied. You are not the owner.'
          });
        }
      }
      
      req.resource = resource;
      next();
      
    } catch (error) {
      console.error('Resource access check error:', error);
      res.status(500).json({
        error: 'Failed to check resource access.'
      });
    }
  };
};

// Check if user is not blocked by another user
const checkNotBlocked = (targetUserIdField = 'targetUserId') => {
  return async (req, res, next) => {
    try {
      const currentUserId = req.user._id;
      const targetUserId = req.params[targetUserIdField] || req.body[targetUserIdField];
      
      const targetUser = await User.findById(targetUserId);
      
      if (!targetUser) {
        return res.status(404).json({
          error: 'Target user not found.'
        });
      }
      
      // Check if current user is blocked by target user
      if (targetUser.blockedUsers.includes(currentUserId)) {
        return res.status(403).json({
          error: 'Access denied. You are blocked by this user.'
        });
      }
      
      // Check if target user is blocked by current user
      if (req.user.blockedUsers.includes(targetUserId)) {
        return res.status(403).json({
          error: 'Access denied. You have blocked this user.'
        });
      }
      
      next();
      
    } catch (error) {
      console.error('Block check error:', error);
      res.status(500).json({
        error: 'Failed to check block status.'
      });
    }
  };
};

// Validate user permissions for specific actions
const validatePermissions = (action, resourceType) => {
  return (req, res, next) => {
    const user = req.user;
    const resource = req.resource;
    
    // Admin can do everything
    if (user.role === 'admin') {
      return next();
    }
    
    // Moderator permissions
    if (user.role === 'moderator') {
      const moderatorActions = ['view', 'moderate', 'report'];
      if (moderatorActions.includes(action)) {
        return next();
      }
    }
    
    // Owner permissions
    if (resource && resource.author && resource.author.toString() === user._id.toString()) {
      return next();
    }
    
    // Public actions
    const publicActions = ['view', 'like', 'comment', 'share'];
    if (publicActions.includes(action)) {
      return next();
    }
    
    return res.status(403).json({
      error: 'Insufficient permissions for this action.'
    });
  };
};

// Check device authentication
const checkDeviceAuth = async (req, res, next) => {
  try {
    const deviceId = req.header('X-Device-ID');
    const deviceToken = req.header('X-Device-Token');
    
    if (!deviceId || !deviceToken) {
      return res.status(401).json({
        error: 'Device authentication required.'
      });
    }
    
    const user = req.user;
    
    // Check if device is registered
    const device = user.devices.find(d => 
      d.deviceId === deviceId && 
      d.isActive && 
      d.deviceToken === deviceToken
    );
    
    if (!device) {
      return res.status(401).json({
        error: 'Invalid device credentials.'
      });
    }
    
    // Update device last active
    device.lastActive = new Date();
    await user.save();
    
    req.device = device;
    next();
    
  } catch (error) {
    console.error('Device auth check error:', error);
    res.status(500).json({
      error: 'Device authentication failed.'
    });
  }
};

// API key authentication for external services
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'API key required.'
      });
    }
    
    // In a real implementation, you would validate the API key
    // against a database of valid keys
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({
        error: 'Invalid API key.'
      });
    }
    
    next();
    
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({
      error: 'API key authentication failed.'
    });
  }
};

module.exports = {
  protect: authenticate, // Add protect alias for authenticate
  authenticate,
  optionalAuth,
  requireAdmin,
  requireModerator,
  requireVerification,
  requirePremium,
  requireSubscriptionTier,
  rateLimiter,
  checkResourceAccess,
  checkNotBlocked,
  validatePermissions,
  checkDeviceAuth,
  authenticateApiKey
};
