const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

const userSchema = new mongoose.Schema({
  // Basic Information
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: function() {
      return !this.oauthProvider; // Password not required for OAuth users
    },
    minlength: 6
  },
  phone: {
    type: String,
    sparse: true,
    unique: true
  },
  
  // Profile Information
  firstName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  
  // Location
  location: {
    country: String,
    state: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Profile Media
  profilePicture: {
    type: String,
    default: ''
  },
  coverPhoto: {
    type: String,
    default: ''
  },
  
  // Social Links
  socialLinks: {
    website: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    youtube: String,
    tiktok: String
  },
  
  // Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isProfileVerified: {
    type: Boolean,
    default: false
  },
  verificationBadge: {
    type: String,
    enum: ['none', 'blue', 'gold', 'premium'],
    default: 'none'
  },
  
  // OAuth
  oauthProvider: {
    type: String,
    enum: ['google', 'facebook', 'apple'],
    sparse: true
  },
  oauthId: {
    type: String,
    sparse: true
  },
  
  // Security
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  lastPasswordChange: {
    type: Date,
    default: Date.now
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: String,
  banExpires: Date,
  
  // Privacy Settings
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    showOnlineStatus: {
      type: Boolean,
      default: true
    },
    allowMessages: {
      type: String,
      enum: ['everyone', 'friends', 'none'],
      default: 'everyone'
    },
    allowRandomChat: {
      type: Boolean,
      default: true
    },
    allowDatingProfile: {
      type: Boolean,
      default: true
    }
  },
  
  // Social Stats
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Saved Posts
  savedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  
  // Dating Profile
  datingProfile: {
    enabled: {
      type: Boolean,
      default: false
    },
    relationshipStatus: {
      type: String,
      enum: ['single', 'in_a_relationship', 'married', 'divorced', 'complicated'],
      default: 'single'
    },
    lookingFor: {
      type: String,
      enum: ['relationship', 'casual', 'friendship', 'networking', 'not_sure'],
      default: 'relationship'
    },
    interests: [String],
    height: String,
    education: String,
    job: String,
    company: String,
    smoking: {
      type: String,
      enum: ['no', 'yes', 'sometimes'],
      default: 'no'
    },
    drinking: {
      type: String,
      enum: ['no', 'yes', 'sometimes'],
      default: 'no'
    },
    children: {
      type: String,
      enum: ['no', 'yes', 'someday'],
      default: 'no'
    },
    pets: [String],
    languages: [String],
    favoriteMusic: [String],
    favoriteMovies: [String],
    favoriteBooks: [String],
    travelDestinations: [String],
    personalityTraits: [String],
    dealBreakers: [String]
  },
  
  // Wallet Information
  wallet: {
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    coins: {
      type: Number,
      default: 0,
      min: 0
    },
    premiumExpiry: Date,
    subscriptionType: {
      type: String,
      enum: ['free', 'basic', 'premium', 'vip'],
      default: 'free'
    }
  },
  
  // Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      push: {
        type: Boolean,
        default: true
      },
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      inApp: {
        type: Boolean,
        default: true
      }
    },
    chatSettings: {
      showReadReceipts: {
        type: Boolean,
        default: true
      },
      showTypingIndicators: {
        type: Boolean,
        default: true
      },
      autoPlayVideos: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Device Information
  devices: [{
    deviceId: String,
    deviceType: {
      type: String,
      enum: ['web', 'ios', 'android']
    },
    pushToken: String,
    lastActive: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Activity Tracking
  lastSeen: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  onlineStatus: {
    type: String,
    enum: ['online', 'away', 'offline', 'busy'],
    default: 'offline'
  },
  
  // Content Stats
  stats: {
    postsCount: {
      type: Number,
      default: 0
    },
    storiesCount: {
      type: Number,
      default: 0
    },
    reelsCount: {
      type: Number,
      default: 0
    },
    likesReceived: {
      type: Number,
      default: 0
    },
    commentsReceived: {
      type: Number,
      default: 0
    },
    sharesReceived: {
      type: Number,
      default: 0
    }
  },
  
  // Creator Features
  creatorProfile: {
    enabled: {
      type: Boolean,
      default: false
    },
    category: String,
    description: String,
    pricing: {
      monthlySubscription: Number,
      exclusiveContent: Number,
      personalMessage: Number,
      videoCall: Number
    },
    earnings: {
      total: {
        type: Number,
        default: 0
      },
      monthly: {
        type: Number,
        default: 0
      },
      withdrawable: {
        type: Number,
        default: 0
      }
    },
    subscribers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      subscribedAt: {
        type: Date,
        default: Date.now
      },
      expiresAt: Date,
      tier: String
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual Fields
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

userSchema.virtual('isOnline').get(function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.lastActive > fiveMinutesAgo;
});


userSchema.virtual('avatar').get(function() {
  return this.profilePicture || '';
});

// Indexes
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ isActive: 1, isBanned: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastActive: -1 });

// Password Hashing Middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function() {
  const payload = {
    userId: this._id,
    email: this.email,
    username: this.username,
    role: this.role || 'user'
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

userSchema.methods.generateRefreshToken = function() {
  const payload = {
    userId: this._id,
    type: 'refresh'
  };
  
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

userSchema.methods.generate2FASecret = function() {
  return speakeasy.generateSecret({
    name: `RoalDate (${this.email})`,
    issuer: 'RoalDate',
    length: 32
  });
};

userSchema.methods.verify2FAToken = function(token) {
  return speakeasy.totp.verify({
    secret: this.twoFactorSecret,
    encoding: 'base32',
    token: token,
    window: 2
  });
};

userSchema.methods.toSafeObject = function() {
  const user = this.toObject();
  delete user.password;
  delete user.twoFactorSecret;
  return user;
};

// Static Methods
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  });
};

userSchema.statics.findActiveUsers = function(filter = {}) {
  return this.find({
    ...filter,
    isActive: true,
    isBanned: false
  });
};

module.exports = mongoose.model('User', userSchema);
