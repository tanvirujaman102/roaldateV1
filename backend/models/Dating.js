const mongoose = require('mongoose');

const datingProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic Information
  relationshipStatus: {
    type: String,
    enum: ['single', 'in_a_relationship', 'married', 'divorced', 'complicated', 'separated'],
    default: 'single'
  },
  lookingFor: {
    type: String,
    enum: ['relationship', 'casual', 'friendship', 'networking', 'not_sure', 'marriage'],
    default: 'relationship'
  },
  ageRange: {
    min: {
      type: Number,
      min: 18,
      max: 100
    },
    max: {
      type: Number,
      min: 18,
      max: 100
    }
  },
  maxDistance: {
    type: Number,
    default: 50, // kilometers
    min: 1,
    max: 500
  },
  
  // Physical Attributes
  height: {
    type: String,
    enum: [
      'very_short', 'short', 'average', 'tall', 'very_tall',
      '4\'11"', '5\'0"', '5\'1"', '5\'2"', '5\'3"', '5\'4"', '5\'5"', '5\'6"', 
      '5\'7"', '5\'8"', '5\'9"', '5\'10"', '5\'11"', '6\'0"', '6\'1"', '6\'2"', 
      '6\'3"', '6\'4"', '6\'5"', '6\'6"', 'over_6\'6"'
    ]
  },
  bodyType: {
    type: String,
    enum: ['slim', 'athletic', 'average', 'curvy', 'muscular', 'heavyset', 'prefer_not_to_say']
  },
  ethnicity: {
    type: String,
    enum: ['asian', 'black', 'hispanic', 'indian', 'middle_eastern', 'native_american', 'pacific_islander', 'white', 'mixed', 'other', 'prefer_not_to_say']
  },
  eyeColor: {
    type: String,
    enum: ['brown', 'blue', 'green', 'hazel', 'gray', 'amber', 'other', 'prefer_not_to_say']
  },
  hairColor: {
    type: String,
    enum: ['black', 'brown', 'blonde', 'red', 'gray', 'bald', 'other', 'dyed', 'prefer_not_to_say']
  },
  
  // Lifestyle
  education: {
    type: String,
    enum: [
      'high_school', 'some_college', 'bachelors', 'masters', 'phd', 
      'trade_school', 'self_taught', 'other', 'prefer_not_to_say'
    ]
  },
  jobTitle: String,
  company: String,
  industry: String,
  income: {
    type: String,
    enum: [
      'under_30k', '30k_50k', '50k_75k', '75k_100k', '100k_150k', 
      '150k_250k', 'over_250k', 'prefer_not_to_say'
    ]
  },
  smoking: {
    type: String,
    enum: ['no', 'yes', 'sometimes', 'trying_to_quit', 'prefer_not_to_say'],
    default: 'no'
  },
  drinking: {
    type: String,
    enum: ['no', 'yes', 'sometimes', 'socially', 'prefer_not_to_say'],
    default: 'socially'
  },
  drugs: {
    type: String,
    enum: ['no', 'yes', 'sometimes', 'prefer_not_to_say'],
    default: 'no'
  },
  
  // Family & Future
  children: {
    type: String,
    enum: ['no', 'yes', 'want_someday', 'not_sure', 'prefer_not_to_say'],
    default: 'not_sure'
  },
  numberOfChildren: {
    type: Number,
    min: 0,
    max: 10
  },
  childrenLivingWithYou: {
    type: Boolean,
    default: false
  },
  wantChildren: {
    type: String,
    enum: ['definitely', 'maybe', 'no', 'not_sure', 'prefer_not_to_say'],
    default: 'maybe'
  },
  
  // Pets
  pets: [{
    type: String,
    enum: ['dogs', 'cats', 'birds', 'fish', 'reptiles', 'small_mammals', 'other']
  }],
  petFriendly: {
    type: Boolean,
    default: true
  },
  
  // Interests & Hobbies
  interests: [{
    type: String,
    enum: [
      'travel', 'cooking', 'reading', 'gaming', 'sports', 'fitness', 'music', 'movies',
      'art', 'photography', 'dancing', 'hiking', 'camping', 'fishing', 'gardening',
      'writing', 'volunteering', 'politics', 'technology', 'fashion', 'beauty',
      'food', 'wine', 'craft_beer', 'coffee', 'tea', 'nightlife', 'shopping',
      'yoga', 'meditation', 'spirituality', 'religion', 'science', 'history',
      'languages', 'learning', 'teaching', 'entrepreneurship', 'investing',
      'cryptocurrency', 'stocks', 'real_estate', 'cars', 'motorcycles', 'boats',
      'anime', 'comics', 'board_games', 'video_games', 'streaming', 'podcasts',
      'comedy', 'theater', 'concerts', 'festivals', 'museums', 'architecture'
    ]
  }],
  hobbies: [String],
  skills: [String],
  
  // Personality
  personalityTraits: [{
    type: String,
    enum: [
      'adventurous', 'ambitious', 'analytical', 'artistic', 'athletic', 'caring',
      'charismatic', 'compassionate', 'confident', 'creative', 'curious', 'easygoing',
      'empathetic', 'energetic', 'extroverted', 'funny', 'generous', 'genuine',
      'honest', 'humorous', 'independent', 'intelligent', 'intuitive', 'introverted',
      'loyal', 'mature', 'open_minded', 'optimistic', 'passionate', 'patient',
      'practical', 'romantic', 'selfless', 'sensitive', 'spontaneous', 'thoughtful',
      'trustworthy', 'witty'
    ]
  }],
  loveLanguage: {
    type: String,
    enum: ['words_of_affirmation', 'acts_of_service', 'receiving_gifts', 'quality_time', 'physical_touch'],
    default: 'quality_time'
  },
  
  // Preferences
  genderPreference: {
    type: String,
    enum: ['men', 'women', 'both', 'non_binary', 'everyone'],
    default: 'everyone'
  },
  relationshipGoals: [String],
  dealBreakers: [{
    type: String,
    enum: [
      'smoking', 'drinking', 'drugs', 'different_religion', 'different_political_views',
      'long_distance', 'doesnt_want_kids', 'already_has_kids', 'not_educated',
      'different_income_level', 'not_physically_active', 'not_adventurous',
      'too_busy', 'not_ready_for_commitment', 'still_married', 'lives_with_parents'
    ]
  }],
  
  // Location
  currentLocation: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  willingToRelocate: {
    type: Boolean,
    default: false
  },
  
  // Social Media
  socialMedia: {
    instagram: String,
    twitter: String,
    linkedin: String,
    tiktok: String,
    snapchat: String
  },
  
  // Photos
  photos: [{
    url: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    caption: String,
    approved: {
      type: Boolean,
      default: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    reports: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  
  // Bio & Prompts
  bio: {
    type: String,
    maxlength: 500,
    required: true
  },
  prompts: [{
    question: String,
    answer: {
      type: String,
      maxlength: 300
    },
    answeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationMethod: {
    type: String,
    enum: ['photo', 'id', 'social_media', 'phone', 'video'],
    sparse: true
  },
  verificationSubmittedAt: Date,
  verificationApprovedAt: Date,
  
  // Privacy
  showAge: {
    type: Boolean,
    default: true
  },
  showDistance: {
    type: Boolean,
    default: true
  },
  incognito: {
    type: Boolean,
    default: false
  },
  
  // Activity
  lastActive: {
    type: Date,
    default: Date.now
  },
  swipeCount: {
    type: Number,
    default: 0
  },
  matchCount: {
    type: Number,
    default: 0
  },
  messageCount: {
    type: Number,
    default: 0
  },
  
  // Boost & Super Features
  boosts: {
    active: {
      type: Boolean,
      default: false
    },
    expiresAt: Date,
    remaining: {
      type: Number,
      default: 0
    }
  },
  superLikes: {
    remaining: {
      type: Number,
      default: 3
    },
    dailyReset: Date
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: String,
  
  // AI Matching
  aiProfile: {
    personalityScore: Number,
    compatibilityFactors: [{
      factor: String,
      score: Number,
      weight: Number
    }],
    recommendations: [String],
    lastAnalyzed: Date
  }
}, {
  timestamps: true
});

const matchSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Match Information
  matchType: {
    type: String,
    enum: ['mutual', 'super_like', 'boost', 'ai_recommended'],
    default: 'mutual'
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Match Details
  compatibilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  commonInterests: [String],
  distance: Number, // in kilometers
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'matched', 'messaged', 'met', 'relationship', 'ended'],
    default: 'matched'
  },
  
  // Timeline
  matchedAt: {
    type: Date,
    default: Date.now
  },
  firstMessageAt: Date,
  lastMessageAt: Date,
  metAt: Date,
  endedAt: Date,
  endedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  endReason: String,
  
  // Interaction Stats
  messageCount: {
    type: Number,
    default: 0
  },
  lastInteraction: Date,
  
  // Reports
  reports: [{
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['inappropriate_behavior', 'fake_profile', 'spam', 'harassment', 'other'],
      required: true
    },
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending'
    }
  }],
  
  // Notes
  notes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const swipeSchema = new mongoose.Schema({
  swiper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  swiped: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Swipe Details
  direction: {
    type: String,
    enum: ['left', 'right', 'up'], // left = no, right = like, up = super like
    required: true
  },
  swipeType: {
    type: String,
    enum: ['regular', 'super_like', 'boost'],
    default: 'regular'
  },
  
  // Timing
  swipedAt: {
    type: Date,
    default: Date.now
  },
  
  // Context
  profileViewDuration: Number, // in seconds
  photosViewed: Number,
  bioRead: {
    type: Boolean,
    default: false
  },
  
  // Result
  resultedInMatch: {
    type: Boolean,
    default: false
  },
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    sparse: true
  }
}, {
  timestamps: true
});

// Virtual Fields
datingProfileSchema.virtual('age').get(function() {
  if (!this.user.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.user.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

datingProfileSchema.virtual('primaryPhoto').get(function() {
  return this.photos.find(photo => photo.isPrimary) || this.photos[0];
});

datingProfileSchema.virtual('photoCount').get(function() {
  return this.photos.length;
});

matchSchema.virtual('daysSinceMatch').get(function() {
  return Math.floor((Date.now() - this.matchedAt) / (1000 * 60 * 60 * 24));
});

// Indexes
datingProfileSchema.index({ user: 1 });
datingProfileSchema.index({ isActive: 1, isPaused: 1, isBanned: 1 });
datingProfileSchema.index({ 'currentLocation.coordinates': '2dsphere' });
datingProfileSchema.index({ lastActive: -1 });
datingProfileSchema.index({ genderPreference: 1 });

matchSchema.index({ user1: 1, user2: 1 }, { unique: true });
matchSchema.index({ status: 1, matchedAt: -1 });
matchSchema.index({ compatibilityScore: -1 });

swipeSchema.index({ swiper: 1, swipedAt: -1 });
swipeSchema.index({ swiper: 1, swiped: 1 }, { unique: true });
swipeSchema.index({ swiped: 1, direction: 1 });

// Methods
datingProfileSchema.methods.addPhoto = function(photoUrl, isPrimary = false) {
  if (isPrimary) {
    this.photos.forEach(photo => photo.isPrimary = false);
  }
  
  this.photos.push({
    url: photoUrl,
    isPrimary,
    uploadedAt: new Date()
  });
  
  return this.save();
};

datingProfileSchema.methods.removePhoto = function(photoId) {
  this.photos = this.photos.filter(photo => photo._id.toString() !== photoId.toString());
  
  // If we removed the primary photo, make the first one primary
  if (this.photos.length > 0 && !this.photos.some(photo => photo.isPrimary)) {
    this.photos[0].isPrimary = true;
  }
  
  return this.save();
};

datingProfileSchema.methods.setPrimaryPhoto = function(photoId) {
  this.photos.forEach(photo => {
    photo.isPrimary = photo._id.toString() === photoId.toString();
  });
  
  return this.save();
};

matchSchema.methods.addMessage = function() {
  this.messageCount += 1;
  this.lastMessageAt = new Date();
  
  if (this.status === 'matched') {
    this.status = 'messaged';
    this.firstMessageAt = new Date();
  }
  
  return this.save();
};

matchSchema.methods.endMatch = function(endedBy, reason) {
  this.status = 'ended';
  this.endedBy = endedBy;
  this.endReason = reason;
  this.endedAt = new Date();
  
  return this.save();
};

// Static Methods
datingProfileSchema.statics.findNearbyProfiles = function(userId, maxDistance = 50, limit = 20) {
  return this.findOne({ user: userId })
    .then(userProfile => {
      if (!userProfile) return [];
      
      return this.find({
        user: { $ne: userId },
        isActive: true,
        isPaused: false,
        isBanned: false,
        'currentLocation.coordinates': {
          $near: {
            $geometry: userProfile.currentLocation.coordinates,
            $maxDistance: maxDistance * 1000 // Convert km to meters
          }
        }
      })
      .populate('user', 'username fullName profilePicture dateOfBirth')
      .limit(limit);
    });
};

datingProfileSchema.statics.findRecommendedProfiles = function(userId, limit = 20) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' } },
    { $unwind: '$userInfo' },
    { $lookup: { from: 'swipes', localField: 'user', foreignField: 'swiped', as: 'swipes' } },
    { $match: { 'swipes.swiper': { $ne: mongoose.Types.ObjectId(userId) } } },
    { $sort: { lastActive: -1 } },
    { $limit: limit }
  ]);
};

matchSchema.statics.findUserMatches = function(userId, options = {}) {
  const { limit = 20, skip = 0, status = null } = options;
  
  const query = {
    $or: [
      { user1: userId },
      { user2: userId }
    ]
  };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('user1 user2', 'username fullName profilePicture')
    .sort({ matchedAt: -1 })
    .limit(limit)
    .skip(skip);
};

const DatingProfile = mongoose.model('DatingProfile', datingProfileSchema);
const Match = mongoose.model('Match', matchSchema);
const Swipe = mongoose.model('Swipe', swipeSchema);

module.exports = {
  DatingProfile,
  Match,
  Swipe
};
