const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
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
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Party Type
  type: {
    type: String,
    enum: ['voice', 'video', 'mixed', 'stage', 'broadcast'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'social', 'gaming', 'music', 'study', 'business', 'dating', 'entertainment',
      'sports', 'news', 'education', 'technology', 'art', 'fitness', 'travel',
      'food', 'fashion', 'comedy', 'politics', 'spirituality', 'other'
    ],
    default: 'social'
  },
  
  // Privacy Settings
  privacy: {
    type: String,
    enum: ['public', 'private', 'invite_only', 'password_protected'],
    required: true,
    default: 'public'
  },
  password: {
    type: String,
    required: function() {
      return this.privacy === 'password_protected';
    }
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Capacity
  maxParticipants: {
    type: Number,
    default: 50,
    min: 2,
    max: 1000
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  
  // Schedule
  isScheduled: {
    type: Boolean,
    default: false
  },
  scheduledFor: Date,
  duration: {
    type: Number,
    default: 120 // minutes
  },
  startedAt: Date,
  endedAt: Date,
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'waiting', 'live', 'ended', 'cancelled'],
    default: 'waiting'
  },
  
  // Participants
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['host', 'co_host', 'moderator', 'speaker', 'listener', 'audience'],
      default: 'listener'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: Date,
    duration: Number, // Participation duration in seconds
    
    // Media State
    mediaState: {
      audioEnabled: {
        type: Boolean,
        default: false
      },
      videoEnabled: {
        type: Boolean,
        default: false
      },
      screenSharing: {
        type: Boolean,
        default: false
      },
      isMuted: {
        type: Boolean,
        default: true
      },
      isDeafened: {
        type: Boolean,
        default: false
      }
    },
    
    // Voice/Video Settings
    voiceSettings: {
      volume: {
        type: Number,
        default: 100,
        min: 0,
        max: 200
      },
      echoCancellation: {
        type: Boolean,
        default: true
      },
      noiseSuppression: {
        type: Boolean,
        default: true
      },
      autoGainControl: {
        type: Boolean,
        default: true
      }
    },
    
    // Permissions
    permissions: {
      canSpeak: {
        type: Boolean,
        default: false
      },
      canVideo: {
        type: Boolean,
        default: false
      },
      canShare: {
        type: Boolean,
        default: false
      },
      canModerate: {
        type: Boolean,
        default: false
      }
    },
    
    // Connection Info
    socketId: String,
    connectionState: {
      type: String,
      enum: ['connecting', 'connected', 'disconnected', 'reconnecting'],
      default: 'connecting'
    },
    
    // Quality Metrics
    quality: {
      latency: Number,
      packetLoss: Number,
      bandwidth: Number,
      connectionScore: Number
    },
    
    // Hand State (for raising hand)
    handRaised: {
      type: Boolean,
      default: false
    },
    handRaisedAt: Date
  }],
  
  // Moderation
  moderators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  blockedUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    blockedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date
  }],
  
  // Party Settings
  settings: {
    allowScreenShare: {
      type: Boolean,
      default: true
    },
    requireApprovalToSpeak: {
      type: Boolean,
      default: false
    },
    autoMuteOnJoin: {
      type: Boolean,
      default: true
    },
    enableRecording: {
      type: Boolean,
      default: false
    },
    enableChat: {
      type: Boolean,
      default: true
    },
    enableReactions: {
      type: Boolean,
      default: true
    },
    enableRaiseHand: {
      type: Boolean,
      default: true
    },
    waitingRoom: {
      enabled: {
        type: Boolean,
        default: false
      },
      participants: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }]
    }
  },
  
  // Media & Recording
  recording: {
    isRecording: {
      type: Boolean,
      default: false
    },
    recordingUrl: String,
    recordingStartedAt: Date,
    recordingEndedAt: Date,
    recordingSize: Number,
    thumbnailUrl: String,
    recordings: [{
      type: {
        type: String,
        enum: ['audio', 'video', 'screen']
      },
      url: String,
      duration: Number,
      size: Number,
      recordedAt: Date
    }]
  },
  
  // Live Streaming
  streaming: {
    isStreaming: {
      type: Boolean,
      default: false
    },
    streamUrl: String,
    streamKey: String,
    platform: {
      type: String,
      enum: ['youtube', 'twitch', 'facebook', 'instagram', 'tiktok', 'custom']
    },
    viewerCount: {
      type: Number,
      default: 0
    },
    peakViewers: {
      type: Number,
      default: 0
    }
  },
  
  // Chat
  chat: {
    enabled: {
      type: Boolean,
      default: true
    },
    messages: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      message: {
        type: String,
        required: true,
        maxlength: 500
      },
      type: {
        type: String,
        enum: ['text', 'emoji', 'reaction', 'system'],
        default: 'text'
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      emoji: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Reactions & Emojis
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Analytics
  analytics: {
    totalParticipants: {
      type: Number,
      default: 0
    },
    peakParticipants: {
      type: Number,
      default: 0
    },
    averageDuration: {
      type: Number,
      default: 0
    },
    totalMessages: {
      type: Number,
      default: 0
    },
    totalReactions: {
      type: Number,
      default: 0
    },
    engagementScore: {
      type: Number,
      default: 0
    },
    qualityScore: {
      type: Number,
      default: 0
    }
  },
  
  // Features
  features: {
    backgroundMusic: {
      enabled: {
        type: Boolean,
        default: false
      },
      track: String,
      volume: {
        type: Number,
        default: 50,
        min: 0,
        max: 100
      }
    },
    soundEffects: {
      enabled: {
        type: Boolean,
        default: true
      }
    },
    themes: {
      type: String,
      enum: ['default', 'party', 'professional', 'casual', 'gaming', 'study'],
      default: 'default'
    },
    customBackground: String
  },
  
  // Tags & Discovery
  tags: [String],
  interests: [String],
  language: {
    type: String,
    default: 'en'
  },
  
  // Location (for local parties)
  location: {
    type: String,
    enum: ['virtual', 'physical'],
    default: 'virtual'
  },
  physicalLocation: {
    venue: String,
    address: String,
    city: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Reports & Moderation
  reports: [{
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['inappropriate_content', 'harassment', 'spam', 'noise', 'other'],
      required: true
    },
    description: String,
    evidence: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  }],
  
  // AI Moderation
  aiModeration: {
    enabled: {
      type: Boolean,
      default: true
    },
    alerts: [{
      type: {
        type: String,
        enum: ['inappropriate_language', 'noise_detected', 'spam_detected', 'harassment_detected']
      },
      confidence: Number,
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      action: {
        type: String,
        enum: ['warning', 'mute', 'kick', 'report'],
        default: 'warning'
      }
    }],
    autoActions: {
      muteOnViolation: {
        type: Boolean,
        default: false
      },
      kickOnSevereViolation: {
        type: Boolean,
        default: false
      },
      reportViolations: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true
});

// Virtual Fields
partySchema.virtual('participantCount').get(function() {
  return this.participants.filter(p => !p.leftAt).length;
});

partySchema.virtual('activeParticipants').get(function() {
  return this.participants.filter(p => 
    !p.leftAt && p.connectionState === 'connected'
  ).length;
});

partySchema.virtual('isLive').get(function() {
  return this.status === 'live';
});

partySchema.virtual('isFull').get(function() {
  return this.participantCount >= this.maxParticipants;
});

partySchema.virtual('duration').get(function() {
  if (!this.startedAt) return 0;
  const endTime = this.endedAt || new Date();
  return Math.floor((endTime - this.startedAt) / 1000); // seconds
});

// Indexes
partySchema.index({ host: 1, createdAt: -1 });
partySchema.index({ status: 1, privacy: 1 });
partySchema.index({ category: 1, status: 1 });
partySchema.index({ scheduledFor: 1 });
partySchema.index({ 'participants.user': 1 });
partySchema.index({ tags: 1 });
partySchema.index({ location: '2dsphere' });

// Methods
partySchema.methods.addParticipant = function(userId, role = 'listener') {
  const existingParticipant = this.participants.find(p => 
    p.user.toString() === userId.toString() && !p.leftAt
  );
  
  if (existingParticipant) {
    return this; // User already in party
  }
  
  if (this.participantCount >= this.maxParticipants) {
    throw new Error('Party is full');
  }
  
  this.participants.push({
    user: userId,
    role,
    joinedAt: new Date()
  });
  
  this.currentParticipants = this.participantCount;
  this.analytics.totalParticipants += 1;
  
  if (this.participantCount > this.analytics.peakParticipants) {
    this.analytics.peakParticipants = this.participantCount;
  }
  
  return this.save();
};

partySchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString() && !p.leftAt
  );
  
  if (participant) {
    participant.leftAt = new Date();
    participant.duration = Math.floor((participant.leftAt - participant.joinedAt) / 1000);
    participant.connectionState = 'disconnected';
    
    this.currentParticipants = this.participantCount;
  }
  
  return this.save();
};

partySchema.methods.updateParticipantRole = function(userId, newRole) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString() && !p.leftAt
  );
  
  if (participant) {
    participant.role = newRole;
  }
  
  return this.save();
};

partySchema.methods.updateMediaState = function(userId, mediaState) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString() && !p.leftAt
  );
  
  if (participant) {
    participant.mediaState = { ...participant.mediaState, ...mediaState };
  }
  
  return this.save();
};

partySchema.methods.raiseHand = function(userId) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString() && !p.leftAt
  );
  
  if (participant) {
    participant.handRaised = true;
    participant.handRaisedAt = new Date();
  }
  
  return this.save();
};

partySchema.methods.lowerHand = function(userId) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString() && !p.leftAt
  );
  
  if (participant) {
    participant.handRaised = false;
    participant.handRaisedAt = null;
  }
  
  return this.save();
};

partySchema.methods.addMessage = function(userId, message, type = 'text') {
  this.chat.messages.push({
    user: userId,
    message,
    type
  });
  
  this.analytics.totalMessages += 1;
  
  return this.save();
};

partySchema.methods.addReaction = function(userId, emoji) {
  this.reactions.push({
    user: userId,
    emoji
  });
  
  this.analytics.totalReactions += 1;
  
  return this.save();
};

partySchema.methods.startParty = function() {
  this.status = 'live';
  this.startedAt = new Date();
  return this.save();
};

partySchema.methods.endParty = function() {
  this.status = 'ended';
  this.endedAt = new Date();
  
  // Update all current participants
  this.participants.forEach(participant => {
    if (!participant.leftAt) {
      participant.leftAt = this.endedAt;
      participant.duration = Math.floor((participant.leftAt - participant.joinedAt) / 1000);
    }
  });
  
  this.currentParticipants = 0;
  
  return this.save();
};

partySchema.methods.blockUser = function(userId, blockedBy, reason = '') {
  // Remove from participants first
  this.removeParticipant(userId);
  
  // Add to blocked users
  this.blockedUsers.push({
    user: userId,
    blockedBy,
    reason,
    blockedAt: new Date()
  });
  
  return this.save();
};

partySchema.methods.addModerator = function(userId, addedBy) {
  if (!this.moderators.some(mod => mod.user.toString() === userId.toString())) {
    this.moderators.push({
      user: userId,
      addedBy,
      addedAt: new Date()
    });
  }
  
  return this.save();
};

partySchema.methods.removeModerator = function(userId) {
  this.moderators = this.moderators.filter(mod => 
    mod.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Static Methods
partySchema.statics.findPublicParties = function(options = {}) {
  const { limit = 20, skip = 0, category = null, status = 'live' } = options;
  
  const query = {
    privacy: 'public',
    status: status || 'live'
  };
  
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
    .populate('host', 'username fullName profilePicture')
    .populate('participants.user', 'username fullName profilePicture')
    .sort({ participantCount: -1, createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

partySchema.statics.findUserParties = function(userId, options = {}) {
  const { limit = 20, skip = 0, role = null } = options;
  
  const query = {
    'participants.user': userId,
    'participants.leftAt': { $exists: false }
  };
  
  if (role) {
    query['participants.role'] = role;
  }
  
  return this.find(query)
    .populate('host', 'username fullName profilePicture')
    .populate('participants.user', 'username fullName profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

partySchema.statics.findScheduledParties = function(options = {}) {
  const { limit = 20, skip = 0, upcoming = true } = options;
  
  const query = {
    isScheduled: true,
    status: 'scheduled'
  };
  
  if (upcoming) {
    query.scheduledFor = { $gte: new Date() };
  }
  
  return this.find(query)
    .populate('host', 'username fullName profilePicture')
    .sort({ scheduledFor: 1 })
    .limit(limit)
    .skip(skip);
};

partySchema.statics.generateInviteCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

module.exports = mongoose.model('Party', partySchema);
