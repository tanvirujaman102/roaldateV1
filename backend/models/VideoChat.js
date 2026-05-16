const mongoose = require('mongoose');

const videoChatSessionSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    socketId: String,
    mediaState: {
      videoEnabled: {
        type: Boolean,
        default: true
      },
      audioEnabled: {
        type: Boolean,
        default: true
      },
      screenSharing: {
        type: Boolean,
        default: false
      },
      faceBlur: {
        type: Boolean,
        default: false
      }
    },
    connectionState: {
      type: String,
      enum: ['connecting', 'connected', 'disconnected', 'reconnecting'],
      default: 'connecting'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: Date,
    duration: Number, // Duration in seconds
    quality: {
      resolution: String,
      bitrate: Number,
      fps: Number
    }
  }],
  type: {
    type: String,
    enum: ['random', 'scheduled', 'instant', 'party'],
    required: true
  },
  settings: {
    maxDuration: Number, // Maximum duration in minutes
    allowRecording: {
      type: Boolean,
      default: false
    },
    requireVerification: {
      type: Boolean,
      default: false
    },
    ageRestriction: Number,
    genderFilter: {
      enabled: {
        type: Boolean,
        default: false
      },
      preference: String
    },
    countryFilter: {
      enabled: {
        type: Boolean,
        default: false
      },
      countries: [String]
    },
    interestMatching: {
      enabled: {
        type: Boolean,
        default: false
      },
      interests: [String]
    }
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'ended', 'cancelled'],
    default: 'waiting'
  },
  startedAt: Date,
  endedAt: Date,
  duration: Number, // Total duration in seconds
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // WebRTC Signaling
  signaling: {
    offer: String,
    answer: String,
    iceCandidates: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      candidate: String,
      type: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Recording
  recording: {
    isRecording: {
      type: Boolean,
      default: false
    },
    recordingUrl: String,
    recordingStartedAt: Date,
    recordingEndedAt: Date,
    recordingSize: Number,
    thumbnailUrl: String
  },
  
  // Quality Metrics
  qualityMetrics: {
    averageLatency: Number,
    packetLoss: Number,
    bandwidth: Number,
    connectionStability: Number,
    videoQuality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
      default: 'good'
    },
    audioQuality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
      default: 'good'
    }
  },
  
  // Reports and Moderation
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
      enum: ['inappropriate_content', 'harassment', 'spam', 'fake_profile', 'other'],
      required: true
    },
    description: String,
    evidence: String, // Screenshot or recording URL
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
  
  // Anonymous Mode
  anonymousMode: {
    enabled: {
      type: Boolean,
      default: false
    },
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      anonymousId: String,
      showFace: Boolean
    }]
  },
  
  // AI Moderation
  aiModeration: {
    enabled: {
      type: Boolean,
      default: true
    },
    alerts: [{
      type: {
        type: String,
        enum: ['inappropriate_language', 'nudity_detected', 'violence_detected', 'spam_detected']
      },
      confidence: Number,
      timestamp: {
        type: Date,
        default: Date.now
      },
      action: {
        type: String,
        enum: ['warning', 'blur', 'disconnect', 'report'],
        default: 'warning'
      }
    }],
    autoActions: {
      blurInappropriate: {
        type: Boolean,
        default: true
      },
      disconnectOnViolation: {
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

const randomChatQueueSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  socketId: {
    type: String,
    required: true
  },
  preferences: {
    gender: {
      type: String,
      enum: ['male', 'female', 'any'],
      default: 'any'
    },
    country: String,
    ageRange: {
      min: Number,
      max: Number
    },
    interests: [String],
    language: String
  },
  status: {
    type: String,
    enum: ['waiting', 'matched', 'chatting', 'disconnected'],
    default: 'waiting'
  },
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoChatSession'
  },
  waitTime: {
    type: Number,
    default: 0
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  matchedAt: Date,
  disconnectedAt: Date
}, {
  timestamps: true
});

const videoCallSchema = new mongoose.Schema({
  caller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['audio', 'video'],
    required: true
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'accepted', 'declined', 'ended', 'missed'],
    default: 'initiated'
  },
  startTime: Date,
  endTime: Date,
  duration: Number, // Duration in seconds
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoChatSession'
  },
  
  // Call Quality
  quality: {
    videoResolution: String,
    audioQuality: String,
    connectionStability: Number,
    dataUsage: Number
  },
  
  // Recording
  isRecorded: {
    type: Boolean,
    default: false
  },
  recordingUrl: String,
  
  // Missed Call Info
  missedCallReason: String,
  
  // Call History
  isFromContact: {
    type: Boolean,
    default: false
  },
  
  // Group Call Support
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: Date,
    leftAt: Date,
    duration: Number
  }]
}, {
  timestamps: true
});

// Virtual Fields
videoChatSessionSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

videoChatSessionSchema.virtual('activeParticipants').get(function() {
  return this.participants.filter(p => p.connectionState === 'connected').length;
});

videoChatSessionSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

videoCallSchema.virtual('isMissed').get(function() {
  return this.status === 'missed';
});

videoCallSchema.virtual('isOngoing').get(function() {
  return this.status === 'accepted' && !this.endTime;
});

// Indexes
videoChatSessionSchema.index({ participants: 1 });
videoChatSessionSchema.index({ type: 1, status: 1 });
videoChatSessionSchema.index({ startedAt: -1 });
videoChatSessionSchema.index({ 'reports.timestamp': -1 });

randomChatQueueSchema.index({ user: 1 });
randomChatQueueSchema.index({ status: 1, joinedAt: 1 });
randomChatQueueSchema.index({ 'preferences.gender': 1, 'preferences.country': 1 });

videoCallSchema.index({ caller: 1, receiver: 1 });
videoCallSchema.index({ status: 1, startTime: -1 });

// Methods
videoChatSessionSchema.methods.addParticipant = function(userId, socketId) {
  const existingParticipant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (!existingParticipant) {
    this.participants.push({
      user: userId,
      socketId,
      joinedAt: new Date()
    });
  }
  
  return this.save();
};

videoChatSessionSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.leftAt = new Date();
    participant.duration = Math.floor((participant.leftAt - participant.joinedAt) / 1000);
    participant.connectionState = 'disconnected';
  }
  
  return this.save();
};

videoChatSessionSchema.methods.updateMediaState = function(userId, mediaState) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.mediaState = { ...participant.mediaState, ...mediaState };
  }
  
  return this.save();
};

videoChatSessionSchema.methods.addReport = function(reporterId, reportedUserId, reason, description) {
  this.reports.push({
    reporter: reporterId,
    reportedUser: reportedUserId,
    reason,
    description,
    timestamp: new Date()
  });
  
  return this.save();
};

videoCallSchema.methods.accept = function() {
  this.status = 'accepted';
  this.startTime = new Date();
  return this.save();
};

videoCallSchema.methods.decline = function() {
  this.status = 'declined';
  this.endTime = new Date();
  return this.save();
};

videoCallSchema.methods.end = function() {
  this.status = 'ended';
  this.endTime = new Date();
  if (this.startTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  return this.save();
};

// Static Methods
videoChatSessionSchema.statics.findActiveSessions = function() {
  return this.find({ status: 'active' })
    .populate('participants.user', 'username fullName profilePicture')
    .sort({ startedAt: -1 });
};

videoChatSessionSchema.statics.findUserSessions = function(userId, options = {}) {
  const { limit = 20, skip = 0, type = null } = options;
  
  const query = {
    'participants.user': userId
  };
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query)
    .populate('participants.user', 'username fullName profilePicture')
    .sort({ startedAt: -1 })
    .limit(limit)
    .skip(skip);
};

randomChatQueueSchema.statics.findWaitingUsers = function(preferences = {}) {
  const query = {
    status: 'waiting'
  };
  
  // Add preference filters
  if (preferences.gender && preferences.gender !== 'any') {
    query['preferences.gender'] = preferences.gender;
  }
  
  if (preferences.country) {
    query['preferences.country'] = preferences.country;
  }
  
  return this.find(query)
    .populate('user', 'username fullName profilePicture')
    .sort({ joinedAt: 1 });
};

videoCallSchema.statics.findUserCalls = function(userId, options = {}) {
  const { limit = 20, skip = 0, type = null } = options;
  
  const query = {
    $or: [
      { caller: userId },
      { receiver: userId }
    ]
  };
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query)
    .populate('caller receiver', 'username fullName profilePicture')
    .sort({ startTime: -1 })
    .limit(limit)
    .skip(skip);
};

const VideoChatSession = mongoose.model('VideoChatSession', videoChatSessionSchema);
const RandomChatQueue = mongoose.model('RandomChatQueue', randomChatQueueSchema);
const VideoCall = mongoose.model('VideoCall', videoCallSchema);

module.exports = {
  VideoChatSession,
  RandomChatQueue,
  VideoCall
};
