const mongoose = require('mongoose');

const datingProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    required: true,
    minlength: 50,
    maxlength: 500,
    trim: true
  },
  age: {
    type: Number,
    min: 18,
    max: 100
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  interestedIn: [{
    type: String,
    enum: ['male', 'female', 'other']
  }],
  location: {
    type: String,
    maxlength: 100,
    trim: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number] // [longitude, latitude]
  },
  interests: [{
    type: String,
    maxlength: 30,
    trim: true
  }],
  lookingFor: {
    type: String,
    maxlength: 200,
    trim: true
  },
  relationshipType: {
    type: String,
    enum: ['casual', 'serious', 'friendship', 'any'],
    default: 'any'
  },
  height: {
    type: Number,
    min: 100,
    max: 300 // Height in cm
  },
  education: {
    type: String,
    maxlength: 100,
    trim: true
  },
  job: {
    type: String,
    maxlength: 100,
    trim: true
  },
  company: {
    type: String,
    maxlength: 100,
    trim: true
  },
  photos: [{
    url: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
    ageRange: {
      min: {
        type: Number,
        default: 18,
        min: 18,
        max: 100
      },
      max: {
        type: Number,
        default: 100,
        min: 18,
        max: 100
      }
    },
    maxDistance: {
      type: Number,
      default: 50,
      min: 1,
      max: 500 // Distance in km
    },
    interestedIn: [{
      type: String,
      enum: ['male', 'female', 'other']
    }],
    showOnlyVerified: {
      type: Boolean,
      default: false
    }
  },
  verificationStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'verified', 'rejected']
  },
  verificationDocuments: [{
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isBoosted: {
    type: Boolean,
    default: false
  },
  boostedAt: {
    type: Date
  },
  boostExpiresAt: {
    type: Date
  },
  superLikes: {
    type: Number,
    default: 5
  },
  boosts: {
    type: Number,
    default: 0
  },
  profileViews: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isLookingForPartner: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

datingProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

datingProfileSchema.index({ coordinates: '2dsphere' });
datingProfileSchema.index({ 'preferences.ageRange.min': 1, 'preferences.ageRange.max': 1 });
datingProfileSchema.index({ verificationStatus: 1 });
datingProfileSchema.index({ isBoosted: 1, boostExpiresAt: 1 });
datingProfileSchema.index({ lastActive: -1 });

module.exports = mongoose.model('DatingProfile', datingProfileSchema);
