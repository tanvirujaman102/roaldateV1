const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: String,
    media: [{
      type: {
        type: String,
        enum: ['image', 'video', 'audio', 'file', 'sticker', 'gif']
      },
      url: String,
      thumbnail: String,
      fileName: String,
      fileSize: Number,
      duration: Number, // For audio/video
      dimensions: {
        width: Number,
        height: Number
      }
    }],
    voiceMessage: {
      url: String,
      duration: Number,
      waveform: [Number] // Audio waveform data
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    contact: {
      name: String,
      phone: String,
      email: String
    },
    poll: {
      question: String,
      options: [{
        text: String,
        votes: [{
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          },
          votedAt: {
            type: Date,
            default: Date.now
          }
        }]
      }],
      multipleChoice: {
        type: Boolean,
        default: false
      },
      expiresAt: Date
    }
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  forwardFrom: {
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat'
    }
  },
  mentions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  }],
  reactions: [{
    emoji: String,
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isSecret: {
    type: Boolean,
    default: false
  },
  expiresAt: Date, // For disappearing messages
  editedAt: Date,
  deliveredTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastReadMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    mutedUntil: Date,
    isPinned: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    customNickname: String,
    customColor: String
  }],
  type: {
    type: String,
    enum: ['private', 'group', 'broadcast', 'channel'],
    default: 'private'
  },
  name: {
    type: String,
    maxlength: 100,
    required: function() {
      return this.type !== 'private';
    }
  },
  description: {
    type: String,
    maxlength: 500
  },
  avatar: String,
  settings: {
    isSecret: {
      type: Boolean,
      default: false
    },
    disappearingMessages: {
      enabled: {
        type: Boolean,
        default: false
      },
      timer: {
        type: Number,
        default: 86400 // 24 hours in seconds
      }
    },
    whoCanSendMessages: {
      type: String,
      enum: ['everyone', 'admins', 'nobody'],
      default: 'everyone'
    },
    whoCanEditMessages: {
      type: String,
      enum: ['everyone', 'admins', 'nobody'],
      default: 'everyone'
    },
    whoCanDeleteMessages: {
      type: String,
      enum: ['everyone', 'admins', 'nobody'],
      default: 'everyone'
    },
    whoCanAddMembers: {
      type: String,
      enum: ['everyone', 'admins'],
      default: 'everyone'
    }
  },
  messages: [messageSchema],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  typingUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isTyping: {
      type: Boolean,
      default: true
    },
    lastTyped: {
      type: Date,
      default: Date.now
    }
  }],
  onlineUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  },
  
  // Group specific fields
  groupInfo: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    inviteLink: String,
    isPublic: {
      type: Boolean,
      default: false
    },
    category: String,
    tags: [String],
    memberLimit: {
      type: Number,
      default: 200
    },
    requiresApproval: {
      type: Boolean,
      default: false
    },
    pendingRequests: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      requestedAt: {
        type: Date,
        default: Date.now
      },
      message: String
    }]
  },
  
  // Voice/Video Call specific
  activeCall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Call'
  },
  
  // Analytics
  analytics: {
    messagesCount: {
      type: Number,
      default: 0
    },
    mediaCount: {
      type: Number,
      default: 0
    },
    voiceCallCount: {
      type: Number,
      default: 0
    },
    videoCallCount: {
      type: Number,
      default: 0
    },
    totalCallDuration: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual Fields
chatSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

chatSchema.virtual('unreadCount').get(function() {
  // This would be calculated per user in the controller
  return 0;
});

chatSchema.virtual('isTyping').get(function() {
  return this.typingUsers.length > 0;
});

chatSchema.virtual('onlineCount').get(function() {
  return this.onlineUsers.length;
});

// Indexes
chatSchema.index({ participants: 1 });
chatSchema.index({ type: 1, lastActivity: -1 });
chatSchema.index({ 'groupInfo.isPublic': 1, isActive: 1 });
chatSchema.index({ isActive: 1, isArchived: 1 });

// Methods
chatSchema.methods.addMessage = function(messageData) {
  const message = {
    ...messageData,
    sender: messageData.sender
  };
  
  this.messages.push(message);
  this.lastMessage = this.messages[this.messages.length - 1];
  this.lastActivity = new Date();
  this.analytics.messagesCount += 1;
  
  return this.save();
};

chatSchema.methods.addParticipant = function(userId, role = 'member') {
  const existingParticipant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (!existingParticipant) {
    this.participants.push({
      user: userId,
      role,
      joinedAt: new Date()
    });
  }
  
  return this.save();
};

chatSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => 
    p.user.toString() !== userId.toString()
  );
  
  return this.save();
};

chatSchema.methods.markAsRead = function(userId, messageId) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.lastReadMessage = messageId;
  }
  
  return this.save();
};

chatSchema.methods.setTyping = function(userId, isTyping = true) {
  const existingTypingUser = this.typingUsers.find(u => 
    u.user.toString() === userId.toString()
  );
  
  if (isTyping) {
    if (!existingTypingUser) {
      this.typingUsers.push({
        user: userId,
        isTyping: true,
        lastTyped: new Date()
      });
    } else {
      existingTypingUser.lastTyped = new Date();
    }
  } else {
    this.typingUsers = this.typingUsers.filter(u => 
      u.user.toString() !== userId.toString()
    );
  }
  
  return this.save();
};

chatSchema.methods.setOnlineStatus = function(userId, isOnline = true) {
  if (isOnline) {
    if (!this.onlineUsers.includes(userId)) {
      this.onlineUsers.push(userId);
    }
  } else {
    this.onlineUsers = this.onlineUsers.filter(id => 
      id.toString() !== userId.toString()
    );
  }
  
  return this.save();
};

// Static Methods
chatSchema.statics.findUserChats = function(userId, options = {}) {
  const { limit = 20, skip = 0, type = null } = options;
  
  const query = {
    'participants.user': userId,
    isActive: true,
    isArchived: false
  };
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query)
    .populate('participants.user', 'username fullName profilePicture onlineStatus')
    .populate('lastMessage')
    .sort({ lastActivity: -1 })
    .limit(limit)
    .skip(skip);
};

chatSchema.statics.findPrivateChat = function(user1Id, user2Id) {
  return this.findOne({
    type: 'private',
    'participants.user': { $all: [user1Id, user2Id] },
    isActive: true
  }).populate('participants.user', 'username fullName profilePicture');
};

chatSchema.statics.findPublicGroups = function(options = {}) {
  const { limit = 20, skip = 0, category = null } = options;
  
  const query = {
    type: 'group',
    'groupInfo.isPublic': true,
    isActive: true,
    isArchived: false
  };
  
  if (category) {
    query['groupInfo.category'] = category;
  }
  
  return this.find(query)
    .populate('participants.user', 'username fullName profilePicture')
    .sort({ 'analytics.messagesCount': -1 })
    .limit(limit)
    .skip(skip);
};

const Message = mongoose.model('Message', messageSchema);
const Chat = mongoose.model('Chat', chatSchema);

module.exports = { Chat, Message };
