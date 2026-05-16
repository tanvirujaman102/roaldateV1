const mongoose = require('mongoose');

const partyRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['voice', 'video', 'both'],
    default: 'both'
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: 2,
    max: 50,
    default: 10
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    maxlength: 20,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bannedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  mutedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  screenSharing: {
    isActive: {
      type: Boolean,
      default: false
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startedAt: {
      type: Date
    }
  },
  recording: {
    isActive: {
      type: Boolean,
      default: false
    },
    url: {
      type: String
    },
    startedAt: {
      type: Date
    }
  },
  history: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      enum: ['join', 'leave', 'mute', 'unmute', 'kick', 'ban', 'screen_share_start', 'screen_share_stop']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  settings: {
    allowScreenSharing: {
      type: Boolean,
      default: true
    },
    allowRecording: {
      type: Boolean,
      default: false
    },
    requirePassword: {
      type: Boolean,
      default: false
    },
    autoModerate: {
      type: Boolean,
      default: false
    }
  },
  tags: [{
    type: String,
    maxlength: 30,
    trim: true
  }],
  category: {
    type: String,
    enum: ['general', 'gaming', 'music', 'study', 'dating', 'business', 'entertainment', 'other'],
    default: 'general'
  },
  language: {
    type: String,
    default: 'en'
  },
  country: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isTemporary: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date
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

partyRoomSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

partyRoomSchema.index({ createdBy: 1 });
partyRoomSchema.index({ participants: 1 });
partyRoomSchema.index({ type: 1 });
partyRoomSchema.index({ category: 1 });
partyRoomSchema.index({ isPrivate: 1 });
partyRoomSchema.index({ isActive: 1 });
partyRoomSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PartyRoom', partyRoomSchema);
